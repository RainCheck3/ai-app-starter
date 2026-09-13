import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from "ai";
import { getAIConfig, getModel, instructions } from "@/lib/ai";
import { readChat } from "@/lib/chat-schema";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  // Next.js may reconstruct request.url with an internal hostname.
  const host = request.headers.get("host") ?? new URL(request.url).host;
  if (origin) {
    try {
      const source = new URL(origin);
      if (
        !["http:", "https:"].includes(source.protocol) ||
        source.host !== host
      ) {
        return Response.json({ error: "Origin not allowed" }, { status: 403 });
      }
    } catch {
      return Response.json({ error: "Origin not allowed" }, { status: 403 });
    }
  }
  if (!request.headers.get("content-type")?.includes("application/json"))
    return Response.json({ error: "Expected JSON" }, { status: 415 });
  let body;
  try {
    body = await readChat(request);
  } catch {
    return Response.json(
      {
        error:
          "Invalid or oversized conversation. Start a new chat or shorten your message.",
      },
      { status: 400 }
    );
  }
  try {
    const config = getAIConfig();
    if (config.demo) {
      const stream = createUIMessageStream({
        execute: async ({ writer }) => {
          writer.write({ type: "start" });
          writer.write({ type: "text-start", id: "demo" });
          const answer =
            "This is a **demo response**, not a model-generated answer.\n\nA useful starting point for your idea:\n\n1. Pick one person and one recurring problem.\n2. Build the smallest workflow that helps them.\n3. Test the result and refine it.\n\nWhat would you like to explore first?";
          for (const word of answer.split(/(?<=\s)/)) {
            if (request.signal.aborted) return;
            writer.write({ type: "text-delta", id: "demo", delta: word });
            await new Promise((resolve) => setTimeout(resolve, 25));
          }
          writer.write({ type: "text-end", id: "demo" });
          writer.write({ type: "finish", finishReason: "stop" });
        },
      });
      return createUIMessageStreamResponse({ stream });
    }
    if (!config.configured || !config.model)
      return Response.json(
        { error: "AI is not configured on the server." },
        { status: 503 }
      );
    const result = streamText({
      model: getModel(config.model),
      system: instructions,
      messages: await convertToModelMessages(body.messages),
      maxOutputTokens: config.maxOutputTokens,
      maxRetries: 0,
      abortSignal: AbortSignal.any([
        request.signal,
        AbortSignal.timeout(55000),
      ]),
      providerOptions: { openai: { store: false } },
    });
    return result.toUIMessageStreamResponse({
      onError: () => "The response could not be completed. Please try again.",
    });
  } catch {
    return Response.json(
      { error: "The assistant is temporarily unavailable." },
      { status: 503 }
    );
  }
}
