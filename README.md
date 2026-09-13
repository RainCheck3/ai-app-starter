# AI App Starter

A lean Next.js AI product template: streaming chat, Markdown responses, stop/retry/new-chat controls, and server-side OpenAI Responses integration through the AI SDK.

## Start locally

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000. The example environment enables explicitly labeled demo responses without an API key or paid requests.

For real responses, set `AI_DEMO_MODE=false`, `OPENAI_API_KEY`, and `OPENAI_MODEL` in `.env.local`, then restart the server. Choose a Responses API model available to your account. `AI_MAX_OUTPUT_TOKENS` defaults to 1024 and accepts 128-8192. Keys are never sent to the browser. Missing credentials do not silently enable demo mode.

## Quality checks

```bash
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

`check` runs formatting, lint, mocked unit/API tests, and a production build. Browser tests require that build and start an isolated demo server on port 3101. CI runs both sets of checks without secrets or paid calls. Screenshots and failure traces go to ignored `test-results/`.

## Structure

- `components/chat.tsx`: chat UI and SDK client state.
- `app/api/chat/route.ts`: request validation and streaming response.
- `lib/ai.ts`: server-only provider, instructions, and environment configuration.
- `lib/chat-schema.ts`: text-only input contract and bounded body reader.
- `tests/`: mocked route tests and desktop/mobile browser tests.

## Template scope

Conversations are held in browser memory and disappear on reload. Each request sends the current conversation. There is no database, authentication, retrieval, file upload, tool execution, or billing integration.

Inputs are limited to 40 messages, 8000 characters per text part, 24000 total conversation characters, and 64000 request bytes. Requests have a 55-second upstream timeout and no automatic provider retries. Start a new conversation when you reach the limit. Output tokens bound each response, not total account spending.

Before exposing live mode publicly, add authentication and durable per-user rate/usage limits or put it behind deployment access protection. The origin check is not authentication and this base template is not a public paid-service endpoint. Configure provider budget controls separately. Prompts are sent to OpenAI in live mode; the integration requests `store: false` and does not log conversations. This does not override the provider's other retention policies.

## Create a project

Use GitHub's template feature once this repository is published as a template, or copy it into a new project. Update the package name, app metadata, instructions, README, and environment configuration. Keep secrets out of Git. See [setup](docs/setup.md) and [decisions](docs/decisions.md).
