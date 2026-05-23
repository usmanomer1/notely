"use client";

import { useMutation } from "convex/react";
import { PushPin, PushPinSlash, Trash } from "@phosphor-icons/react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { cn, formatRelativeTime } from "@/lib/utils";

const NoteBlockEditor = dynamic(
  () =>
    import("./note-block-editor").then((mod) => ({
      default: mod.NoteBlockEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[40vh] animate-pulse bg-stone-100/60" aria-hidden />
    ),
  },
);

type NoteEditorProps = {
  note: Doc<"notes">;
};

export function NoteEditor({ note }: NoteEditorProps) {
  const updateNote = useMutation(api.notes.updateNote);
  const deleteNote = useMutation(api.notes.deleteNote);

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagsInput, setTagsInput] = useState(note.tags.join(", "));
  const [savedLabel, setSavedLabel] = useState("Saved");
  const dirtyRef = useRef(false);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTagsInput(note.tags.join(", "));
    dirtyRef.current = false;
    setSavedLabel("Saved");
  }, [note._id, note.title, note.content, note.tags]);

  useEffect(() => {
    if (!dirtyRef.current) {
      return;
    }

    setSavedLabel("Saving...");
    const timeout = window.setTimeout(() => {
      void updateNote({
        noteId: note._id,
        title,
        content,
        tags: tagsInput
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }).then(() => {
        setSavedLabel("Saved");
        dirtyRef.current = false;
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [title, content, tagsInput, note._id, updateNote]);

  function markDirty<T>(setter: (value: T) => void, value: T) {
    dirtyRef.current = true;
    setter(value);
  }

  const tags = tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-stone-300/70 bg-white/90 px-4 py-2 backdrop-blur-sm md:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-500">
          <span>Edited {formatRelativeTime(note.updatedAt)}</span>
          <span className="hidden text-stone-400 sm:inline">· Type / for blocks</span>
          {note.isPinned ? (
            <span className="bg-amber-100 px-1.5 py-px font-medium uppercase tracking-wide text-amber-800">
              Pinned
            </span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span
            className={cn(
              "mr-1 font-mono text-[10px] uppercase tracking-wider",
              savedLabel === "Saving..." ? "text-amber-700" : "text-stone-400",
            )}
          >
            {savedLabel}
          </span>
          <button
            type="button"
            onClick={() =>
              void updateNote({ noteId: note._id, isPinned: !note.isPinned })
            }
            className="p-1.5 text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
            aria-label={note.isPinned ? "Unpin note" : "Pin note"}
          >
            {note.isPinned ? (
              <PushPinSlash className="h-3.5 w-3.5" weight="bold" />
            ) : (
              <PushPin className="h-3.5 w-3.5" weight="bold" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Delete this note?")) {
                void deleteNote({ noteId: note._id });
              }
            }}
            className="p-1.5 text-stone-500 transition hover:bg-rose-50 hover:text-rose-700"
            aria-label="Delete note"
          >
            <Trash className="h-3.5 w-3.5" weight="bold" />
          </button>
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[44rem] px-4 py-6 md:px-8 md:py-8">
          <input
            value={title}
            onChange={(event) => markDirty(setTitle, event.target.value)}
            className="w-full bg-transparent text-3xl font-semibold tracking-tight text-stone-900 outline-none placeholder:text-stone-400 md:text-4xl"
            placeholder="Untitled"
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="border border-stone-300 bg-white px-2 py-0.5 text-[11px] text-stone-600"
              >
                {tag}
              </span>
            ))}
            <input
              value={tagsInput}
              onChange={(event) => markDirty(setTagsInput, event.target.value)}
              className="min-w-[160px] flex-1 bg-transparent text-xs text-stone-500 outline-none placeholder:text-stone-400"
              placeholder={tags.length ? "Edit tags..." : "Add tags, comma separated"}
            />
          </div>

          <div className="my-5 h-px bg-stone-300/80" />

          <NoteBlockEditor
            noteId={note._id}
            markdown={content}
            onMarkdownChange={(markdown) => markDirty(setContent, markdown)}
          />
        </div>
      </div>
    </div>
  );
}
