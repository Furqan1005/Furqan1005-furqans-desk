"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/lib/types";

export interface IssueFilterState {
  search: string;
  status: string;
  priority: string;
  category: string;
  assignee: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: IssueFilterState = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  assignee: "all",
  from: "",
  to: "",
};

export function IssueFilters({
  value,
  onChange,
  categories,
  assignees,
}: {
  value: IssueFilterState;
  onChange: (next: IssueFilterState) => void;
  categories: string[];
  assignees: string[];
}) {
  function set<K extends keyof IssueFilterState>(key: K, v: IssueFilterState[K]) {
    onChange({ ...value, [key]: v });
  }

  const hasActiveFilters =
    value.search ||
    value.status !== "all" ||
    value.priority !== "all" ||
    value.category !== "all" ||
    value.assignee !== "all" ||
    value.from ||
    value.to;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search issues…"
          value={value.search}
          onChange={(e) => set("search", e.target.value)}
        />
      </div>

      <Select value={value.status} onValueChange={(v) => set("status", v)}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Status" />
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

      <Select value={value.priority} onValueChange={(v) => set("priority", v)}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue className="whitespace-nowrap" placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          {PRIORITY_OPTIONS.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.category} onValueChange={(v) => set("category", v)}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={value.assignee} onValueChange={(v) => set("assignee", v)}>
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Everyone</SelectItem>
          {assignees.map((a) => (
            <SelectItem key={a} value={a}>
              {a}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1">
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={value.from}
          onChange={(e) => set("from", e.target.value)}
          aria-label="Deadline from"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          className="h-8 w-36 text-xs"
          value={value.to}
          onChange={(e) => set("to", e.target.value)}
          aria-label="Deadline to"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}
