import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  notebooks: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    accent: v.string(),
    threadId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  notes: defineTable({
    userId: v.string(),
    notebookId: v.id("notebooks"),
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    threadId: v.optional(v.string()),
    isPinned: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_notebook", ["notebookId"])
    .index("by_notebook_updated", ["notebookId", "updatedAt"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "notebookId"],
    })
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["userId"],
    }),

  userIntegrations: defineTable({
    userId: v.string(),
    openrouterApiKey: v.optional(v.string()),
    openrouterModel: v.optional(v.string()),
    browserbaseApiKey: v.optional(v.string()),
    setupComplete: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
