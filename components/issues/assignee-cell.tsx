"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIssuesStore, describeAssigneeChange } from "@/lib/store/issues-store";
import type { Issue } from "@/lib/types";

export function AssigneeCell({ issue }: { issue: Issue }) {
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const allIssues = useIssuesStore((s) => s.issues);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(issue.assigned_to ?? "");

  const knownAssignees = useMemo(
    () =>
      Array.from(
        new Set(allIssues.map((i) => i.assigned_to).filter((a): a is string => !!a))
      ).sort((a, b) => a.localeCompare(b)),
    [allIssues]
  );

  async function commit(next: string) {
    const trimmed = next.trim() || null;
    if (trimmed === issue.assigned_to) {
      setOpen(false);
      return;
    }
    const { error } = await updateIssue(
      issue.id,
      { assigned_to: trimmed },
      describeAssigneeChange(issue.assigned_to, trimmed)
    );
    if (error) toast.error(error);
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) setValue(issue.assigned_to ?? "");
      }}
    >
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground">
          <UserRound className="size-3.5 text-muted-foreground" />
          {issue.assigned_to ?? <span className="text-muted-foreground">Unassigned</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            commit(value);
          }}
          className="flex flex-col gap-2"
        >
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type a name…"
          />
          {knownAssignees.length > 0 && (
            <div className="flex max-h-40 flex-col gap-0.5 overflow-y-auto">
              {knownAssignees.map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => commit(name)}
                  className="rounded-sm px-2 py-1 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => commit("")}>
              Unassign
            </Button>
            <Button type="submit" size="sm">
              Save
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
