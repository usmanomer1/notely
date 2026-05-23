"use client";

import { useConvexConnectionState } from "convex/react";
import { WarningCircle } from "@phosphor-icons/react";

export function ConvexConnectionBanner() {
  const { isWebSocketConnected, hasEverConnected } = useConvexConnectionState();

  if (isWebSocketConnected) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-start gap-2 border-b border-amber-300 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950">
      <WarningCircle className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
      <div>
        <p className="font-medium">
          {hasEverConnected ? "Reconnecting to Convex…" : "Cannot reach Convex"}
        </p>
        <p className="mt-0.5 text-amber-900/80">
          Run <code className="bg-white/80 px-1">npm run dev</code> so both Next.js and{" "}
          <code className="bg-white/80 px-1">convex dev</code> are running. Check{" "}
          <code className="bg-white/80 px-1">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
          <code className="bg-white/80 px-1">.env.local</code>.
        </p>
      </div>
    </div>
  );
}
