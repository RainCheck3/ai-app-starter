import "server-only";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export function getAIConfig() {
  const demo = process.env.AI_DEMO_MODE === "true";
  const model = process.env.OPENAI_MODEL?.trim();
  const configured = Boolean(process.env.OPENAI_API_KEY?.trim() && model);
  const maxOutputTokens = z.coerce
    .number()
    .int()
    .min(128)
    .max(8192)
    .parse(process.env.AI_MAX_OUTPUT_TOKENS ?? "1024");
  return { demo, configured, model, maxOutputTokens };
}
export function getModel(model: string) {
  return openai.responses(model);
}
export const instructions =
  "You are a helpful assistant. Be clear, accurate, and concise. State uncertainty. Use Markdown when it improves readability.";
