"use client";

import { useMutation } from "convex/react";
import {
  optimisticallySendMessage,
  useSmoothText,
  useUIMessages,
  type UIMessage,
} from "@convex-dev/agent/react";
import { CircleNotch, GlobeHemisphereWest, PaperPlaneTilt } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ChatMarkdown } from "./chat-markdown";

const quickPrompts = [
  "Research and outline this topic",
  "Summarize and improve my note",
  "Find sources with citations",
  "Turn into action items",
];

type AiAssistantPanelProps = {
  note: Doc<"notes"> | null;
};

export function AiAssistantPanel({ note }: AiAssistantPanelProps) {
  return (
    <aside className="hidden w-[300px] shrink-0 flex-col border border-[#cfc9bf] bg-white lg:flex xl:w-[340px]">
      <div className="border-b border-stone-800 bg-[#1c1917] px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500">
          Research
        </p>
        <div className="mt-1 flex items-center gap-2">
          <GlobeHemisphereWest className="h-4 w-4 text-amber-500" weight="duotone" />
          <p className="text-sm font-medium text-white">Assistant</p>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-stone-400">
          Search, read sources, edit your note
        </p>
      </div>

      {!note?.threadId ? (
        <div className="flex flex-1 flex-col justify-center px-5">
          <p className="text-sm font-medium text-stone-800">Waiting for a note</p>
          <p className="mt-1.5 text-xs leading-5 text-stone-500">
            Select or create a note to open its dedicated research thread.
          </p>
        </div>
      ) : (
        <AiAssistantPanelActive note={note} />
      )}
    </aside>
  );
}

function AiAssistantPanelActive({ note }: { note: Doc<"notes"> }) {
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listThreadMessages),
  );

  const messages = useUIMessages(
    api.chat.listThreadMessages,
    { threadId: note.threadId! },
    { initialNumItems: 20, stream: true },
  );

  const isStreaming = messages.results.some((message) => message.status === "streaming");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.results]);

  async function handleSend(nextPrompt?: string) {
    const value = (nextPrompt ?? prompt).trim();
    if (!value || !note.threadId) return;
    setPrompt("");
    await sendMessage({
      threadId: note.threadId,
      noteId: note._id,
      prompt: value,
    });
  }

  return (
    <>
      <div className="border-b border-[#e7e3dc] bg-[#f7f5f1] px-3 py-2.5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
          Quick actions
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {quickPrompts.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => void handleSend(item)}
              className="border border-stone-300 bg-white px-2 py-1.5 text-left text-[10px] leading-4 text-stone-600 transition hover:border-stone-500 hover:text-stone-900"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {messages.results.length === 0 ? (
          <p className="text-xs leading-5 text-stone-500">
            Ask anything about your note. The assistant can search the web through Browserbase
            and write changes back into the document.
          </p>
        ) : (
          <div className="space-y-0">
            {messages.results.map((message, index) => (
              <ChatMessage
                key={message.key}
                message={message}
                isLast={index === messages.results.length - 1}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        className="shrink-0 border-t border-[#e7e3dc] bg-[#faf9f7] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSend();
        }}
      >
        <div className="border border-stone-300 bg-white">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={3}
            placeholder="Ask the assistant..."
            className="min-h-[76px] w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-stone-800 outline-none placeholder:text-stone-400"
          />
          <div className="flex items-center justify-between border-t border-stone-200 px-2 py-1.5">
            <span className="text-[10px] text-stone-400">
              {isStreaming ? "Assistant is responding..." : "Enter to send"}
            </span>
            <button
              type="submit"
              disabled={!prompt.trim() || isStreaming}
              className="inline-flex items-center gap-1.5 bg-amber-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              {isStreaming ? (
                <CircleNotch className="h-3.5 w-3.5 animate-spin" weight="bold" />
              ) : (
                <PaperPlaneTilt className="h-3.5 w-3.5" weight="fill" />
              )}
              Send
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

function ChatMessage({
  message,
  isLast,
}: {
  message: UIMessage;
  isLast: boolean;
}) {
  const isUser = message.role === "user";
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  return (
    <div className="relative pb-5 pl-5">
      {!isLast ? (
        <span
          className="absolute bottom-0 left-[5px] top-3 w-px bg-stone-200"
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          "absolute left-0 top-2 h-[11px] w-[11px] border-2 border-white",
          isUser ? "bg-stone-800" : "bg-amber-600",
        )}
        aria-hidden
      />
      <div>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
            {isUser ? "You" : "Assistant"}
          </span>
          {message.status === "streaming" ? (
            <span className="text-[10px] text-amber-700">live</span>
          ) : null}
        </div>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-6 text-stone-700">
            {visibleText || "..."}
          </p>
        ) : (
          <ChatMarkdown content={visibleText || "..."} className="text-sm leading-6 text-stone-700" />
        )}
      </div>
    </div>
  );
}
