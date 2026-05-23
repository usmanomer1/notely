"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useEffect, useRef, useState } from "react";
import { blockNoteSchema } from "./blocknote-schema";

type NoteBlockEditorProps = {
  noteId: string;
  markdown: string;
  onMarkdownChange: (markdown: string) => void;
};

export function NoteBlockEditor({
  noteId,
  markdown,
  onMarkdownChange,
}: NoteBlockEditorProps) {
  const editor = useCreateBlockNote(
    {
      schema: blockNoteSchema,
      placeholders: {
        default: "Type / for commands…",
        emptyDocument: "Start writing, or type / for commands",
      },
      domAttributes: {
        editor: {
          class: "note-block-editor",
        },
      },
    },
    [noteId],
  );

  const [ready, setReady] = useState(false);
  const lastMarkdownRef = useRef(markdown);
  const skipChangeRef = useRef(false);

  useEffect(() => {
    setReady(false);
  }, [noteId]);

  useEffect(() => {
    skipChangeRef.current = true;
    const blocks = editor.tryParseMarkdownToBlocks(markdown || "");
    editor.replaceBlocks(editor.document, blocks);
    lastMarkdownRef.current = markdown;
    skipChangeRef.current = false;
    setReady(true);
    // Load document when switching notes (editor instance is recreated per noteId).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ignore markdown while typing
  }, [editor, noteId]);

  useEffect(() => {
    if (!ready || markdown === lastMarkdownRef.current) {
      return;
    }

    skipChangeRef.current = true;
    const blocks = editor.tryParseMarkdownToBlocks(markdown || "");
    editor.replaceBlocks(editor.document, blocks);
    lastMarkdownRef.current = markdown;
    skipChangeRef.current = false;
  }, [editor, markdown, ready]);

  if (!ready) {
    return (
      <div className="min-h-[40vh] animate-pulse bg-stone-100/60" aria-hidden />
    );
  }

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      onChange={() => {
        if (skipChangeRef.current) {
          return;
        }

        const nextMarkdown = editor.blocksToMarkdownLossy();
        if (nextMarkdown === lastMarkdownRef.current) {
          return;
        }

        lastMarkdownRef.current = nextMarkdown;
        onMarkdownChange(nextMarkdown);
      }}
    />
  );
}
