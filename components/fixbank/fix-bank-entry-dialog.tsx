"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIssuesStore } from "@/lib/store/issues-store";
import type { FixBankEntry, Issue } from "@/lib/types";

interface FixBankEntryDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  issue?: Issue;
  entry?: FixBankEntry;
  onSaved?: () => void;
}

export function FixBankEntryDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  issue,
  entry,
  onSaved,
}: FixBankEntryDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const addFixBankEntry = useIssuesStore((s) => s.addFixBankEntry);
  const updateFixBankEntry = useIssuesStore((s) => s.updateFixBankEntry);

  const isEditing = !!entry;
  const [title, setTitle] = useState(entry?.title ?? issue?.title ?? "");
  const [category, setCategory] = useState(entry?.category ?? issue?.category ?? "");
  const [rootCause, setRootCause] = useState(entry?.root_cause ?? "");
  const [troubleshootingSteps, setTroubleshootingSteps] = useState(
    entry?.troubleshooting_steps ?? ""
  );
  const [fix, setFix] = useState(entry?.fix ?? "");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setTitle(entry?.title ?? issue?.title ?? "");
    setCategory(entry?.category ?? issue?.category ?? "");
    setRootCause(entry?.root_cause ?? "");
    setTroubleshootingSteps(entry?.troubleshooting_steps ?? "");
    setFix(entry?.fix ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!fix.trim()) {
      toast.error("Fix is required — what exactly resolved it?");
      return;
    }
    setSubmitting(true);
    const { error } = isEditing
      ? await updateFixBankEntry(entry.id, {
          title: title.trim(),
          category: category.trim() || null,
          root_cause: rootCause.trim() || null,
          troubleshooting_steps: troubleshootingSteps.trim() || null,
          fix: fix.trim(),
        })
      : await addFixBankEntry({
          title: title.trim(),
          category: category.trim() || undefined,
          root_cause: rootCause.trim() || undefined,
          troubleshooting_steps: troubleshootingSteps.trim() || undefined,
          fix: fix.trim(),
          issue_id: issue?.id,
        });
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(isEditing ? "Entry updated." : "Added to Fix Bank.");
    setOpen(false);
    onSaved?.();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      {!isControlled && trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Fix Bank entry" : "Add to Fix Bank"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-title">Title</Label>
            <Input
              id="fb-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What was the issue?"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-category">Category</Label>
            <Input
              id="fb-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Data Sync"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-root-cause">Root cause</Label>
            <Textarea
              id="fb-root-cause"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="What actually caused it?"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-troubleshooting">Troubleshooting steps</Label>
            <Textarea
              id="fb-troubleshooting"
              value={troubleshootingSteps}
              onChange={(e) => setTroubleshootingSteps(e.target.value)}
              placeholder="How was it tracked down?"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fb-fix">Fix</Label>
            <Textarea
              id="fb-fix"
              value={fix}
              onChange={(e) => setFix(e.target.value)}
              placeholder="Exactly what resolved it?"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Save changes" : "Add entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
