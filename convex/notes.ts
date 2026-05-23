import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { requireUserId } from "./auth";
import { createThread } from "@convex-dev/agent";
import { components } from "./_generated/api";

const NOTE_ACCENTS = ["violet", "amber", "emerald", "sky", "rose", "orange"] as const;

export const listNotebooks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return await ctx.db
      .query("notebooks")
      .withIndex("by_user_updated", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const createNotebook = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    const accent = NOTE_ACCENTS[Math.floor(Math.random() * NOTE_ACCENTS.length)];

    const threadId = await createThread(ctx, components.agent, {
      userId,
      title: args.title,
    });

    return await ctx.db.insert("notebooks", {
      userId,
      title: args.title.trim() || "Untitled notebook",
      description: args.description,
      accent,
      threadId,
      updatedAt: now,
    });
  },
});

export const renameNotebook = mutation({
  args: {
    notebookId: v.id("notebooks"),
    title: v.string(),
  },
  handler: async (ctx, { notebookId, title }) => {
    const userId = await requireUserId(ctx);
    const notebook = await ctx.db.get(notebookId);
    if (!notebook || notebook.userId !== userId) {
      throw new Error("Notebook not found");
    }
    await ctx.db.patch(notebookId, {
      title: title.trim() || "Untitled notebook",
      updatedAt: Date.now(),
    });
  },
});

export const deleteNotebook = mutation({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, { notebookId }) => {
    const userId = await requireUserId(ctx);
    const notebook = await ctx.db.get(notebookId);
    if (!notebook || notebook.userId !== userId) {
      throw new Error("Notebook not found");
    }

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_notebook", (q) => q.eq("notebookId", notebookId))
      .collect();

    for (const note of notes) {
      await ctx.db.delete(note._id);
    }
    await ctx.db.delete(notebookId);
  },
});

export const listNotes = query({
  args: { notebookId: v.id("notebooks") },
  handler: async (ctx, { notebookId }) => {
    const userId = await requireUserId(ctx);
    const notebook = await ctx.db.get(notebookId);
    if (!notebook || notebook.userId !== userId) {
      throw new Error("Notebook not found");
    }

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_notebook_updated", (q) => q.eq("notebookId", notebookId))
      .order("desc")
      .collect();

    return notes.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      return b.updatedAt - a.updatedAt;
    });
  },
});

export const getNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      return null;
    }
    return note;
  },
});

export const createNote = mutation({
  args: {
    notebookId: v.id("notebooks"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { notebookId, title }) => {
    const userId = await requireUserId(ctx);
    const notebook = await ctx.db.get(notebookId);
    if (!notebook || notebook.userId !== userId) {
      throw new Error("Notebook not found");
    }

    const now = Date.now();
    const threadId = await createThread(ctx, components.agent, {
      userId,
      title: title?.trim() || "Untitled note",
    });

    const noteId = await ctx.db.insert("notes", {
      userId,
      notebookId,
      title: title?.trim() || "Untitled note",
      content: "",
      tags: [],
      threadId,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(notebookId, { updatedAt: now });
    return noteId;
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, { noteId, ...updates }) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }

    const now = Date.now();
    await ctx.db.patch(noteId, {
      ...updates,
      updatedAt: now,
    });
    await ctx.db.patch(note.notebookId, { updatedAt: now });
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, { noteId }) => {
    const userId = await requireUserId(ctx);
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }
    await ctx.db.delete(noteId);
    await ctx.db.patch(note.notebookId, { updatedAt: Date.now() });
  },
});

export const searchNotes = query({
  args: {
    query: v.string(),
    notebookId: v.optional(v.id("notebooks")),
  },
  handler: async (ctx, { query: searchQuery, notebookId }) => {
    const userId = await requireUserId(ctx);
    if (!searchQuery.trim()) {
      return [];
    }

    const results = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) => {
        let search = q.search("content", searchQuery).eq("userId", userId);
        if (notebookId) {
          search = search.eq("notebookId", notebookId);
        }
        return search;
      })
      .take(12);

    return results;
  },
});

export const getNoteInternal = internalQuery({
  args: {
    noteId: v.id("notes"),
    userId: v.string(),
  },
  handler: async (ctx, { noteId, userId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      return null;
    }
    return note;
  },
});

export const patchNoteInternal = internalMutation({
  args: {
    noteId: v.id("notes"),
    userId: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { noteId, userId, ...updates }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) {
      throw new Error("Note not found");
    }
    const now = Date.now();
    await ctx.db.patch(noteId, { ...updates, updatedAt: now });
    await ctx.db.patch(note.notebookId, { updatedAt: now });
  },
});

export const searchNotesInternal = internalQuery({
  args: {
    userId: v.string(),
    query: v.string(),
    limit: v.number(),
  },
  handler: async (ctx, { userId, query: searchQuery, limit }) => {
    const results = await ctx.db
      .query("notes")
      .withSearchIndex("search_title", (q) =>
        q.search("title", searchQuery).eq("userId", userId),
      )
      .take(limit);

    if (results.length >= limit) {
      return results.map((note) => ({
        id: note._id,
        title: note.title,
        snippet: note.content.slice(0, 240),
        tags: note.tags,
      }));
    }

    const contentResults = await ctx.db
      .query("notes")
      .withSearchIndex("search_content", (q) =>
        q.search("content", searchQuery).eq("userId", userId),
      )
      .take(limit);

    const merged = new Map<string, (typeof results)[number]>();
    for (const note of [...results, ...contentResults]) {
      merged.set(note._id, note);
    }

    return [...merged.values()].slice(0, limit).map((note) => ({
      id: note._id,
      title: note.title,
      snippet: note.content.slice(0, 240),
      tags: note.tags,
    }));
  },
});

export const ensureDefaultNotebook = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("notebooks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      return existing._id;
    }

    const now = Date.now();
    const threadId = await createThread(ctx, components.agent, {
      userId,
      title: "Personal",
    });

    return await ctx.db.insert("notebooks", {
      userId,
      title: "Personal",
      description: "Your default notebook",
      accent: "violet",
      threadId,
      updatedAt: now,
    });
  },
});
