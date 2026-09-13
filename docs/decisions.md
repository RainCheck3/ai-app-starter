# Decisions

## One Next.js application

Derived from the web starter, retaining its tooling and Git history. UI and server route share one deployment. Add a Python service when a specific product needs Python libraries or independently operated workers.

## AI SDK for streaming

The AI SDK owns stream framing, client message state, cancellation, and provider adaptation. OpenAI Responses is the initial server-side provider. The provider is isolated in `lib/ai.ts`; the browser never chooses a model or supplies credentials.

References: [AI SDK](https://ai-sdk.dev/docs/introduction) and [OpenAI streaming](https://developers.openai.com/api/docs/guides/streaming-responses).

## Explicit demo mode

The checked-in environment example enables a visibly labeled deterministic demo. Missing credentials otherwise disable chat. CI has no API secrets and uses both a mocked SDK model and the demo route to test streaming.

## Bounded text input

Only user and assistant text is accepted. Client system roles, file URLs, and tool parts are rejected. Body bytes, message count, and conversation size are bounded before calling a provider. Provider errors are replaced with a generic public message.

## Lean product boundary

No persistence, auth, payments, RAG, or tools yet. Markdown is rendered without raw HTML or remote images. Origin validation reduces accidental cross-site calls but does not replace authentication or rate limiting. Live deployments need those controls.

## Reuse existing tooling

Node and pnpm stay pinned to the web starter versions. Vitest covers the route contract and mocked provider behavior; Playwright covers the real chat transport at desktop and mobile widths. GitHub Actions runs both.
