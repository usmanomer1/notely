"use node";

import { z } from "zod";
import { createTool } from "@convex-dev/agent";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { readUrl, webSearch } from "../lib/research";

export function createResearchTools(browserbaseApiKey: string) {
  return {
    searchWeb: createTool({
      description:
        "Search the web for current information on a topic. Returns titles, URLs, and snippets.",
      inputSchema: z.object({
        query: z.string().describe("The search query"),
        maxResults: z.number().min(1).max(8).optional(),
      }),
      execute: async (_ctx, { query, maxResults }) => {
        const results = await webSearch(query, browserbaseApiKey, maxResults ?? 5);
        return { results };
      },
    }),

    readWebPage: createTool({
      description:
        "Fetch and read the main text content of a URL as markdown. Use after web search to dig deeper.",
      inputSchema: z.object({
        url: z.string().url().describe("The URL to read"),
      }),
      execute: async (_ctx, { url }) => {
        return await readUrl(url, browserbaseApiKey);
      },
    }),
  };
}

export function createNoteTools(noteId: Id<"notes">, userId: string) {
  return {
    getCurrentNote: createTool({
      description: "Read the current note title and content.",
      inputSchema: z.object({}),
      execute: async (ctx): Promise<{ title: string; content: string; tags: string[] }> => {
        const note = await ctx.runQuery(internal.notes.getNoteInternal, { noteId, userId });
        if (!note) {
          throw new Error("Note not found");
        }
        return {
          title: note.title,
          content: note.content,
          tags: note.tags,
        };
      },
    }),

    updateCurrentNote: createTool({
      description:
        "Update the current note. Provide only fields you want to change. Use after research or when the user asks to edit.",
      inputSchema: z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional(),
      }),
      execute: async (ctx, input): Promise<{ success: boolean }> => {
        await ctx.runMutation(internal.notes.patchNoteInternal, {
          noteId,
          userId,
          ...input,
        });
        return { success: true };
      },
    }),

    searchMyNotes: createTool({
      description: "Search the user's notes by keyword.",
      inputSchema: z.object({
        query: z.string().describe("Search query"),
        limit: z.number().min(1).max(10).optional(),
      }),
      execute: async (ctx, { query, limit }) => {
        return await ctx.runQuery(internal.notes.searchNotesInternal, {
          userId,
          query,
          limit: limit ?? 5,
        });
      },
    }),
  };
}
