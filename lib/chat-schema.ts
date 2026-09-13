import { z } from "zod";

export const MAX_INPUT = 8000;
export const MAX_BODY_BYTES = 64000;
export const chatSchema = z
  .object({
    messages: z
      .array(
        z.object({
          id: z.string().min(1).max(100),
          role: z.enum(["user", "assistant"]),
          parts: z
            .array(
              z.object({
                type: z.literal("text"),
                text: z.string().max(MAX_INPUT),
              })
            )
            .min(1)
            .max(8),
        })
      )
      .min(1)
      .max(40),
  })
  .refine(
    ({ messages }) => messages.at(-1)?.role === "user",
    "Last message must be from the user"
  )
  .refine(
    ({ messages }) => messages.every((m) => m.parts.some((p) => p.text.trim())),
    "Messages must not be empty"
  )
  .refine(
    ({ messages }) =>
      messages.reduce(
        (sum, m) => sum + m.parts.reduce((n, p) => n + p.text.length, 0),
        0
      ) <= 24000,
    "Conversation is too long"
  );

export async function readChat(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Missing body");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("Body too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return chatSchema.parse(JSON.parse(new TextDecoder().decode(bytes)));
}
