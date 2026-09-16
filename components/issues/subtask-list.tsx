"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useIssuesStore } from "@/lib/store/issues-store";
import { cn } from "@/lib/utils";

export function SubtaskList({ issueId }: { issueId: string }) {
  // Select the raw array (a stable reference unless subtasks actually change) and
  // filter outside the selector - filtering inline in the selector would return a
  // new array on every call, which makes useSyncExternalStore think the store
  // changed on every render and loops forever.
  const allSubtasks = useIssuesStore((s) => s.subtasks);
  const subtasks = allSubtasks.filter((st) => st.issue_id === issueId);
  const addSubtask = useIssuesStore((s) => s.addSubtask);
  const toggleSubtask = useIssuesStore((s) => s.toggleSubtask);
  const deleteSubtask = useIssuesStore((s) => s.deleteSubtask);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const doneCount = subtasks.filter((s) => s.done).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setSubmitting(true);
    const { error } = await addSubtask(issueId, title);
    setSubmitting(false);
    if (error) {
      toast.error(error);
      return;
    }
    setNewTitle("");
  }

  async function handleToggle(id: string, done: boolean) {
    const { error } = await toggleSubtask(id, done);
    if (error) toast.error(error);
  }

  async function handleDelete(id: string) {
    const { error } = await deleteSubtask(id);
    if (error) toast.error(error);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label>Subtasks</Label>
        {subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {doneCount} of {subtasks.length} done
          </span>
        )}
      </div>

      {subtasks.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {subtasks.map((subtask) => (
            <li key={subtask.id} className="flex items-center gap-2">
              <Checkbox
                checked={subtask.done}
                onCheckedChange={(v) => handleToggle(subtask.id, v === true)}
              />
              <span
                className={cn(
                  "flex-1 text-sm",
                  subtask.done && "text-muted-foreground line-through"
                )}
              >
                {subtask.title}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(subtask.id)}
                aria-label="Delete subtask"
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a subtask…"
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={submitting || !newTitle.trim()}
        >
          <Plus className="size-3.5" />
        </Button>
      </form>
    </div>
  );
}
