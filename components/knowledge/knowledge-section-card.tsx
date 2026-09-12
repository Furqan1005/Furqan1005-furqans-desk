"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIssuesStore } from "@/lib/store/issues-store";
import type { KnowledgeSection } from "@/lib/types";

export function KnowledgeSectionCard({ section }: { section: KnowledgeSection }) {
  const updateKnowledgeSection = useIssuesStore((s) => s.updateKnowledgeSection);
  const deleteKnowledgeSection = useIssuesStore((s) => s.deleteKnowledgeSection);

  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [saving, setSaving] = useState(false);

  const dirty = title !== section.title || content !== section.content;

  async function save() {
    setSaving(true);
    const { error } = await updateKnowledgeSection(section.id, { title, content });
    setSaving(false);
    if (error) toast.error(error);
    else toast.success("Saved.");
  }

  async function remove() {
    if (!confirm(`Delete the "${section.title}" section? This cannot be undone.`)) return;
    const { error } = await deleteKnowledgeSection(section.id);
    if (error) toast.error(error);
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-medium"
          placeholder="Section title"
        />
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={remove}
          aria-label={`Delete ${section.title}`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-40 font-mono text-sm"
        placeholder="Explain this in your own words - terms, workflow steps, examples..."
      />
      {dirty && (
        <Button size="sm" className="w-fit" onClick={save} disabled={saving}>
          <Save />
          {saving ? "Saving..." : "Save changes"}
        </Button>
      )}
    </div>
  );
}
