import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowDownUp,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Download,
  Globe2,
  Languages,
  Menu,
  Mic,
  Moon,
  PenLine,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Square,
  Sun,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import {
  getHealthCheckQueryKey,
  getListLanguagesQueryKey,
  useHealthCheck,
  useListLanguages,
  useTranslateText,
} from '@workspace/api-client-react';
import type { Language, TranslationResult } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const fallbackLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr' },
];

function Logo() {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" data-testid="link-logo">
      <span className="relative grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] transition-transform duration-300 group-hover:-rotate-6">
        <span className="absolute h-4.5 w-4.5 rounded-full border-2 border-current border-r-transparent" />
        <span className="absolute h-4.5 w-4.5 rotate-180 rounded-full border-2 border-current border-r-transparent" />
        <span className="size-1.5 rounded-full bg-current" />
      </span>
      <span className="font-serif text-[1.35rem] font-bold tracking-[-0.07em] text-foreground">transo</span>
    </Link>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('transo-theme', next ? 'dark' : 'light');
  };
  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={dark ? 'Use light theme' : 'Use dark theme'}
      data-testid="button-theme-toggle"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const links = [
    { href: '/about', label: 'About' },
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
  ];
  return (
    <header className="relative z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.75rem] max-w-[1280px] items-center justify-between px-5 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[0.72rem] font-bold uppercase tracking-[0.16em] transition-colors hover:text-foreground ${location === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
              data-testid={`link-nav-${link.label.toLowerCase()}`}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/#translator"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-xs font-bold text-background transition-transform hover:-translate-y-0.5"
            data-testid="link-nav-translate"
          >
            Start translating <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid size-9 place-items-center rounded-full border border-border"
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-testid="button-mobile-menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#translator"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl bg-primary px-3 py-3 text-center text-sm font-bold text-primary-foreground"
              data-testid="link-mobile-translate"
            >
              Start translating
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

function LanguagePicker({
  label,
  value,
  languages,
  onChange,
  auto = false,
}: {
  label: string;
  value: string;
  languages: Language[];
  onChange: (value: string) => void;
  auto?: boolean;
}) {
  const selected = languages.find((language) => language.code === value);
  return (
    <label className="group relative block min-w-0" data-testid={`label-language-${label.toLowerCase()}`}>
      <span className="mb-1 block text-[0.62rem] font-bold uppercase tracking-[0.17em] text-muted-foreground">{label}</span>
      <span className="relative flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/15 text-[0.62rem] font-black text-primary">
          {auto ? 'A' : (selected?.code || value).slice(0, 2).toUpperCase()}
        </span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none bg-transparent pr-6 text-sm font-bold text-foreground outline-none"
          data-testid={`select-language-${label.toLowerCase()}`}
        >
          {auto && <option value="auto">Detect language</option>}
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name} · {language.nativeName}
            </option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-0 text-muted-foreground" />
      </span>
    </label>
  );
}

function LanguageLoading() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" data-testid="status-languages-loading">
      <span className="size-2 animate-pulse rounded-full bg-primary" /> Loading language map
    </div>
  );
}

function Translator() {
  const languagesQuery = useListLanguages({
    query: { queryKey: getListLanguagesQueryKey() },
  });
  const healthQuery = useHealthCheck({
    query: { queryKey: getHealthCheckQueryKey() },
  });
  const translateMutation = useTranslateText();
  const languages = languagesQuery.data?.languages ?? fallbackLanguages;
  const [text, setText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [history, setHistory] = useState<Array<{ source: string; translation: string; sourceLanguage: string; targetLanguage: string; createdAt: number }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('transo-history') ?? '[]');
    } catch {
      return [];
    }
  });
  const result = translateMutation.data as TranslationResult | undefined;

  useEffect(() => {
    if (!result?.translation || !text.trim()) return;
    const item = { source: text.trim(), translation: result.translation, sourceLanguage: result.sourceLanguage, targetLanguage: result.targetLanguage, createdAt: Date.now() };
    setHistory((current) => {
      const next = [item, ...current.filter((entry) => entry.source !== item.source || entry.targetLanguage !== item.targetLanguage)].slice(0, 8);
      localStorage.setItem('transo-history', JSON.stringify(next));
      return next;
    });
  }, [result?.translation]);

  const sourceDisplay = useMemo(() => {
    if (sourceLanguage === 'auto') return result?.detectedLanguage ? languageName(result.detectedLanguage, languages) : 'Auto-detect';
    return languageName(sourceLanguage, languages);
  }, [languages, result?.detectedLanguage, sourceLanguage]);

  const submitTranslation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim() || translateMutation.isPending) return;
    translateMutation.mutate({
      data: {
        text: text.trim(),
        sourceLanguage: sourceLanguage === 'auto' ? null : sourceLanguage,
        targetLanguage,
        preserveFormatting,
      },
    });
  };

  const copyResult = async () => {
    if (!result?.translation) return;
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(result.translation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const downloadResult = () => {
    if (!result?.translation) return;
    const blob = new Blob([result.translation], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'transo-translation.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const speakResult = () => {
    if (!result?.translation || !('speechSynthesis' in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(result.translation);
    utterance.lang = `${result.targetLanguage}-${result.targetLanguage.toUpperCase()}`;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const swapLanguages = () => {
    if (sourceLanguage === 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(result?.detectedLanguage || 'en');
    } else {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
    }
  };

  const clearAll = () => {
    setText('');
    translateMutation.reset();
    setCopied(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const restoreHistory = (item: typeof history[number]) => {
    setText(item.source);
    setSourceLanguage(item.sourceLanguage || 'auto');
    setTargetLanguage(item.targetLanguage);
    translateMutation.reset();
    document.getElementById('translator')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <section id="translator" className="relative mx-auto max-w-[1280px] scroll-mt-24 px-5 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-16">
      <div className="pointer-events-none absolute -left-24 top-32 hidden size-64 rounded-full border border-primary/20 lg:block" />
      <div className="pointer-events-none absolute right-12 top-14 hidden size-3 rounded-full bg-accent transo-pulse lg:block" />
      <div className="mb-7 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <span className={`size-2 rounded-full ${healthQuery.data?.status ? 'bg-secondary' : 'bg-primary'} ${healthQuery.isLoading ? 'animate-pulse' : ''}`} />
          {healthQuery.data?.status ? 'Translation engine online' : 'Ready when you are'}
        </div>
        {languagesQuery.isLoading ? <LanguageLoading /> : languagesQuery.isError ? (
          <span className="hidden text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:block" data-testid="status-languages-error">
            Showing essential languages
          </span>
        ) : (
          <span className="hidden text-[0.66rem] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:block" data-testid="text-language-count">
            {languages.length} languages in the map
          </span>
        )}
      </div>
      <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20">
        <div className="transo-rise max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[0.63rem] font-bold uppercase tracking-[0.14em] text-muted-foreground shadow-sm">
            <Sparkles size={13} className="text-primary" /> Language, with feeling
          </div>
          <h1 className="font-serif text-[clamp(3.6rem,8vw,7.9rem)] font-bold leading-[0.86] tracking-[-0.085em] text-foreground">
            Say it like
            <span className="block text-primary">you mean it.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">
            Transo turns the words in your head into the words someone else can feel. Clear, quick translation for classrooms, city streets, and everywhere between.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold text-foreground">
            <span className="inline-flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-secondary/15 text-secondary"><Globe2 size={13} /></span> Made for everywhere</span>
            <span className="inline-flex items-center gap-2"><span className="grid size-6 place-items-center rounded-full bg-accent/15 text-accent"><ShieldCheck size={13} /></span> No account needed</span>
          </div>
        </div>

        <form onSubmit={submitTranslation} className="relative transo-rise [animation-delay:120ms]" data-testid="form-translator">
          <div className="absolute -right-3 -top-3 z-10 hidden rotate-3 rounded-full bg-accent px-3 py-2 text-[0.62rem] font-black uppercase tracking-[0.12em] text-accent-foreground shadow-[3px_3px_0_hsl(var(--foreground))] sm:block">
            Just add words
          </div>
          <div className="overflow-hidden rounded-[1.4rem] border border-border bg-card shadow-[0_18px_50px_hsl(var(--foreground)/.09)]">
            <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
              <div className="min-h-[15rem] p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between">
                  <LanguagePicker label="From" value={sourceLanguage} languages={languages} onChange={setSourceLanguage} auto />
                  <button type="button" onClick={clearAll} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Clear translation" data-testid="button-clear-translation">
                    <RotateCcw size={15} />
                  </button>
                </div>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Write something worth saying..."
                  maxLength={50000}
                  className="min-h-28 w-full resize-none bg-transparent text-[1.2rem] font-semibold leading-8 text-foreground outline-none placeholder:text-muted-foreground/55"
                  data-testid="input-translation-text"
                />
                <div className="mt-3 flex items-center justify-between text-[0.67rem] font-semibold text-muted-foreground">
                  <button type="button" disabled className="inline-flex cursor-not-allowed items-center gap-1.5 text-muted-foreground/70" data-testid="button-voice-input">
                    <Mic size={14} /> Voice input <span className="rounded bg-muted px-1.5 py-0.5 text-[0.56rem] uppercase">Soon</span>
                  </button>
                  <span data-testid="text-character-count">{text.length.toLocaleString()} chars · {text.trim() ? text.trim().split(/\s+/u).length : 0} words</span>
                </div>
              </div>
              <div className="relative min-h-[15rem] bg-secondary/[.055] p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between">
                  <LanguagePicker label="Into" value={targetLanguage} languages={languages} onChange={setTargetLanguage} />
                  <button type="button" onClick={swapLanguages} className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary/15 hover:text-secondary" aria-label="Swap languages" data-testid="button-swap-languages">
                    <ArrowDownUp size={15} />
                  </button>
                </div>
                {translateMutation.isPending ? (
                  <div className="space-y-3 pt-2" data-testid="status-translation-loading">
                    <div className="h-5 w-4/5 animate-pulse rounded bg-secondary/15" />
                    <div className="h-5 w-3/5 animate-pulse rounded bg-secondary/15" />
                    <div className="h-5 w-2/5 animate-pulse rounded bg-secondary/15" />
                  </div>
                ) : result?.translation ? (
                  <div className="transo-rise" data-testid="text-translation-result">
                    <p className="text-[1.2rem] font-semibold leading-8 text-foreground">{result.translation}</p>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <span className="text-[0.63rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                        {result.provider ? `via ${result.provider}` : 'Translation ready'}
                      </span>
                      <button type="button" onClick={copyResult} className="inline-flex items-center gap-1.5 rounded-lg bg-card px-2.5 py-2 text-xs font-bold text-foreground shadow-sm transition-transform hover:-translate-y-0.5" data-testid="button-copy-translation">
                        {copied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button type="button" onClick={downloadResult} className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-foreground" aria-label="Download translation" data-testid="button-download-translation"><Download size={15} /></button>
                      <button type="button" onClick={speakResult} className="rounded-lg p-2 text-muted-foreground hover:bg-card hover:text-foreground" aria-label={speaking ? 'Stop listening' : 'Listen to translation'} data-testid="button-speak-translation">{speaking ? <Square size={14} /> : <Volume2 size={15} />}</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-28 flex-col justify-center text-muted-foreground" data-testid="text-translation-empty">
                    <span className="mb-2 font-serif text-2xl italic text-foreground/70">Your meaning,</span>
                    <span className="text-sm">translated with care.</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground" data-testid="label-preserve-formatting">
                <input type="checkbox" checked={preserveFormatting} onChange={(event) => setPreserveFormatting(event.target.checked)} className="size-4 accent-[hsl(var(--primary))]" data-testid="input-preserve-formatting" />
                Preserve formatting
              </label>
              <button
                type="submit"
                disabled={!text.trim() || translateMutation.isPending}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-[3px_3px_0_hsl(var(--foreground))] transition-all hover:-translate-y-0.5 hover:shadow-[4px_5px_0_hsl(var(--foreground))] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
                data-testid="button-translate"
              >
                {translateMutation.isPending ? 'Finding the words' : 'Translate'} <Send size={15} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
          {translateMutation.isError && (
            <div className="mt-3 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive" role="alert" data-testid="status-translation-error">
              We couldn’t translate that right now. Check your connection and try again.
            </div>
          )}
          <div className="mt-3 flex justify-end text-[0.62rem] font-semibold text-muted-foreground">
            {sourceLanguage === 'auto' ? 'Detecting from your words' : `${sourceDisplay} → ${languageName(targetLanguage, languages)}`}
          </div>
        </form>
      </div>
      {history.length > 0 && (
        <div className="mt-10 border-t border-border pt-6" data-testid="section-history">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="text-[0.63rem] font-black uppercase tracking-[0.18em] text-secondary">Saved in this browser</p><h2 className="mt-1 font-serif text-2xl font-bold tracking-[-.04em]">Recent translations</h2></div>
            <button type="button" onClick={() => { setHistory([]); localStorage.removeItem('transo-history'); }} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive" data-testid="button-clear-history"><Trash2 size={13} /> Clear all</button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {history.slice(0, 4).map((item) => (
              <button type="button" key={`${item.createdAt}-${item.targetLanguage}`} onClick={() => restoreHistory(item)} className="group rounded-xl border border-border bg-card p-4 text-left transition-transform hover:-translate-y-0.5 hover:border-primary/50" data-testid="button-history-item">
                <div className="mb-2 flex items-center justify-between text-[0.6rem] font-black uppercase tracking-[0.14em] text-muted-foreground"><span>{languageName(item.sourceLanguage, languages)} → {languageName(item.targetLanguage, languages)}</span><ArrowRight size={12} className="transition-transform group-hover:translate-x-1" /></div>
                <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.source}</p><p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.translation}</p>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[0.65rem] text-muted-foreground">History stays in this browser and is never sent to Transo.</p>
        </div>
      )}
    </section>
  );
}

function Home() {
  return (
    <div className="transo-noise overflow-hidden">
      <Header />
      <main>
        <div className="relative">
          <div className="transo-grid pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-70" />
          <Translator />
        </div>
        <section className="border-y border-border bg-foreground text-background">
          <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-background/15 lg:px-10">
            <Stat value="50k" label="characters, no fuss" />
            <Stat value="10+" label="languages and growing" />
            <Stat value="1 tap" label="to take it with you" />
          </div>
        </section>
        <section className="mx-auto max-w-[1280px] px-5 py-24 lg:px-10 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="mb-5 text-[0.65rem] font-black uppercase tracking-[0.2em] text-secondary">The Transo way</p>
              <h2 className="font-serif text-5xl font-bold leading-[.93] tracking-[-.07em] sm:text-6xl">Less dictionary.<br /><span className="text-primary">More doorway.</span></h2>
            </div>
            <div className="grid gap-9 sm:grid-cols-2">
              <Feature number="01" icon={<PenLine size={18} />} title="Start messy" body="Fragments, context, half a thought — you don’t need to write like a textbook." />
              <Feature number="02" icon={<Languages size={18} />} title="Find the feeling" body="Transo gets you past literal words and closer to what you actually mean." />
              <Feature number="03" icon={<Clipboard size={18} />} title="Take it anywhere" body="Copy a line for class, a message for a friend, or directions for the long way home." />
              <Feature number="04" icon={<Globe2 size={18} />} title="Stay curious" body="Every translation is a tiny invitation to see a familiar idea differently." />
            </div>
          </div>
        </section>
        <section className="bg-primary px-5 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1fr_.85fr] lg:gap-24">
            <div>
              <div className="mb-6 flex items-center gap-3 text-primary-foreground/70">
                <span className="h-px w-10 bg-primary-foreground/50" /><span className="text-[0.65rem] font-black uppercase tracking-[0.2em]">A small superpower</span>
              </div>
              <h2 className="max-w-2xl font-serif text-5xl font-bold leading-[.91] tracking-[-.07em] text-primary-foreground sm:text-7xl">The right words open more doors.</h2>
              <p className="mt-7 max-w-lg text-base leading-7 text-primary-foreground/75">Built for the student who wants to read beyond their syllabus, the traveler who got off at the wrong stop, and anyone who knows that language is a bridge — not a barrier.</p>
              <Link href="/about" className="mt-9 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition-transform hover:-translate-y-1" data-testid="link-home-about">
                Meet the project <ArrowRight size={15} />
              </Link>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[27rem]">
              <div className="absolute inset-[12%] rounded-full border border-primary-foreground/35" />
              <div className="absolute inset-[25%] rounded-full border border-primary-foreground/30" />
              <div className="absolute inset-[39%] rounded-full bg-background shadow-[0_0_0_1px_hsl(var(--primary-foreground)/.3)]" />
              <div className="absolute left-[7%] top-[16%] rounded-full bg-background px-4 py-2 text-xs font-black text-foreground transo-float">hola</div>
              <div className="absolute right-[3%] top-[40%] rounded-full bg-accent px-4 py-2 text-xs font-black text-accent-foreground transo-float [animation-delay:900ms]">你好</div>
              <div className="absolute bottom-[13%] left-[19%] rounded-full bg-secondary px-4 py-2 text-xs font-black text-secondary-foreground transo-float [animation-delay:1.4s]">bonjour</div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-serif text-6xl font-bold tracking-[-.08em] text-foreground">transo</div>
                  <div className="mt-1 text-[0.6rem] font-black uppercase tracking-[.22em] text-muted-foreground">words in motion</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1280px] px-5 py-20 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between gap-8 border-b border-border pb-9 sm:flex-row sm:items-end">
            <div><p className="mb-4 text-[0.65rem] font-black uppercase tracking-[0.2em] text-accent">Made to be useful</p><h2 className="font-serif text-4xl font-bold tracking-[-.06em] sm:text-5xl">Tiny details. Real momentum.</h2></div>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">No onboarding maze. No mysterious buttons. Just a clear place to begin.</p>
          </div>
          <div className="grid gap-0 pt-2 sm:grid-cols-3 sm:divide-x sm:divide-border">
            <Principle title="Write naturally" detail="Keep your punctuation, your line breaks, your voice." />
            <Principle title="See what happened" detail="Know the detected language and provider behind each result." />
            <Principle title="Stay in control" detail="Your text is sent only when you press translate." />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="flex items-baseline gap-3 px-0 sm:px-8 first:sm:pl-0 last:sm:pr-0"><strong className="font-serif text-3xl font-bold tracking-[-.06em] text-primary">{value}</strong><span className="text-xs font-semibold text-background/60">{label}</span></div>;
}

function Feature({ number, icon, title, body }: { number: string; icon: ReactNode; title: string; body: string }) {
  return <article className="group"><div className="mb-4 flex items-center justify-between text-muted-foreground"><span className="font-mono text-[0.65rem]">{number}</span><span className="grid size-8 place-items-center rounded-full bg-muted text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">{icon}</span></div><h3 className="mb-2 text-base font-black">{title}</h3><p className="text-sm leading-6 text-muted-foreground">{body}</p></article>;
}

function Principle({ title, detail }: { title: string; detail: string }) {
  return <article className="py-7 sm:px-8"><h3 className="mb-2 text-sm font-black">{title}</h3><p className="max-w-xs text-sm leading-6 text-muted-foreground">{detail}</p></article>;
}

function Footer() {
  return <footer className="border-t border-border px-5 py-8 lg:px-10"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 text-xs text-muted-foreground sm:flex-row sm:items-center"><div className="flex items-center gap-2 font-semibold"><span className="grid size-5 place-items-center rounded-md bg-primary text-[0.55rem] font-black text-primary-foreground">t</span> © {new Date().getFullYear()} Transo</div><div className="flex gap-5 font-semibold"><Link href="/privacy" className="hover:text-foreground" data-testid="link-footer-privacy">Privacy</Link><Link href="/terms" className="hover:text-foreground" data-testid="link-footer-terms">Terms</Link><span>Made for the in-between</span></div></div></footer>;
}

function About() {
  return <InfoPage eyebrow="The project" title={<>A better bridge between<br /><span className="text-primary">what we say and mean.</span></>} intro="Transo is an open-hearted translation tool for people in motion. It is designed around the moment after a translation: the moment you feel confident enough to continue the conversation." accent="secondary">
    <InfoSection title="Why Transo exists" number="01"><p>Language tools often optimize for output. Transo starts with the person on the other side of the sentence — a student trying to understand a paper, a traveler ordering lunch, a friend choosing the right words.</p><p>That means a focused interface, useful context, and no performance theater. Put your words in. Get a clear doorway out.</p></InfoSection>
    <InfoSection title="A small, honest architecture" number="02"><p>The web app keeps the interaction deliberately simple. Supported languages come from the API, translation requests are sent only when you ask, and the returned result tells you which provider handled it.</p><div className="mt-7 grid gap-3 sm:grid-cols-3"><Architecture label="Your words" detail="A focused input" /><Architecture label="Transo API" detail="Routes the request" /><Architecture label="Clear result" detail="Ready to use" /></div></InfoSection>
    <InfoSection title="Built for the in-between" number="03"><p>Transo is for language learners, curious minds, and anyone with a message that deserves to land well. It won’t replace learning a language or a human translator for high-stakes work. It can help you take the next step.</p></InfoSection>
  </InfoPage>;
}

function Architecture({ label, detail }: { label: string; detail: string }) {
  return <div className="rounded-xl border border-border bg-muted/50 p-4"><div className="mb-8 size-2 rounded-full bg-primary" /><div className="text-xs font-black">{label}</div><div className="mt-1 text-xs text-muted-foreground">{detail}</div></div>;
}

function InfoSection({ title, number, children }: { title: string; number: string; children: ReactNode }) {
  return <section className="grid gap-5 border-t border-border py-10 sm:grid-cols-[9rem_1fr] sm:gap-12"><div className="flex items-start justify-between sm:block"><span className="font-mono text-[0.65rem] text-primary">{number}</span><h2 className="max-w-[10rem] text-sm font-black leading-5 sm:mt-5">{title}</h2></div><div className="max-w-2xl space-y-5 text-sm leading-7 text-muted-foreground">{children}</div></section>;
}

function InfoPage({ eyebrow, title, intro, accent, children }: { eyebrow: string; title: ReactNode; intro: string; accent: 'secondary' | 'accent' | 'primary'; children: ReactNode }) {
  const accentClass = accent === 'secondary' ? 'text-secondary' : accent === 'accent' ? 'text-accent' : 'text-primary';
  return <div className="transo-noise min-h-[100dvh]"><Header /><main className="mx-auto max-w-[1080px] px-5 pb-24 pt-16 lg:px-10 lg:pt-24"><div className="mb-20 max-w-3xl transo-rise"><p className={`mb-5 text-[0.65rem] font-black uppercase tracking-[0.2em] ${accentClass}`}>{eyebrow}</p><h1 className="font-serif text-[clamp(3rem,7vw,6.8rem)] font-bold leading-[.88] tracking-[-.08em] text-foreground">{title}</h1><p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">{intro}</p></div><div>{children}</div></main><Footer /></div>;
}

function Privacy() {
  return <InfoPage eyebrow="Privacy, plainly" title={<>Your words are<br /><span className="text-accent">still yours.</span></>} intro="Here is the short version: Transo sends the text you submit to its translation service so it can return a result. We don’t need an account to do that, and we don’t pretend a translation tool is a vault." accent="accent">
    <InfoSection title="What leaves your browser" number="01"><p>When you press Translate, Transo sends your text, selected source language (if you chose one), target language, and formatting preference to the Transo API. Nothing is sent while you are typing.</p></InfoSection>
    <InfoSection title="Provider handling" number="02"><p>The API may pass your request to a configured translation provider. The result can identify that provider so you have visibility into what handled the request. Provider-specific retention and processing rules may apply to the request while it is being processed.</p></InfoSection>
    <InfoSection title="What we don’t ask for" number="03"><p>Transo does not require a name, email address, profile, or contact list to translate. Don’t use it for passwords, payment details, medical records, legal secrets, or other sensitive information you would not want sent to a third-party translation service.</p></InfoSection>
    <InfoSection title="Your choices" number="04"><p>Use the clear button to remove text and results from the current page. You can also leave the page at any time. For a production deployment, the operator should publish retention, logging, and provider agreements that match its infrastructure.</p></InfoSection>
  </InfoPage>;
}

function Terms() {
  return <InfoPage eyebrow="Terms, without the fog" title={<>Useful words.<br /><span className="text-primary">Reasonable limits.</span></>} intro="Transo helps you understand and share everyday language. By using it, you agree to use the service thoughtfully and to check important translations with a qualified human." accent="primary">
    <InfoSection title="Good uses" number="01"><p>Use Transo for learning, travel, personal communication, research, and other lawful everyday purposes. Keep the people reading your words in mind, especially when context or culture matters.</p></InfoSection>
    <InfoSection title="Know the limits" number="02"><p>Translations can be imperfect, incomplete, or unavailable. Transo is not a certified interpreter, legal service, medical service, emergency service, or substitute for professional advice. Do not rely on it alone for decisions where an error could cause harm.</p></InfoSection>
    <InfoSection title="Your responsibility" number="03"><p>You are responsible for the text you submit, the permissions you have to submit it, and how you use the result. Do not submit unlawful content, attempts to abuse the service, or personal information that you are not authorized to share.</p></InfoSection>
    <InfoSection title="Service changes" number="04"><p>Language availability, providers, features, and uptime can change. We may pause or update the service to keep it safe and useful. These terms should be updated by the operator before a public launch with jurisdiction-specific details.</p></InfoSection>
  </InfoPage>;
}

function languageName(code: string, languages: Language[]) {
  return languages.find((language) => language.code === code)?.name || code;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/about" component={About} /><Route path="/privacy" component={Privacy} /><Route path="/terms" component={Terms} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;