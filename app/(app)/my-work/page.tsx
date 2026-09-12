"use client";

import { useMemo } from "react";

import { IssueTable } from "@/components/issues/issue-table";
import { useIssuesStore } from "@/lib/store/issues-store";
import { useCurrentUser } from "@/lib/auth/user-context";
import { matchesAssignee } from "@/lib/issue-utils";

export default function MyWorkPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);
  const user = useCurrentUser();

  const mine = useMemo(
    () => issues.filter((i) => !i.archived && matchesAssignee(i, user.fullName)),
    [issues, user.fullName]
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">My Work</h1>
        <p className="text-sm text-muted-foreground">
          Issues assigned to {user.fullName}.{" "}
          {user.fullName === user.email && (
            <>Set your name in Settings if this looks wrong.</>
          )}
        </p>
      </div>
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <IssueTable
          issues={mine}
          emptyMessage={`No issues assigned to "${user.fullName}" yet.`}
        />
      )}
    </div>
  );
}
