"use client";

import { useMemo, useState } from "react";

import { IssueTable } from "@/components/issues/issue-table";
import { NewIssueDialog } from "@/components/issues/new-issue-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIssuesStore } from "@/lib/store/issues-store";
import { useCurrentUser } from "@/lib/auth/user-context";
import { matchesAssignee } from "@/lib/issue-utils";
import { STATUS_OPTIONS, type IssueStatus } from "@/lib/types";

export default function MyWorkPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);
  const user = useCurrentUser();
  const [status, setStatus] = useState<IssueStatus | "all">("all");

  const mine = useMemo(
    () => issues.filter((i) => !i.archived && matchesAssignee(i, user.fullName)),
    [issues, user.fullName]
  );

  const filtered = useMemo(
    () => (status === "all" ? mine : mine.filter((i) => i.status === status)),
    [mine, status]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">My Work</h1>
          <p className="text-sm text-muted-foreground">
            Issues assigned to {user.fullName}.{" "}
            {user.fullName === user.email && (
              <>Set your name in Settings if this looks wrong.</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as IssueStatus | "all")}>
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NewIssueDialog initialAssignedTo={user.fullName} />
        </div>
      </div>
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <IssueTable
          issues={filtered}
          emptyMessage={
            status === "all"
              ? `No issues assigned to "${user.fullName}" yet.`
              : `No "${status}" issues assigned to "${user.fullName}".`
          }
        />
      )}
    </div>
  );
}
