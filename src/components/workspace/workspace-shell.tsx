"use client";

import { UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import {
  CaretDown,
  FolderSimple,
  Key,
  MagnifyingGlass,
  NotePencil,
  Plus,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { cn, formatRelativeTime, notePreviewText } from "@/lib/utils";
import { NoteListSkeleton } from "@/components/ui/skeleton";
import { NoteEditor } from "./note-editor";
import { AiAssistantPanel } from "./ai-assistant-panel";

export function WorkspaceShell({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const ensureDefaultNotebook = useMutation(api.notes.ensureDefaultNotebook);
  const createNotebook = useMutation(api.notes.createNotebook);
  const createNote = useMutation(api.notes.createNote);
  const notebooks = useQuery(api.notes.listNotebooks);

  const [selectedNotebookId, setSelectedNotebookId] = useState<Id<"notebooks"> | null>(
    null,
  );
  const [selectedNoteId, setSelectedNoteId] = useState<Id<"notes"> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    if (bootstrapped) return;
    void ensureDefaultNotebook({}).then((id) => {
      setSelectedNotebookId(id);
      setBootstrapped(true);
    });
  }, [bootstrapped, ensureDefaultNotebook]);

  useEffect(() => {
    if (!selectedNotebookId && notebooks?.length) {
      setSelectedNotebookId(notebooks[0]._id);
    }
  }, [notebooks, selectedNotebookId]);

  const notes = useQuery(
    api.notes.listNotes,
    selectedNotebookId ? { notebookId: selectedNotebookId } : "skip",
  );

  const searchResults = useQuery(
    api.notes.searchNotes,
    searchQuery.trim()
      ? { query: searchQuery, notebookId: selectedNotebookId ?? undefined }
      : "skip",
  );

  const visibleNotes = useMemo(() => {
    if (searchQuery.trim() && searchResults) {
      return searchResults;
    }
    return notes ?? [];
  }, [notes, searchQuery, searchResults]);

  const selectedNote = useQuery(
    api.notes.getNote,
    selectedNoteId ? { noteId: selectedNoteId } : "skip",
  );

  const selectedNotebook = notebooks?.find((n) => n._id === selectedNotebookId);

  useEffect(() => {
    if (!selectedNoteId && visibleNotes.length > 0) {
      setSelectedNoteId(visibleNotes[0]._id);
    }
  }, [selectedNoteId, visibleNotes]);

  async function handleCreateNotebook() {
    const title = window.prompt("Notebook name", "New notebook");
    if (!title) return;
    const id = await createNotebook({ title });
    setSelectedNotebookId(id);
  }

  async function handleCreateNote() {
    if (!selectedNotebookId) return;
    const id = await createNote({ notebookId: selectedNotebookId });
    setSelectedNoteId(id);
  }

  const loading = notebooks === undefined || (selectedNotebookId && notes === undefined);

  return (
    <div className="flex h-[100dvh] flex-col bg-[#e5e2dc] text-stone-900">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-stone-800 bg-[#1c1917] px-3 text-white md:gap-4 md:px-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-amber-600">
            <NotePencil className="h-3.5 w-3.5 text-white" weight="fill" />
          </div>
          <span className="hidden text-sm font-medium tracking-tight sm:inline">
            Notely
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          <FolderSimple className="hidden h-3.5 w-3.5 shrink-0 text-stone-500 sm:block" />
          <div className="relative min-w-0">
            <select
              value={selectedNotebookId ?? ""}
              onChange={(event) => {
                setSelectedNotebookId(event.target.value as Id<"notebooks">);
                setSelectedNoteId(null);
                setSearchQuery("");
              }}
              className="max-w-[140px] cursor-pointer appearance-none border border-stone-600 bg-stone-800 py-1 pl-2 pr-7 text-xs text-white outline-none focus:border-amber-600 sm:max-w-[180px] sm:text-sm"
            >
              {notebooks?.map((notebook) => (
                <option key={notebook._id} value={notebook._id}>
                  {notebook.title}
                </option>
              ))}
            </select>
            <CaretDown
              className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-stone-400"
              weight="bold"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleCreateNotebook()}
            className="shrink-0 p-1.5 text-stone-400 transition hover:bg-stone-800 hover:text-white"
            aria-label="Create notebook"
          >
            <Plus className="h-3.5 w-3.5" weight="bold" />
          </button>
        </div>

        <label className="mx-auto hidden min-w-0 max-w-md flex-1 items-center gap-2 border border-stone-700 bg-stone-800/80 px-2.5 py-1.5 md:flex">
          <MagnifyingGlass className="h-3.5 w-3.5 shrink-0 text-stone-500" weight="bold" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search in notebook..."
            className="w-full bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
          />
        </label>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {onOpenSettings ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1.5 border border-stone-600 px-2 py-1 text-xs text-stone-300 transition hover:border-stone-400 hover:text-white"
              aria-label="API keys"
            >
              <Key className="h-3.5 w-3.5" weight="bold" />
              <span className="hidden sm:inline">Keys</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleCreateNote()}
            className="inline-flex items-center gap-1.5 bg-amber-600 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-amber-500"
          >
            <Plus className="h-3.5 w-3.5" weight="bold" />
            <span className="hidden sm:inline">New note</span>
          </button>
          <UserButton />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-2.5 p-2.5 md:gap-3 md:p-3">
        <aside className="flex w-[248px] shrink-0 flex-col border border-[#cfc9bf] bg-white lg:w-[280px]">
          <div className="border-b border-[#e7e3dc] px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">
              Library
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-stone-800">
              {selectedNotebook?.title ?? "Notebook"}
            </p>
            <p className="mt-0.5 text-[11px] text-stone-500">
              {visibleNotes.length} {visibleNotes.length === 1 ? "note" : "notes"}
            </p>
          </div>

          <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? (
              <NoteListSkeleton variant="cards" />
            ) : visibleNotes.length === 0 ? (
              <div className="border border-dashed border-stone-300 p-4 text-center">
                <p className="text-xs leading-5 text-stone-500">
                  This notebook is empty. Create your first note below.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleNotes.map((note) => {
                  const selected = selectedNoteId === note._id;
                  return (
                    <button
                      key={note._id}
                      type="button"
                      onClick={() => setSelectedNoteId(note._id)}
                      className={cn(
                        "block w-full border p-3 text-left transition",
                        selected
                          ? "border-stone-900 bg-stone-50"
                          : "border-stone-200 bg-white hover:border-stone-400",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={cn(
                            "line-clamp-1 text-sm leading-snug",
                            selected ? "font-semibold text-stone-900" : "text-stone-800",
                          )}
                        >
                          {note.title || "Untitled note"}
                        </span>
                        {note.isPinned ? (
                          <span className="shrink-0 bg-amber-100 px-1 py-px text-[9px] font-bold uppercase text-amber-800">
                            pin
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-stone-500">
                        {notePreviewText(note.content)}
                      </p>
                      <p className="mt-2 font-mono text-[10px] text-stone-400">
                        {formatRelativeTime(note.updatedAt)}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-[#e7e3dc] p-2">
            <button
              type="button"
              onClick={() => void handleCreateNote()}
              className="flex w-full items-center justify-center gap-1.5 border border-dashed border-stone-300 py-2 text-xs text-stone-600 transition hover:border-stone-500 hover:bg-stone-50 hover:text-stone-900"
            >
              <Plus className="h-3.5 w-3.5" weight="bold" />
              Add note
            </button>
          </div>
        </aside>

        <main className="workspace-desk flex min-w-0 flex-1 flex-col border border-[#cfc9bf] bg-[#faf9f7]">
          {selectedNote ? (
            <NoteEditor note={selectedNote} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center border border-stone-300 bg-white">
                <NotePencil className="h-5 w-5 text-stone-400" weight="duotone" />
              </div>
              <p className="text-base font-medium text-stone-800">Your desk is clear</p>
              <p className="mt-1 max-w-xs text-sm leading-6 text-stone-500">
                Pick a note from the library or start a new one. The research panel on the
                right stays tied to whatever you are editing.
              </p>
              <button
                type="button"
                onClick={() => void handleCreateNote()}
                className="mt-5 bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-800"
              >
                Create a note
              </button>
            </div>
          )}
        </main>

        <AiAssistantPanel note={selectedNote ?? null} />
      </div>
    </div>
  );
}
