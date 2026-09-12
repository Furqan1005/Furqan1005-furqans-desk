"use client";

import { useMemo } from "react";

import { IssueTable } from "@/components/issues/issue-table";
import { useIssuesStore } from "@/lib/store/issues-store";
import { isDueThisWeek } from "@/lib/issue-utils";

export default function DueThisWeekPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);

  const dueThisWeek = useMemo(() => issues.filter(isDueThisWeek), [issues]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Due This Week</h1>
        <p className="text-sm text-muted-foreground">
          Open issues with a deadline in the next 7 days.
        </p>
      </div>
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <IssueTable issues={dueThisWeek} emptyMessage="Nothing due in the next 7 days." />
      )}
    </div>
  );
}
