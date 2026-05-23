/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agents_noteTaker from "../agents/noteTaker.js";
import type * as agents_tools from "../agents/tools.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as chatActions from "../chatActions.js";
import type * as integrations from "../integrations.js";
import type * as lib_openrouter from "../lib/openrouter.js";
import type * as lib_research from "../lib/research.js";
import type * as notes from "../notes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "agents/noteTaker": typeof agents_noteTaker;
  "agents/tools": typeof agents_tools;
  auth: typeof auth;
  chat: typeof chat;
  chatActions: typeof chatActions;
  integrations: typeof integrations;
  "lib/openrouter": typeof lib_openrouter;
  "lib/research": typeof lib_research;
  notes: typeof notes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
