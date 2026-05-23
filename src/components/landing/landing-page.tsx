"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code,
  GlobeHemisphereWest,
  Lightning,
  NotePencil,
  Robot,
  SlidersHorizontal,
} from "@phosphor-icons/react";

export function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-[#e5e2dc] text-stone-900">
      <header className="flex h-12 items-center justify-between border-b border-stone-800 bg-[#1c1917] px-4 md:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-amber-600">
            <NotePencil className="h-3.5 w-3.5 text-white" weight="fill" />
          </div>
          <span className="text-sm font-medium text-white">Notely</span>
        </div>

        <nav className="flex items-center gap-2">
          {isLoaded && isSignedIn ? (
            <Link
              href="/app/workspace"
              className="bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-500"
            >
              Open workspace
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="px-3 py-1.5 text-xs text-stone-400 transition hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="border border-stone-600 px-3 py-1.5 text-xs font-medium text-white transition hover:border-stone-400"
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="border-b border-[#cfc9bf] px-4 py-14 md:px-6 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                Research notebook
              </p>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight text-stone-900 md:text-5xl lg:text-[3.25rem]">
                Notes that write, research, and revise in one place.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-stone-600 md:text-base">
                Block-based editing with slash commands, real-time Convex sync, and an
                assistant that searches the web, reads sources, and updates your notes —
                all in a workspace built for focus.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href="/app/workspace"
                  className="inline-flex items-center gap-2 bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800"
                >
                  Open your workspace
                  <ArrowRight className="h-4 w-4" weight="bold" />
                </Link>
                {isLoaded && !isSignedIn ? (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center gap-2 border border-stone-400 bg-white px-4 py-2.5 text-sm text-stone-800 transition hover:border-stone-600"
                  >
                    Create free account
                  </Link>
                ) : null}
              </div>

              <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-stone-300/80 pt-8">
                {[
                  { label: "Editor", value: "BlockNote" },
                  { label: "Sync", value: "Convex" },
                  { label: "Research", value: "Browserbase" },
                ].map((item) => (
                  <div key={item.label}>
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-stone-800">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <WorkspacePreview />
          </div>
        </section>

        <section className="px-4 py-16 md:px-6 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
                Capabilities
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                Everything you need between first draft and finished research.
              </h2>
            </div>

            <div className="grid gap-px border border-[#cfc9bf] bg-[#cfc9bf] md:grid-cols-2">
              <FeatureCell
                icon={SlidersHorizontal}
                title="Slash-command editor"
                body="Headings, lists, code blocks, quotes, and dividers. Type / anywhere — BlockNote with Shiki highlighting built in."
              />
              <FeatureCell
                icon={Lightning}
                title="Real-time sync"
                body="Convex subscriptions keep notebooks, block edits, and assistant replies aligned across tabs instantly."
              />
              <FeatureCell
                icon={GlobeHemisphereWest}
                title="Search, then read"
                body="Browserbase Search finds sources. Fetch returns clean markdown. No browser automation for routine research."
              />
              <FeatureCell
                icon={Robot}
                title="Assistant edits in place"
                body="Each note has its own thread. The agent reads your content, runs research, and writes structured updates back."
              />
            </div>
          </div>
        </section>

        <section className="border-y border-[#cfc9bf] bg-white px-4 py-16 md:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-stone-500">
              Workflow
            </p>
            <div className="mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
              {[
                {
                  step: "01",
                  title: "Capture",
                  body: "Organize notes in notebooks. Write with blocks, tags, and autosave.",
                },
                {
                  step: "02",
                  title: "Research",
                  body: "Ask the assistant to search, read sources, and draft citations.",
                },
                {
                  step: "03",
                  title: "Revise",
                  body: "Review AI edits in your editor. Pin, search, and refine in place.",
                },
              ].map((item) => (
                <div key={item.step} className="border-l-2 border-amber-600 pl-4">
                  <span className="font-mono text-xs text-stone-400">{item.step}</span>
                  <h3 className="mt-2 text-lg font-medium text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#1c1917] px-4 py-14 text-white md:px-6 md:py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Ready to open your desk?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-stone-400">
                Sign in and start writing. Your notebooks, block editor, and research
                assistant are already wired up.
              </p>
            </div>
            <Link
              href="/app/workspace"
              className="inline-flex shrink-0 items-center gap-2 bg-amber-600 px-5 py-2.5 text-sm font-medium transition hover:bg-amber-500"
            >
              Go to workspace
              <ArrowRight className="h-4 w-4" weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#cfc9bf] px-4 py-6 md:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 text-xs text-stone-500 sm:flex-row sm:items-center">
          <span>Notely — Convex · Clerk · OpenRouter · Browserbase</span>
          <span className="font-mono">Built for research notebooks</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCell({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Lightning;
  title: string;
  body: string;
}) {
  return (
    <article className="bg-[#faf9f7] p-6 md:p-8">
      <Icon className="h-5 w-5 text-amber-700" weight="duotone" />
      <h3 className="mt-4 text-base font-medium text-stone-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{body}</p>
    </article>
  );
}

function WorkspacePreview() {
  return (
    <div
      className="border border-[#cfc9bf] bg-[#e5e2dc] p-2 shadow-[8px_8px_0_0_#cfc9bf]"
      aria-hidden
    >
      <div className="border border-[#cfc9bf] bg-white">
        <div className="flex h-8 items-center justify-between border-b border-stone-200 bg-[#1c1917] px-2.5">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-amber-600" />
            <span className="text-[10px] text-stone-300">Notely</span>
          </div>
          <div className="h-4 w-16 bg-stone-700" />
        </div>

        <div className="flex h-8 items-end border-b border-stone-200 bg-stone-100 px-2">
          <span className="border border-b-0 border-stone-200 bg-white px-2 py-1 text-[9px] font-medium text-stone-800">
            Personal
          </span>
          <span className="px-2 py-1 text-[9px] text-stone-500">Research</span>
        </div>

        <div className="grid grid-cols-[72px_1fr_88px] md:grid-cols-[88px_1fr_96px]">
          <div className="border-r border-stone-200 bg-stone-50 p-1.5">
            <p className="text-[8px] font-bold uppercase tracking-wider text-stone-400">
              Library
            </p>
            <div className="mt-1.5 space-y-1">
              <div className="border border-stone-900 bg-white p-1.5">
                <p className="text-[8px] font-medium text-stone-900">Q3 research</p>
                <p className="mt-0.5 text-[7px] text-stone-500">2h ago</p>
              </div>
              <div className="border border-stone-200 bg-white p-1.5">
                <p className="text-[8px] text-stone-700">Meeting notes</p>
              </div>
            </div>
          </div>

          <div className="workspace-desk p-2.5 md:p-3">
            <p className="text-[11px] font-semibold text-stone-900 md:text-xs">
              Q3 product research
            </p>
            <p className="mt-1 text-[8px] text-stone-500">real-time · backend · citations</p>
            <div className="my-2 h-px bg-stone-300/80" />
            <div className="space-y-1.5">
              <p className="text-[8px] font-medium text-stone-800 md:text-[9px]">
                ## Key findings
              </p>
              <p className="text-[8px] leading-relaxed text-stone-600 md:text-[9px]">
                Real-time sync reduces stale edits across tabs…
              </p>
              <div className="flex items-center gap-1 border border-stone-300 bg-stone-900 px-1.5 py-1">
                <Code className="h-2.5 w-2.5 text-amber-400" weight="bold" />
                <span className="font-mono text-[7px] text-stone-300">typescript</span>
              </div>
              <p className="text-[8px] text-stone-400 md:text-[9px]">Type / for commands…</p>
            </div>
          </div>

          <div className="border-l border-stone-200 bg-stone-50">
            <div className="border-b border-stone-800 bg-[#1c1917] px-1.5 py-1">
              <p className="text-[7px] font-bold uppercase tracking-wider text-stone-500">
                Research
              </p>
            </div>
            <div className="space-y-2 p-1.5">
              <div className="border-l-2 border-stone-800 pl-1.5">
                <p className="text-[7px] font-bold uppercase text-stone-400">You</p>
                <p className="text-[8px] leading-snug text-stone-600">Find sources on RT sync</p>
              </div>
              <div className="border-l-2 border-amber-600 pl-1.5">
                <p className="text-[7px] font-bold uppercase text-stone-400">Assistant</p>
                <p className="text-[8px] leading-snug text-stone-600">3 sources read. Updating note…</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
          <BookOpen className="h-3 w-3" weight="bold" />
          Live workspace preview
        </div>
        <span className="bg-amber-100 px-1.5 py-px text-[9px] font-medium uppercase text-amber-900">
          Atelier UI
        </span>
      </div>
    </div>
  );
}
