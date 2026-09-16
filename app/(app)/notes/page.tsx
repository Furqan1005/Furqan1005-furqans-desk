"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { NewIssueDialog } from "@/components/issues/new-issue-dialog";
import { StickyNoteCard } from "@/components/notes/sticky-note-card";
import { useIssuesStore } from "@/lib/store/issues-store";
import { NOTE_COLORS, type StickyNote } from "@/lib/types";
import { stripHtml } from "@/lib/notes";

export default function NotesPage() {
  const stickyNotes = useIssuesStore((s) => s.stickyNotes);
  const addStickyNote = useIssuesStore((s) => s.addStickyNote);
  const loading = useIssuesStore((s) => s.loading);
  const [convertingNote, setConvertingNote] = useState<StickyNote | null>(null);

  async function addNote() {
    const color = NOTE_COLORS[stickyNotes.length % NOTE_COLORS.length];
    const { error } = await addStickyNote(color);
    if (error) toast.error(error);
  }

  const plainContent = convertingNote ? stripHtml(convertingNote.content) : "";
  const firstLine = plainContent.split("\n")[0]?.trim() ?? "";
  const initialTitle = firstLine.length > 0 && firstLine.length <= 80 ? firstLine : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Sticky Notes</h1>
          <p className="text-sm text-muted-foreground">
            Quick scratchpad for yourself — jot something down, then convert it into a real
            issue whenever it&apos;s ready, or just delete it.
          </p>
        </div>
        <Button size="sm" onClick={addNote}>
          <Plus />
          New Note
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading notes…</div>
      ) : stickyNotes.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16 text-sm text-muted-foreground">
          No notes yet — click &quot;New Note&quot; to jot something down.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stickyNotes.map((note) => (
            <StickyNoteCard key={note.id} note={note} onConvert={setConvertingNote} />
          ))}
        </div>
      )}

      <NewIssueDialog
        key={convertingNote?.id ?? "none"}
        open={!!convertingNote}
        onOpenChange={(v) => !v && setConvertingNote(null)}
        initialTitle={initialTitle}
        initialDescription={plainContent}
        onCreated={() => {
          if (convertingNote) {
            useIssuesStore.getState().deleteStickyNote(convertingNote.id);
          }
          setConvertingNote(null);
        }}
      />
    </div>
  );
}
