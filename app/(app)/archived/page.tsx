"use client";

import { useMemo } from "react";

import { IssueTable } from "@/components/issues/issue-table";
import { useIssuesStore } from "@/lib/store/issues-store";

export default function ArchivedPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);

  const archived = useMemo(() => issues.filter((i) => i.archived), [issues]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Archived</h1>
        <p className="text-sm text-muted-foreground">Issues you&apos;ve archived out of active view.</p>
      </div>
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <IssueTable issues={archived} emptyMessage="Nothing archived yet." />
      )}
    </div>
  );
}
