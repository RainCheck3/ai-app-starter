import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@ai-sdk/openai", () => ({ openai: { responses: vi.fn() } }));
import { openai } from "@ai-sdk/openai";
import { MockLanguageModelV4 } from "ai/test";
import { simulateReadableStream } from "ai";
import { POST } from "@/app/api/chat/route";
import { getAIConfig } from "@/lib/ai";

const message = {
  id: "one",
  role: "user",
  parts: [{ type: "text", text: "Hello" }],
};
function request(body: unknown = { messages: [message] }, headers = {}) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}
beforeEach(() => {
  vi.stubEnv("AI_DEMO_MODE", "false");
  vi.stubEnv("OPENAI_API_KEY", "");
  vi.stubEnv("OPENAI_MODEL", "");
  vi.stubEnv("AI_MAX_OUTPUT_TOKENS", "1024");
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
describe("chat route", () => {
  it("uses the public Host when Next reconstructs an internal URL", async () => {
    const response = await POST(
      request(undefined, {
        host: "127.0.0.1:3101",
        origin: "http://127.0.0.1:3101",
      })
    );
    expect(response.status).toBe(503);
  });
  it("rejects malformed origins", async () => {
    expect((await POST(request(undefined, { origin: "null" }))).status).toBe(
      403
    );
  });
  it.each([
    {},
    { messages: [] },
    { messages: [{ ...message, role: "system" }] },
    { messages: [{ ...message, parts: [{ type: "text", text: " " }] }] },
    {
      messages: [
        { ...message, parts: [{ type: "text", text: "x".repeat(8001) }] },
      ],
    },
    {
      messages: [
        { ...message, parts: [{ type: "file", url: "https://example.com" }] },
      ],
    },
    { messages: Array.from({ length: 41 }, () => message) },
    { messages: [message], padding: "x".repeat(64000) },
  ])("rejects invalid or oversized input", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(openai.responses).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON", async () => {
    expect(
      (
        await POST(
          new Request("http://localhost/api/chat", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{",
          })
        )
      ).status
    ).toBe(400);
  });
  it("rejects other origins and content types", async () => {
    expect(
      (await POST(request(undefined, { origin: "https://other.example" })))
        .status
    ).toBe(403);
    expect(
      (await POST(request(undefined, { "content-type": "text/plain" }))).status
    ).toBe(415);
  });
  it("requires explicit server configuration", async () => {
    expect((await POST(request())).status).toBe(503);
  });
  it("bounds output configuration", () => {
    vi.stubEnv("AI_MAX_OUTPUT_TOKENS", "99999");
    expect(getAIConfig).toThrow();
  });
  it("streams a real SDK response with a mocked provider", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_MODEL", "test-model");
    const model = new MockLanguageModelV4({
      doStream: async () => ({
        stream: simulateReadableStream({
          chunks: [
            { type: "text-start", id: "text" },
            { type: "text-delta", id: "text", delta: "Hello from the mock" },
            { type: "text-end", id: "text" },
            {
              type: "finish",
              finishReason: { unified: "stop", raw: "stop" },
              usage: {
                inputTokens: {
                  total: 1,
                  noCache: 1,
                  cacheRead: 0,
                  cacheWrite: 0,
                },
                outputTokens: { total: 5, text: 5, reasoning: 0 },
              },
            },
          ],
        }),
      }),
    });
    vi.mocked(openai.responses).mockReturnValue(
      model as unknown as ReturnType<typeof openai.responses>
    );
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("Hello from the mock");
    expect(model.doStreamCalls[0].maxOutputTokens).toBe(1024);
    expect(model.doStreamCalls[0].abortSignal).toBeDefined();
    expect(model.doStreamCalls[0].providerOptions).toEqual({
      openai: { store: false },
    });
  });
  it("does not expose provider errors", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_MODEL", "test-model");
    vi.mocked(openai.responses).mockReturnValue(
      new MockLanguageModelV4({
        doStream: async () => {
          throw new Error("secret-provider-details");
        },
      }) as unknown as ReturnType<typeof openai.responses>
    );
    const text = await (await POST(request())).text();
    expect(text).not.toContain("secret-provider-details");
    expect(text).toContain("could not be completed");
  });
});
