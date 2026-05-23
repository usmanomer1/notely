"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { createNoteTakerAgent } from "./agents/noteTaker";

export const streamResponse = internalAction({
  args: {
    threadId: v.string(),
    noteId: v.id("notes"),
    userId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (ctx, { threadId, noteId, userId, promptMessageId }) => {
    const agent = await createNoteTakerAgent(ctx, noteId, userId);
    const result = await agent.streamText(
      ctx,
      { threadId, userId },
      { promptMessageId },
      { saveStreamDeltas: { chunking: "word", throttleMs: 100 } },
    );
    await result.consumeStream();
  },
});
