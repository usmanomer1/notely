"use node";

import { Agent, stepCountIs } from "@convex-dev/agent";
import type { ActionCtx } from "../_generated/server";
import { components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { getOpenRouterModel } from "../lib/openrouter";
import { createNoteTools, createResearchTools } from "./tools";

const baseInstructions = `You are Notely, an expert AI notebook assistant.

You help users capture ideas, organize knowledge, and research topics with clarity.

Guidelines:
- Be concise but thorough. Use markdown in note content when helpful.
- When researching, use searchWeb first, then readWebPage on the best sources (Browserbase Search + Fetch).
- Cite sources with markdown links when adding research to notes.
- Use getCurrentNote before editing; use updateCurrentNote to save changes.
- Use searchMyNotes to connect new writing with existing notes.
- Ask a clarifying question only when truly necessary.`;

export async function createNoteTakerAgent(
  ctx: ActionCtx,
  noteId: Id<"notes">,
  userId: string,
) {
  const keys = await ctx.runQuery(internal.integrations.getKeysForUser, { userId });

  return new Agent(components.agent, {
    name: "Notely",
    languageModel: getOpenRouterModel(keys.openrouterApiKey, keys.openrouterModel),
    instructions: baseInstructions,
    tools: {
      ...createResearchTools(keys.browserbaseApiKey),
      ...createNoteTools(noteId, userId),
    },
    stopWhen: stepCountIs(8),
    callSettings: {
      temperature: 0.6,
      maxRetries: 2,
    },
  });
}
