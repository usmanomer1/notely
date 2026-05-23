"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useMemo, type ReactNode } from "react";

function MissingConfig({ missing }: { missing: string[] }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-[#e5e2dc] p-6">
      <div className="max-w-md border border-[#cfc9bf] bg-white p-6 text-left">
        <h1 className="text-lg font-semibold text-stone-900">Configuration required</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Add these environment variables in Vercel (Project Settings → Environment
          Variables), then redeploy:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-stone-800">
          {missing.map((key) => (
            <li key={key}>
              <code className="bg-stone-100 px-1 py-0.5 text-xs">{key}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const convex = useMemo(() => {
    if (!convexUrl) {
      return null;
    }
    return new ConvexReactClient(convexUrl);
  }, [convexUrl]);

  const missing = [
    !convexUrl ? "NEXT_PUBLIC_CONVEX_URL" : null,
    !clerkPublishableKey ? "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" : null,
  ].filter((value): value is string => value !== null);

  if (missing.length > 0 || !convex || !clerkPublishableKey) {
    return <MissingConfig missing={missing.length > 0 ? missing : ["NEXT_PUBLIC_CONVEX_URL"]} />;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      signInFallbackRedirectUrl="/app/workspace"
      signUpFallbackRedirectUrl="/app/workspace"
      appearance={{
        variables: {
          colorPrimary: "#d97706",
          borderRadius: "0px",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
