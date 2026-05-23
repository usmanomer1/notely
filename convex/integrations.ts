import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { requireUserId } from "./auth";

const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-sonnet-4";

function maskKey(key: string | undefined): string | null {
  if (!key) {
    return null;
  }
  if (key.length <= 10) {
    return "••••••••";
  }
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

function platformKeysAvailable() {
  return Boolean(process.env.OPENROUTER_API_KEY && process.env.BROWSERBASE_API_KEY);
}

async function getIntegrationRow(ctx: QueryCtx, userId: string) {
  return await ctx.db
    .query("userIntegrations")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

export function resolveKeysForUser(
  row: {
    openrouterApiKey?: string;
    openrouterModel?: string;
    browserbaseApiKey?: string;
  } | null,
) {
  const openrouterApiKey =
    row?.openrouterApiKey?.trim() || process.env.OPENROUTER_API_KEY || null;
  const browserbaseApiKey =
    row?.browserbaseApiKey?.trim() || process.env.BROWSERBASE_API_KEY || null;
  const openrouterModel =
    row?.openrouterModel?.trim() ||
    process.env.OPENROUTER_MODEL ||
    DEFAULT_OPENROUTER_MODEL;

  return { openrouterApiKey, browserbaseApiKey, openrouterModel };
}

function isIntegrationReady(
  row: {
    openrouterApiKey?: string;
    browserbaseApiKey?: string;
    setupComplete: boolean;
  } | null,
) {
  const { openrouterApiKey, browserbaseApiKey } = resolveKeysForUser(row);
  const hasKeys = Boolean(openrouterApiKey && browserbaseApiKey);

  if (!hasKeys) {
    return false;
  }

  const userProvidedBoth = Boolean(row?.openrouterApiKey && row?.browserbaseApiKey);
  if (userProvidedBoth) {
    return true;
  }

  if (platformKeysAvailable() && row === null) {
    return true;
  }

  if (platformKeysAvailable() && row?.setupComplete) {
    return true;
  }

  return false;
}

export const getSetupStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const row = await getIntegrationRow(ctx, userId);
    const resolved = resolveKeysForUser(row);

    return {
      isReady: isIntegrationReady(row),
      platformKeysAvailable: platformKeysAvailable(),
      hasUserOpenrouterKey: Boolean(row?.openrouterApiKey),
      hasUserBrowserbaseKey: Boolean(row?.browserbaseApiKey),
      openrouterMasked: maskKey(row?.openrouterApiKey),
      browserbaseMasked: maskKey(row?.browserbaseApiKey),
      openrouterModel: resolved.openrouterModel,
      usingPlatformOpenrouter:
        !row?.openrouterApiKey && Boolean(process.env.OPENROUTER_API_KEY),
      usingPlatformBrowserbase:
        !row?.browserbaseApiKey && Boolean(process.env.BROWSERBASE_API_KEY),
    };
  },
});

export const saveIntegrations = mutation({
  args: {
    openrouterApiKey: v.optional(v.string()),
    browserbaseApiKey: v.optional(v.string()),
    openrouterModel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await getIntegrationRow(ctx, userId);
    const now = Date.now();

    const next = {
      userId,
      openrouterApiKey: existing?.openrouterApiKey,
      openrouterModel: existing?.openrouterModel,
      browserbaseApiKey: existing?.browserbaseApiKey,
      setupComplete: existing?.setupComplete ?? false,
      updatedAt: now,
    };

    if (args.openrouterApiKey !== undefined) {
      const trimmed = args.openrouterApiKey.trim();
      next.openrouterApiKey = trimmed || undefined;
    }

    if (args.browserbaseApiKey !== undefined) {
      const trimmed = args.browserbaseApiKey.trim();
      next.browserbaseApiKey = trimmed || undefined;
    }

    if (args.openrouterModel !== undefined) {
      const trimmed = args.openrouterModel.trim();
      next.openrouterModel = trimmed || undefined;
    }

    const resolved = resolveKeysForUser(next);
    if (!resolved.openrouterApiKey || !resolved.browserbaseApiKey) {
      throw new Error("Both OpenRouter and Browserbase keys are required.");
    }

    next.setupComplete = true;

    if (existing) {
      await ctx.db.patch(existing._id, next);
    } else {
      await ctx.db.insert("userIntegrations", next);
    }

    return { success: true };
  },
});

export const acknowledgePlatformKeys = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    if (!platformKeysAvailable()) {
      throw new Error("Platform API keys are not configured on this deployment.");
    }

    const existing = await getIntegrationRow(ctx, userId);
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, { setupComplete: true, updatedAt: now });
    } else {
      await ctx.db.insert("userIntegrations", {
        userId,
        setupComplete: true,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

export const getKeysForUser = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    const row = await getIntegrationRow(ctx, userId);
    const resolved = resolveKeysForUser(row);

    if (!resolved.openrouterApiKey || !resolved.browserbaseApiKey) {
      throw new Error(
        "API keys not configured. Add your OpenRouter and Browserbase keys in workspace setup.",
      );
    }

    return {
      openrouterApiKey: resolved.openrouterApiKey,
      browserbaseApiKey: resolved.browserbaseApiKey,
      openrouterModel: resolved.openrouterModel,
    };
  },
});
