"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PriorityBadge } from "@/components/issues/priority-badge";
import { StatusBadge } from "@/components/issues/status-badge";
import { NewIssueDialog } from "@/components/issues/new-issue-dialog";
import { useIssuesStore } from "@/lib/store/issues-store";
import { cn } from "@/lib/utils";
import type { Issue } from "@/lib/types";

export default function CalendarPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);
  const [month, setMonth] = useState(() => new Date());
  const [addForDate, setAddForDate] = useState<string | null>(null);

  const issuesByDay = useMemo(() => {
    const map = new Map<string, Issue[]>();
    for (const issue of issues) {
      if (issue.archived || !issue.deadline) continue;
      const key = issue.deadline;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(issue);
    }
    return map;
  }, [issues]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Issues plotted against their deadline. Hover a day and click + to add a reminder.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-32 text-center text-sm font-medium">{format(month, "MMMM yyyy")}</span>
          <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMonth(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-7 border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const dayIssues = issuesByDay.get(key) ?? [];
              const inMonth = isSameMonth(day, month);
              const visible = dayIssues.slice(0, 3);
              const overflow = dayIssues.length - visible.length;

              return (
                <div
                  key={key}
                  className={cn(
                    "group relative min-h-24 border-b border-r border-border p-1.5 transition-colors last:border-r-0 hover:bg-muted/30",
                    !inMonth && "bg-muted/20"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <div
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-xs transition-colors",
                        isToday(day) && "bg-primary font-semibold text-primary-foreground",
                        !inMonth && "text-muted-foreground/50"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    <button
                      onClick={() => setAddForDate(key)}
                      aria-label={`Add issue with deadline ${key}`}
                      className="flex size-5 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all duration-150 hover:bg-primary hover:text-primary-foreground group-hover:opacity-100"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {visible.map((issue) => (
                      <IssueChip key={issue.id} issue={issue} />
                    ))}
                    {overflow > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="text-left text-[11px] font-medium text-primary hover:underline">
                            +{overflow} more
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="flex w-64 flex-col gap-2">
                          {dayIssues.map((issue) => (
                            <IssueChip key={issue.id} issue={issue} full />
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <NewIssueDialog
        key={addForDate ?? "none"}
        open={addForDate !== null}
        onOpenChange={(v) => !v && setAddForDate(null)}
        initialDeadline={addForDate ?? undefined}
      />
    </div>
  );
}

function IssueChip({ issue, full }: { issue: Issue; full?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "w-full truncate rounded border-l-2 bg-secondary px-1.5 py-0.5 text-left text-[11px] font-medium text-secondary-foreground transition-all hover:-translate-y-px hover:opacity-80 hover:shadow-sm",
            issue.priority === "Critical" && "border-l-destructive",
            issue.priority === "High" && "border-l-warning",
            issue.priority === "Medium" && "border-l-primary",
            issue.priority === "Low" && "border-l-muted-foreground"
          )}
        >
          {issue.title}
        </button>
      </PopoverTrigger>
      <PopoverContent className={cn("flex flex-col gap-1.5", full && "w-72")}>
        <p className="text-sm font-medium">{issue.title}</p>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
        {issue.assigned_to && (
          <p className="text-xs text-muted-foreground">Assigned to {issue.assigned_to}</p>
        )}
        {issue.remarks && <p className="text-xs text-muted-foreground">{issue.remarks}</p>}
      </PopoverContent>
    </Popover>
  );
}
