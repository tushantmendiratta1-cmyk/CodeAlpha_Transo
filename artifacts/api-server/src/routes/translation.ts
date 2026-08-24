import { Router, type IRouter, type Request } from "express";
import { ListLanguagesResponse, TranslateTextBody, TranslateTextResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const MAX_CHUNK_LENGTH = 4500;
const WINDOW_MS = 60_000;
const REQUESTS_PER_WINDOW = 20;
const requestLog = new Map<string, number[]>();

type Language = {
  code: string;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
};

const languages: Language[] = [
  ["en", "English", "English", "ltr"], ["hi", "Hindi", "हिन्दी", "ltr"],
  ["es", "Spanish", "Español", "ltr"], ["fr", "French", "Français", "ltr"],
  ["de", "German", "Deutsch", "ltr"], ["it", "Italian", "Italiano", "ltr"],
  ["pt", "Portuguese", "Português", "ltr"], ["ja", "Japanese", "日本語", "ltr"],
  ["ko", "Korean", "한국어", "ltr"], ["zh", "Chinese", "中文", "ltr"],
  ["ar", "Arabic", "العربية", "rtl"], ["he", "Hebrew", "עברית", "rtl"],
  ["ru", "Russian", "Русский", "ltr"], ["nl", "Dutch", "Nederlands", "ltr"],
  ["tr", "Turkish", "Türkçe", "ltr"], ["bn", "Bengali", "বাংলা", "ltr"],
  ["ta", "Tamil", "தமிழ்", "ltr"], ["te", "Telugu", "తెలుగు", "ltr"],
  ["mr", "Marathi", "मराठी", "ltr"], ["id", "Indonesian", "Bahasa Indonesia", "ltr"],
  ["vi", "Vietnamese", "Tiếng Việt", "ltr"], ["pl", "Polish", "Polski", "ltr"],
  ["uk", "Ukrainian", "Українська", "ltr"], ["fa", "Persian", "فارسی", "rtl"],
].map(([code, name, nativeName, direction]) => ({ code, name, nativeName, direction: direction as "ltr" | "rtl" }));

function clientKey(req: Request) {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function allowed(req: Request) {
  const now = Date.now();
  const key = clientKey(req);
  const recent = (requestLog.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= REQUESTS_PER_WINDOW) return false;
  recent.push(now);
  requestLog.set(key, recent);
  return true;
}

function chunkText(text: string): string[] {
  if (text.length <= MAX_CHUNK_LENGTH) return [text];
  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > MAX_CHUNK_LENGTH) {
    const window = remaining.slice(0, MAX_CHUNK_LENGTH);
    const boundary = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf(". "), window.lastIndexOf(" "));
    const cut = boundary > MAX_CHUNK_LENGTH * 0.45 ? boundary + (window[boundary] === "." ? 1 : 0) : MAX_CHUNK_LENGTH;
    chunks.push(remaining.slice(0, cut));
    remaining = remaining.slice(cut);
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function translateGoogle(text: string, source: string | null, target: string) {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("Google Cloud Translation is not configured");
  const response = await fetchWithTimeout(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q: text, target, ...(source ? { source } : {}) }),
  });
  if (!response.ok) throw new Error("Google Translation request failed");
  const json = await response.json() as { data?: { translations?: Array<{ translatedText?: string; detectedLanguage?: string }> } };
  const translation = json.data?.translations?.[0]?.translatedText;
  if (!translation) throw new Error("Google Translation returned no result");
  return { translation, detectedLanguage: json.data?.translations?.[0]?.detectedLanguage ?? source ?? "auto" };
}

async function translateMyMemory(text: string, source: string | null, target: string) {
  const pair = `${source ?? "auto"}|${target}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) throw new Error("Translation provider request failed");
  const json = await response.json() as { responseData?: { translatedText?: string; detectedLanguage?: string }; responseStatus?: number };
  const translation = json.responseData?.translatedText;
  if (!translation || json.responseStatus !== 200) throw new Error("Translation provider returned no result");
  return { translation, detectedLanguage: json.responseData?.detectedLanguage ?? source ?? "auto" };
}

router.get("/languages", (_req, res) => {
  res.json(ListLanguagesResponse.parse({ languages }));
});

router.post("/translate", async (req, res) => {
  if (!allowed(req)) {
    res.status(429).json({ error: "Too many translation requests. Please wait a moment and try again." });
    return;
  }
  const parsed = TranslateTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please provide text and a valid target language." });
    return;
  }
  const { text, targetLanguage, preserveFormatting } = parsed.data;
  const sourceLanguage = parsed.data.sourceLanguage ?? null;
  if (sourceLanguage === targetLanguage) {
    res.json(TranslateTextResponse.parse({ translation: text, detectedLanguage: sourceLanguage, sourceLanguage, targetLanguage, provider: "same-language" }));
    return;
  }
  try {
    const provider = process.env.TRANSLATION_PROVIDER ?? "mymemory";
    const chunks = chunkText(text);
    const results: string[] = [];
    let detectedLanguage = sourceLanguage ?? "auto";
    for (const chunk of chunks) {
      const result = provider === "google"
        ? await translateGoogle(chunk, sourceLanguage, targetLanguage)
        : await translateMyMemory(chunk, sourceLanguage, targetLanguage);
      results.push(result.translation);
      if (!sourceLanguage && result.detectedLanguage !== "auto") detectedLanguage = result.detectedLanguage;
    }
    const translation = preserveFormatting ? results.join("") : results.join(" ");
    res.json(TranslateTextResponse.parse({
      translation,
      detectedLanguage,
      sourceLanguage: sourceLanguage ?? detectedLanguage,
      targetLanguage,
      provider,
    }));
  } catch {
    res.status(503).json({ error: "Translation unavailable. We couldn’t translate your text right now. Please try again in a moment." });
  }
});

export default router;