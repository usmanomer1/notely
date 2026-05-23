"use node";

import type { LanguageModelV3 } from "@ai-sdk/provider";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export function getOpenRouterModel(
  apiKey: string,
  modelId = "anthropic/claude-sonnet-4",
): LanguageModelV3 {
  const openrouter = createOpenRouter({ apiKey });
  return openrouter.chat(modelId);
}
