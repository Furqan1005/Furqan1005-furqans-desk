"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  Columns3,
  GripVertical,
  CornerDownRight,
  Undo2,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "./priority-badge";
import { EditIssueDialog } from "./edit-issue-dialog";
import { AssigneeCell } from "./assignee-cell";
import { DeadlineCell } from "./deadline-cell";
import {
  useIssuesStore,
  describeStatusChange,
  describePriorityChange,
  describeParentChange,
} from "@/lib/store/issues-store";
import { isOverdue } from "@/lib/issue-utils";
import { cn } from "@/lib/utils";
import {
  INTAKE_FIELD_LABELS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type Issue,
  type IssuePriority,
  type IssueStatus,
} from "@/lib/types";

const INTAKE_KEYS = Object.keys(INTAKE_FIELD_LABELS) as (keyof typeof INTAKE_FIELD_LABELS)[];
const COLUMNS_STORAGE_KEY = "furqans-desk-issue-table-extra-columns";

interface Row {
  issue: Issue;
  depth: number;
}

// Nest any issue directly under its parent when the parent is also present in
// this same list - a purely visual grouping, since an issue's parent may not
// always be in the current filtered view (e.g. a different assignee).
function buildDisplayOrder(issues: Issue[]): Row[] {
  const byId = new Map(issues.map((i) => [i.id, i]));
  const childrenOf = new Map<string, Issue[]>();
  for (const issue of issues) {
    if (issue.parent_id && byId.has(issue.parent_id)) {
      const list = childrenOf.get(issue.parent_id) ?? [];
      list.push(issue);
      childrenOf.set(issue.parent_id, list);
    }
  }
  const topLevel = issues.filter((i) => !i.parent_id || !byId.has(i.parent_id));

  const rows: Row[] = [];
  const visited = new Set<string>();
  function walk(issue: Issue, depth: number) {
    if (visited.has(issue.id)) return; // guard against a cycle
    visited.add(issue.id);
    rows.push({ issue, depth });
    for (const child of childrenOf.get(issue.id) ?? []) {
      walk(child, depth + 1);
    }
  }
  for (const issue of topLevel) walk(issue, 0);
  return rows;
}

function isDescendantOf(candidateId: string, ancestorId: string, issues: Issue[]): boolean {
  const byId = new Map(issues.map((i) => [i.id, i]));
  let current = byId.get(candidateId);
  const seen = new Set<string>();
  while (current?.parent_id) {
    if (seen.has(current.id)) return false;
    seen.add(current.id);
    if (current.parent_id === ancestorId) return true;
    current = byId.get(current.parent_id);
  }
  return false;
}

export function IssueTable({
  issues,
  emptyMessage = "No issues here.",
}: {
  issues: Issue[];
  emptyMessage?: string;
}) {
  const updateIssue = useIssuesStore((s) => s.updateIssue);
  const archiveIssue = useIssuesStore((s) => s.archiveIssue);
  const deleteIssue = useIssuesStore((s) => s.deleteIssue);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [extraColumns, setExtraColumns] = useState<string[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (saved) {
        // One-time sync from a browser-only store into React state.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setExtraColumns(JSON.parse(saved));
      }
    } catch {
      // localStorage unavailable - just use the default (no extra columns).
    }
  }, []);

  function toggleColumn(key: string) {
    setExtraColumns((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      try {
        localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore - column visibility just won't persist across reloads
      }
      return next;
    });
  }

  async function handleStatusChange(issue: Issue, next: IssueStatus) {
    if (next === issue.status) return;
    const patch: Partial<Issue> = { status: next };
    if (next === "Fixed" && !issue.fixed_date) {
      patch.fixed_date = new Date().toISOString().slice(0, 10);
    }
    const { error } = await updateIssue(issue.id, patch, describeStatusChange(issue.status, next));
    if (error) toast.error(error);
  }

  async function handlePriorityChange(issue: Issue, next: IssuePriority) {
    if (next === issue.priority) return;
    const { error } = await updateIssue(
      issue.id,
      { priority: next },
      describePriorityChange(issue.priority, next)
    );
    if (error) toast.error(error);
  }

  async function handleArchiveToggle(issue: Issue) {
    const { error } = await archiveIssue(issue.id, !issue.archived);
    if (error) toast.error(error);
  }

  async function handleDelete(issue: Issue) {
    if (!confirm(`Delete "${issue.title}"? This cannot be undone.`)) return;
    const { error } = await deleteIssue(issue.id);
    if (error) toast.error(error);
    else toast.success("Issue deleted.");
  }

  async function handleUnnest(issue: Issue) {
    const { error } = await updateIssue(issue.id, { parent_id: null }, describeParentChange(null));
    if (error) toast.error(error);
  }

  function handleDrop(target: Issue) {
    const sourceId = draggedId;
    setDraggedId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === target.id) return;
    if (isDescendantOf(target.id, sourceId, issues)) {
      toast.error("Can't nest an issue under its own subtask.");
      return;
    }
    const source = issues.find((i) => i.id === sourceId);
    if (!source || source.parent_id === target.id) return;
    updateIssue(sourceId, { parent_id: target.id }, describeParentChange(target.title)).then(
      ({ error }) => {
        if (error) toast.error(error);
      }
    );
  }

  const columnsToggle = (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Columns3 />
            Columns
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Show extra columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {INTAKE_KEYS.map((key) => (
            <DropdownMenuCheckboxItem
              key={key}
              checked={extraColumns.includes(key)}
              onSelect={(e) => e.preventDefault()}
              onCheckedChange={() => toggleColumn(key)}
            >
              {INTAKE_FIELD_LABELS[key]}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (issues.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {columnsToggle}
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16 text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      </div>
    );
  }

  const rows = buildDisplayOrder(issues);

  return (
    <>
      <div className="flex flex-col gap-2">
        {columnsToggle}
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-48">Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>Deadline</TableHead>
                {extraColumns.map((key) => (
                  <TableHead key={key}>
                    {INTAKE_FIELD_LABELS[key as keyof typeof INTAKE_FIELD_LABELS]}
                  </TableHead>
                ))}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ issue, depth }) => (
                <TableRow
                  key={issue.id}
                  draggable
                  onDragStart={() => setDraggedId(issue.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (draggedId && draggedId !== issue.id) setDragOverId(issue.id);
                  }}
                  onDragLeave={() =>
                    setDragOverId((current) => (current === issue.id ? null : current))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(issue);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  className={cn(
                    "cursor-grab active:cursor-grabbing",
                    draggedId === issue.id && "opacity-50",
                    dragOverId === issue.id && "bg-primary/10 outline-2 -outline-offset-2 outline-primary"
                  )}
                >
                  <TableCell className="max-w-80 whitespace-normal">
                    <div className="flex items-start gap-1.5" style={{ paddingLeft: depth * 20 }}>
                      <GripVertical className="mt-1 size-3.5 shrink-0 text-muted-foreground/50" />
                      {depth > 0 && (
                        <CornerDownRight className="mt-1 size-3.5 shrink-0 text-muted-foreground/50" />
                      )}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setEditingIssue(issue)}
                          className="text-left font-medium transition-colors hover:text-[#9dc209] hover:underline"
                        >
                          {issue.title}
                        </button>
                        {isOverdue(issue) && (
                          <Badge variant="destructive" className="ml-2 align-middle">
                            Overdue
                          </Badge>
                        )}
                        {issue.remarks && (
                          <p className="mt-0.5 text-xs font-normal text-muted-foreground line-clamp-1">
                            {issue.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{issue.category ?? "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={issue.status}
                      onValueChange={(v) => handleStatusChange(issue, v as IssueStatus)}
                    >
                      <SelectTrigger size="sm" className="h-8 w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={issue.priority}
                      onValueChange={(v) => handlePriorityChange(issue, v as IssuePriority)}
                    >
                      <SelectTrigger size="sm" className="h-8 w-28">
                        <SelectValue>
                          <PriorityBadge priority={issue.priority} />
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <AssigneeCell issue={issue} />
                  </TableCell>
                  <TableCell>
                    <DeadlineCell issue={issue} />
                  </TableCell>
                  {extraColumns.map((key) => (
                    <TableCell key={key} className="max-w-56 whitespace-normal text-muted-foreground">
                      {(issue[key as keyof Issue] as string | null) ?? "—"}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditingIssue(issue)}>
                          <Pencil />
                          Edit details
                        </DropdownMenuItem>
                        {issue.parent_id && (
                          <DropdownMenuItem onSelect={() => handleUnnest(issue)}>
                            <Undo2 />
                            Remove from parent
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onSelect={() => handleArchiveToggle(issue)}>
                          {issue.archived ? <ArchiveRestore /> : <Archive />}
                          {issue.archived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onSelect={() => handleDelete(issue)}>
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingIssue && (
        <EditIssueDialog
          issue={editingIssue}
          open={!!editingIssue}
          onOpenChange={(open) => !open && setEditingIssue(null)}
        />
      )}
    </>
  );
}
