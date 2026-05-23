import { paginationOptsValidator } from "convex/server";
import {
  getThreadMetadata,
  listUIMessages,
  saveMessage,
  syncStreams,
  vStreamArgs,
} from "@convex-dev/agent";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireUserId } from "./auth";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

export async function authorizeThreadAccess(
  ctx: QueryCtx | MutationCtx | ActionCtx,
  threadId: string,
) {
  const userId = await requireUserId(ctx);
  const { userId: threadUserId } = await getThreadMetadata(ctx, components.agent, {
    threadId,
  });
  if (threadUserId !== userId) {
    throw new Error("Unauthorized thread access");
  }
}

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    await authorizeThreadAccess(ctx, args.threadId);
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});

export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    noteId: v.id("notes"),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, noteId, prompt }) => {
    const userId = await requireUserId(ctx);
    await authorizeThreadAccess(ctx, threadId);

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });

    await ctx.scheduler.runAfter(0, internal.chatActions.streamResponse, {
      threadId,
      noteId,
      userId,
      promptMessageId: messageId,
    });
  },
});
