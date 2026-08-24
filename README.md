# Transo

**Translate the world. Connect beyond language.**

Transo is a browser-based language translation tool created for the CodeAlpha Artificial Intelligence internship. It lets a user write or paste text, choose the source and target languages, send the request through a server-side translation API, and use the returned translation immediately.

The project is intentionally built as a small, understandable product rather than a collection of disconnected demo screens. The interface includes automatic language detection, long-text handling, copy, download, speech synthesis, language swapping, local history, theme switching, responsive layouts, and honest provider/error states.

## CodeAlpha task mapping

This repository implements **Task 1: Language Translation Tool** from the CodeAlpha AI internship brief:

- User interface for entering text
- Source and target language selection
- Real translation service request
- Translated response displayed in the interface
- Copy and text-to-speech enhancements

The PDF also states that interns must complete at least **two or three tasks** for internship certificate eligibility. Transo is currently submitted as the Task 1 project; a second task would need to be completed separately before claiming that criterion.

## What happens when you translate

```text
Browser
  -> Transo API (/api/translate)
  -> request validation and rate limit
  -> configured translation provider
  -> translated response
  -> browser UI
```

Translation requests are manual: text is not sent while the user is typing. Basic history is kept in the user's browser, not in the project database.

## Technology

- React + TypeScript + Vite
- Express 5 API server
- OpenAPI contract with generated Zod validation and React Query hooks
- Google Cloud Translation support
- MyMemory support for local/demo use when Google is not configured
- Tailwind CSS
- Wouter routing
- Browser Clipboard and Speech Synthesis APIs
- pnpm workspaces

## Run locally

This repository uses pnpm.

```bash
pnpm install
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run dev
```

In a second terminal:

```bash
pnpm --filter @workspace/transo run dev
```

The web app and API are normally started through the Replit workflows. A translation request can be checked directly through the shared proxy:

```bash
curl http://localhost:80/api/healthz
```

## Translation provider configuration

The API uses MyMemory by default so the project can be demonstrated locally without placing a private credential in the browser. For a production deployment, configure Google Cloud Translation:

```env
TRANSLATION_PROVIDER=google
GOOGLE_TRANSLATE_API_KEY=your_server_side_key
```

Never prefix the Google credential with `VITE_` or expose it as a public frontend variable. The key belongs only in the server environment.

### Google Cloud setup

1. Create or select a Google Cloud project.
2. Enable the Cloud Translation API.
3. Configure billing if Google requires it for the selected account.
4. Create a restricted server-side credential.
5. Add `TRANSLATION_PROVIDER=google` and `GOOGLE_TRANSLATE_API_KEY` to the server environment.
6. Start the API server.
7. Check `/api/healthz`.
8. Submit a translation request from the Transo UI.

Provider quotas and provider-specific retention rules still apply. Do not submit passwords, payment data, medical records, or other sensitive information.

## Quality checks

```bash
pnpm run typecheck
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/transo run typecheck
PORT=23933 BASE_PATH=/ pnpm --filter @workspace/transo run build
```

## Repository map

```text
artifacts/transo/       React application and pages
artifacts/api-server/   Express translation and health routes
lib/api-spec/           OpenAPI source of truth
lib/api-client-react/   Generated React Query client
lib/api-zod/            Generated server validation schemas
docs/                   Architecture and internship presentation notes
```

## Internship submission notes

See:

- `docs/PROJECT_EXPLANATION.md` for a presentation-ready explanation
- `docs/INTERNSHIP_SUBMISSION.md` for the CodeAlpha submission checklist
- `docs/ARCHITECTURE.md` for request flow and security decisions

## License

MIT. See `LICENSE`.