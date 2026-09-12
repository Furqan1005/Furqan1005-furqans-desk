"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIssuesStore } from "@/lib/store/issues-store";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, type IssuePriority, type IssueStatus } from "@/lib/types";

interface Suggestion {
  category?: string;
  priority?: IssuePriority;
  reason?: string;
}

export function NewIssueDialog() {
  const [open, setOpen] = useState(false);
  const addIssue = useIssuesStore((s) => s.addIssue);
  const settings = useIssuesStore((s) => s.settings);
  const categories = settings?.categories ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<IssueStatus>(settings?.default_status ?? "Open");
  const [priority, setPriority] = useState<IssuePriority>(settings?.default_priority ?? "Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (title.trim().length < 5) {
      // Clearing a stale suggestion once the title shrinks below the trigger length.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestion(null);
      return;
    }
    setDismissed(false);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, categories }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.category || data.priority) {
          setSuggestion({ category: data.category, priority: data.priority, reason: data.reason });
        }
      } catch {
        // AI suggestion is best-effort; silently ignore failures.
      }
    }, 700);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, open]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("");
    setStatus(settings?.default_status ?? "Open");
    setPriority(settings?.default_priority ?? "Medium");
    setAssignedTo("");
    setStartDate("");
    setDeadline("");
    setRemarks("");
    setSuggestion(null);
    setDismissed(false);
  }

  function acceptSuggestion() {
    if (!suggestion) return;
    if (suggestion.category) setCategory(suggestion.category);
    if (suggestion.priority) setPriority(suggestion.priority);
    setDismissed(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }
    setSubmitting(true);
    const { error } = await addIssue({
      title: title.trim(),
      description: description.trim() || undefined,
      category: category.trim() || undefined,
      status,
      priority,
      assigned_to: assignedTo.trim() || undefined,
      start_date: startDate || undefined,
      deadline: deadline || undefined,
      remarks: remarks.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Issue created.");
    resetForm();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus />
          New Issue
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ni-title">Title</Label>
            <Input
              id="ni-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's broken?"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ni-description">Description</Label>
            <Textarea
              id="ni-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra detail…"
            />
          </div>

          {suggestion && !dismissed && (
            <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-secondary px-3 py-2 text-sm">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="text-secondary-foreground">
                  Suggested{suggestion.priority ? ` priority: ${suggestion.priority}` : ""}
                  {suggestion.category ? `${suggestion.priority ? ", " : ""}category: ${suggestion.category}` : ""}
                </p>
                {suggestion.reason && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{suggestion.reason}</p>
                )}
                <div className="mt-2 flex gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={acceptSuggestion}>
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDismissed(true)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss suggestion"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ni-category">Category</Label>
              <Input
                id="ni-category"
                list="category-options"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Data Sync"
              />
              <datalist id="category-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ni-assigned">Assigned to</Label>
              <Input
                id="ni-assigned"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g. Kaushal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as IssuePriority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ni-start">Start date</Label>
              <Input
                id="ni-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ni-deadline">Deadline</Label>
              <Input
                id="ni-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ni-remarks">Remarks</Label>
            <Textarea
              id="ni-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Notes, blockers, context…"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
