"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useIssuesStore } from "@/lib/store/issues-store";
import type { FixBankEntry } from "@/lib/types";
import { FixBankEntryDialog } from "./fix-bank-entry-dialog";

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
}

export function FixBankEntryCard({ entry }: { entry: FixBankEntry }) {
  const issues = useIssuesStore((s) => s.issues);
  const deleteFixBankEntry = useIssuesStore((s) => s.deleteFixBankEntry);
  const [editing, setEditing] = useState(false);

  const linkedIssue = entry.issue_id ? issues.find((i) => i.id === entry.issue_id) : undefined;

  async function handleDelete() {
    if (!confirm(`Delete "${entry.title}" from the Fix Bank? This cannot be undone.`)) return;
    const { error } = await deleteFixBankEntry(entry.id);
    if (error) toast.error(error);
    else toast.success("Entry deleted.");
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium">{entry.title}</h3>
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.category && <Badge variant="secondary">{entry.category}</Badge>}
              {linkedIssue && <Badge variant="outline">From: {linkedIssue.title}</Badge>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit entry"
              title="Edit entry"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete entry"
              title="Delete entry"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Field label="Root cause" value={entry.root_cause} />
          <Field label="Troubleshooting steps" value={entry.troubleshooting_steps} />
          <Field label="Fix" value={entry.fix} />
        </CardContent>
      </Card>

      <FixBankEntryDialog open={editing} onOpenChange={setEditing} entry={entry} />
    </>
  );
}
