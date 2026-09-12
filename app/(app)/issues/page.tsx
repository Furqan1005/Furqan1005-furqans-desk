"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NewIssueDialog } from "@/components/issues/new-issue-dialog";
import { IssueTable } from "@/components/issues/issue-table";
import { IssueFilters, EMPTY_FILTERS, type IssueFilterState } from "@/components/issues/issue-filters";
import { AiSearchBar } from "@/components/issues/ai-search-bar";
import { useIssuesStore } from "@/lib/store/issues-store";
import { parseDate } from "@/lib/issue-utils";
import { downloadCsv, issuesToCsv } from "@/lib/csv";

export default function AllIssuesPage() {
  const issues = useIssuesStore((s) => s.issues);
  const loading = useIssuesStore((s) => s.loading);
  const [filters, setFilters] = useState<IssueFilterState>(EMPTY_FILTERS);

  const categories = useMemo(
    () => Array.from(new Set(issues.map((i) => i.category).filter((c): c is string => !!c))).sort(),
    [issues]
  );
  const assignees = useMemo(
    () =>
      Array.from(new Set(issues.map((i) => i.assigned_to).filter((a): a is string => !!a))).sort(),
    [issues]
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const from = filters.from ? parseDate(filters.from) : null;
    const to = filters.to ? parseDate(filters.to) : null;

    return issues.filter((issue) => {
      if (issue.archived) return false;
      if (filters.status !== "all" && issue.status !== filters.status) return false;
      if (filters.priority !== "all" && issue.priority !== filters.priority) return false;
      if (filters.category !== "all" && issue.category !== filters.category) return false;
      if (filters.assignee !== "all" && issue.assigned_to !== filters.assignee) return false;
      if (search) {
        const haystack = `${issue.title} ${issue.description ?? ""} ${issue.remarks ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      if (from || to) {
        const deadline = parseDate(issue.deadline);
        if (!deadline) return false;
        if (from && deadline.getTime() < from.getTime()) return false;
        if (to && deadline.getTime() > to.getTime()) return false;
      }
      return true;
    });
  }, [issues, filters]);

  function handleExport() {
    const csv = issuesToCsv(filtered);
    downloadCsv(`furqans-desk-issues-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">All Issues</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} of {issues.filter((i) => !i.archived).length} issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download />
            Export CSV
          </Button>
          <NewIssueDialog />
        </div>
      </div>

      <AiSearchBar categories={categories} assignees={assignees} onParsed={setFilters} />

      <IssueFilters value={filters} onChange={setFilters} categories={categories} assignees={assignees} />

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading issues…</div>
      ) : (
        <IssueTable issues={filtered} emptyMessage="No issues match your filters." />
      )}
    </div>
  );
}
