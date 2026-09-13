# Setup

Use Node from `.nvmrc` and pnpm from `package.json`. Run `nvm use`, `corepack enable`, and `pnpm install --frozen-lockfile`.

Copy `.env.example` to `.env.local`. Run `pnpm dev` and open http://localhost:3000.

## Environment

| Variable               | Purpose                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| `AI_DEMO_MODE`         | Set `true` for deterministic simulated streaming; default is false.               |
| `OPENAI_API_KEY`       | Server-only OpenAI API key, required in live mode.                                |
| `OPENAI_MODEL`         | Responses API model ID available to your account, required in live mode.          |
| `AI_MAX_OUTPUT_TOKENS` | Integer 128-8192, default 1024. Includes model reasoning tokens where applicable. |

Restart after environment changes. Do not add `NEXT_PUBLIC_` to server configuration. No real key is needed to build or test.

## Verification

Run `pnpm check`, then `pnpm exec playwright install chromium` and `pnpm test:e2e`. Browser tests launch the production build on port 3101 with demo mode enabled. Keep that port free. `pnpm format` fixes formatting.

## Deployment

Deploy to a Node-compatible Next.js host with streaming support. Build with `pnpm build` and run `pnpm start`. Configure environment variables on the host. Allow at least 60 seconds for the chat route and disable proxy response buffering if applicable.

For live mode, protect access and add durable usage limits before making the endpoint public. This template deliberately has no user identity or global rate-limit store. Test one real response with your chosen model after configuration; automated tests only exercise mocked/demo responses.
