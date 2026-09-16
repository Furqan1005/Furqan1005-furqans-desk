"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2, ArrowRightCircle, Maximize2 } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIssuesStore } from "@/lib/store/issues-store";
import { NOTE_COLORS, type NoteColor, type StickyNote } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLOR_STYLES: Record<NoteColor, { bg: string; border: string; swatch: string }> = {
  yellow: { bg: "#fef3c7", border: "#fde68a", swatch: "#fbbf24" },
  pink: { bg: "#fce7f3", border: "#fbcfe8", swatch: "#f472b6" },
  blue: { bg: "#dbeafe", border: "#bfdbfe", swatch: "#60a5fa" },
  green: { bg: "#dcfce7", border: "#bbf7d0", swatch: "#4ade80" },
  purple: { bg: "#ede9fe", border: "#ddd6fe", swatch: "#a78bfa" },
};

export function StickyNoteCard({
  note,
  onConvert,
}: {
  note: StickyNote;
  onConvert: (note: StickyNote) => void;
}) {
  const updateStickyNote = useIssuesStore((s) => s.updateStickyNote);
  const deleteStickyNote = useIssuesStore((s) => s.deleteStickyNote);
  const [content, setContent] = useState(note.content);
  const [expanded, setExpanded] = useState(false);
  const style = COLOR_STYLES[note.color];

  async function saveIfChanged() {
    if (content === note.content) return;
    const { error } = await updateStickyNote(note.id, { content });
    if (error) toast.error(error);
  }

  async function setColor(color: NoteColor) {
    const { error } = await updateStickyNote(note.id, { color });
    if (error) toast.error(error);
  }

  async function remove() {
    setExpanded(false);
    const { error } = await deleteStickyNote(note.id);
    if (error) toast.error(error);
  }

  function convert() {
    setExpanded(false);
    onConvert(note);
  }

  const actions = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        {NOTE_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Set color ${c}`}
            className={cn(
              "size-4 rounded-full border transition-transform hover:scale-110",
              c === note.color && "ring-2 ring-offset-1 ring-[#1c1f2b]/40"
            )}
            style={{ backgroundColor: COLOR_STYLES[c].swatch, borderColor: COLOR_STYLES[c].border }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="Expand note"
            title="Expand note"
            className="rounded-md p-1.5 text-[#1c1f2b]/70 transition-colors hover:bg-black/5 hover:text-[#1c1f2b]"
          >
            <Maximize2 className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={convert}
          disabled={!content.trim()}
          aria-label="Convert to issue"
          title="Convert to issue"
          className="rounded-md p-1.5 text-[#1c1f2b]/70 transition-colors hover:bg-black/5 hover:text-[#1c1f2b] disabled:pointer-events-none disabled:opacity-40"
        >
          <ArrowRightCircle className="size-4" />
        </button>
        <button
          type="button"
          onClick={remove}
          aria-label="Delete note"
          title="Delete note"
          className="rounded-md p-1.5 text-[#1c1f2b]/70 transition-colors hover:bg-black/5 hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="hover-lift flex flex-col gap-2 rounded-lg border p-3 shadow-sm"
        style={{ backgroundColor: style.bg, borderColor: style.border }}
      >
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={saveIfChanged}
          placeholder="Write a quick note…"
          className="min-h-28 resize-none border-none bg-transparent p-1 leading-relaxed text-sm text-[#1c1f2b] shadow-none focus-visible:ring-0"
        />
        {actions}
      </div>

      <Dialog
        open={expanded}
        onOpenChange={(v) => {
          setExpanded(v);
          if (!v) saveIfChanged();
        }}
      >
        <DialogContent
          className="flex max-h-[85vh] flex-col sm:max-w-2xl"
          style={{ backgroundColor: style.bg, borderColor: style.border }}
        >
          <DialogHeader>
            <DialogTitle className="text-[#1c1f2b]">Note</DialogTitle>
          </DialogHeader>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a quick note…"
            autoFocus
            className="min-h-[50vh] flex-1 resize-none border-none bg-transparent p-1 leading-relaxed text-sm text-[#1c1f2b] shadow-none focus-visible:ring-0"
          />
          {actions}
        </DialogContent>
      </Dialog>
    </>
  );
}
