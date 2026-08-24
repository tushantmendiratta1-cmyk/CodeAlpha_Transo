# Contributing to Transo

Thanks for taking the time to improve the project.

## Before opening a change

1. Read the README and the architecture notes.
2. Keep the translation provider behind the existing server API.
3. Do not add private credentials to source, commits, screenshots, or issue examples.
4. Keep user-facing errors understandable.
5. Check keyboard use and mobile layout when changing the interface.

## Local checks

```bash
pnpm install
pnpm run typecheck
pnpm --filter @workspace/transo run build
```

Please describe what changed, how it was checked, and whether provider configuration is required.