"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIssuesStore, describeDeadlineChange } from "@/lib/store/issues-store";
import { formatDate, isOverdue } from "@/lib/issue-utils";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

export function DeadlineCell({ issue }: { issue: Issue }) {
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const [open, setOpen] = useState(false);

  async function commit(next: string) {
    const value = next || null;
    if (value === issue.deadline) {
      setOpen(false);
      return;
    }
    const { error } = await updateIssue(
      issue.id,
      { deadline: value },
      describeDeadlineChange(issue.deadline, value)
    );
    if (error) toast.error(error);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
            !issue.deadline && "text-muted-foreground"
          )}
        >
          <CalendarDays
            className={cn(
              "size-3.5 text-muted-foreground",
              isOverdue(issue) && "text-destructive"
            )}
          />
          {formatDate(issue.deadline)}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="flex flex-col gap-2">
          <Input
            autoFocus
            type="date"
            defaultValue={issue.deadline ?? ""}
            onChange={(e) => commit(e.target.value)}
          />
          {issue.deadline && (
            <button
              onClick={() => commit("")}
              className="rounded-sm px-2 py-1 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Clear deadline
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
