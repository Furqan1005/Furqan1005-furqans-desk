"use client";

import { useMemo } from "react";

import { IssueTable } from "@/components/issues/issue-table";
import { useIssuesStore } from "@/lib/store/issues-store";

export default function InProgressPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);

  const inProgress = useMemo(
    () => issues.filter((i) => !i.archived && i.status === "In Progress"),
    [issues]
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">In Progress</h1>
        <p className="text-sm text-muted-foreground">Everything currently being worked on.</p>
      </div>
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <IssueTable issues={inProgress} emptyMessage="Nothing is in progress right now." />
      )}
    </div>
  );
}
