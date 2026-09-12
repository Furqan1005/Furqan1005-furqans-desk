"use client";

import { useMemo } from "react";

import { SummaryCards } from "@/components/issues/summary-cards";
import { IssueTable } from "@/components/issues/issue-table";
import { SummarizeDialog } from "@/components/ai/summarize-dialog";
import { NewIssueDialog } from "@/components/issues/new-issue-dialog";
import { useIssuesStore } from "@/lib/store/issues-store";
import { computeOverviewCounts, isOverdue, sortByPriorityThenDeadline } from "@/lib/issue-utils";
import { useCurrentUser } from "@/lib/auth/user-context";

export default function OverviewPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);
  const user = useCurrentUser();

  const counts = useMemo(() => computeOverviewCounts(issues), [issues]);

  const topIssues = useMemo(() => {
    const active = issues.filter((i) => !i.archived && i.status !== "Fixed" && i.status !== "Won't Fix");
    return [...active]
      .sort((a, b) => {
        const overdueDiff = Number(isOverdue(b)) - Number(isOverdue(a));
        if (overdueDiff !== 0) return overdueDiff;
        return sortByPriorityThenDeadline(a, b);
      })
      .slice(0, 8);
  }, [issues]);

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s where things stand today.</p>
        </div>
        <div className="flex items-center gap-2">
          <SummarizeDialog />
          <NewIssueDialog />
        </div>
      </div>

      <SummaryCards
        open={counts.open}
        inProgress={counts.inProgress}
        fixedThisWeek={counts.fixedThisWeek}
        overdue={counts.overdue}
      />

      <div>
        <h2 className="mb-2 text-sm font-medium text-muted-foreground">
          Top priority &amp; overdue
        </h2>
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
        ) : (
          <IssueTable issues={topIssues} emptyMessage="Nothing urgent right now." />
        )}
      </div>
    </div>
  );
}
