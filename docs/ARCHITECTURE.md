# Transo architecture

## Request flow

1. The React client loads the supported language map from `GET /api/languages`.
2. The user chooses a source language or leaves it on automatic detection.
3. The user chooses a target language and presses Translate.
4. The client sends the text and options to `POST /api/translate`.
5. Express validates the payload using the generated Zod schema.
6. A small per-client rate limiter and maximum input length protect provider usage.
7. Text longer than the configured chunk size is split at paragraph, sentence, or word boundaries.
8. The selected provider translates each chunk in order.
9. The API reassembles the result and returns the translated text plus language metadata.
10. The browser renders the result and may copy, download, speak, or save it locally.

## Provider abstraction

`TRANSLATION_PROVIDER=google` uses Google Cloud Translation through a server-side request. The default `mymemory` option is a real provider intended for local/demo use when a Google credential is not available. It is not a fake response and it does not silently pretend to be Google.

## Privacy boundary

The API does not create a translation-history database. History is local to the browser. Text submitted for translation necessarily leaves the browser and may be processed by the configured provider; the UI and privacy page state that limitation plainly.

## Known deployment consideration

The current rate limiter is an in-memory development fallback. A public multi-instance deployment should replace it with a shared store so limits apply across instances.