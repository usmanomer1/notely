"use client";

import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/convex-api";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { WorkspaceSetup } from "@/components/workspace/workspace-setup";
import { Skeleton } from "@/components/ui/skeleton";

const WORKSPACE_PATH = "/app/workspace";

function WorkspaceLoading() {
  return (
    <div className="flex h-[100dvh] flex-col bg-[#e5e2dc]">
      <div className="h-12 bg-[#1c1917]" />
      <div className="flex flex-1 gap-3 p-3">
        <Skeleton className="h-full w-[280px] border border-[#cfc9bf] bg-white" />
        <Skeleton className="workspace-desk h-full flex-1 border border-[#cfc9bf]" />
        <Skeleton className="hidden h-full w-[340px] border border-[#cfc9bf] bg-white lg:block" />
      </div>
    </div>
  );
}

function ConvexAuthSetupRequired() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#e5e2dc] px-4">
      <div className="max-w-md border border-[#cfc9bf] bg-white p-6 text-left">
        <h1 className="text-lg font-semibold tracking-tight text-stone-900">
          Finish Convex setup
        </h1>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          You are signed in with Clerk, but Convex has not received a valid auth token yet.
          Enable the Clerk integration in your Clerk dashboard and set{" "}
          <code className="bg-stone-100 px-1 py-0.5 text-xs">CLERK_JWT_ISSUER_DOMAIN</code>{" "}
          in the Convex dashboard. See SETUP.md for details.
        </p>
      </div>
    </div>
  );
}

export default function WorkspacePage() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth();
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const setupStatus = useQuery(
    api.integrations.getSetupStatus,
    isAuthenticated ? {} : "skip",
  );
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (clerkLoaded && !isSignedIn) {
      router.replace(
        `/sign-in?redirect_url=${encodeURIComponent(WORKSPACE_PATH)}`,
      );
    }
  }, [clerkLoaded, isSignedIn, router]);

  if (!clerkLoaded || !isSignedIn) {
    return <WorkspaceLoading />;
  }

  if (convexLoading) {
    return <WorkspaceLoading />;
  }

  if (!isAuthenticated) {
    return <ConvexAuthSetupRequired />;
  }

  const needsSetup = setupStatus?.isReady === false;

  return (
    <>
      {needsSetup ? <WorkspaceSetup mode="gate" /> : null}
      {!needsSetup ? (
        <WorkspaceShell onOpenSettings={() => setSettingsOpen(true)} />
      ) : null}
      {settingsOpen ? (
        <WorkspaceSetup
          mode="settings"
          onComplete={() => setSettingsOpen(false)}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  );
}
