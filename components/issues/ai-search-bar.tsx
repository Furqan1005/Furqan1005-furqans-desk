"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IssueFilterState } from "./issue-filters";
import { EMPTY_FILTERS } from "./issue-filters";
import { parseSearchQueryLocally } from "@/lib/nl-search";

export function AiSearchBar({
  categories,
  assignees,
  onParsed,
}: {
  categories: string[];
  assignees: string[];
  onParsed: (filters: IssueFilterState) => void;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      // Clearing the box should immediately show every issue again,
      // not leave a stale filter applied from the last search.
      onParsed(EMPTY_FILTERS);
    }
  }

  function clear() {
    setQuery("");
    onParsed(EMPTY_FILTERS);
  }

  function applyLocalParse() {
    const parsed = parseSearchQueryLocally(query, { categories, assignees });
    onParsed({
      ...EMPTY_FILTERS,
      search: parsed.search ?? "",
      status: parsed.status ?? "all",
      priority: parsed.priority ?? "all",
      category: parsed.category ?? "all",
      assignee: parsed.assignee ?? "all",
    });
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    // Always resolve locally first - understands this team's own shorthand
    // (P1-P4, "assigned to X") instantly and at zero cost.
    const local = parseSearchQueryLocally(query, { categories, assignees });

    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, categories, assignees }),
      });
      if (!res.ok) throw new Error("ai-unavailable");
      const data = await res.json();
      onParsed({
        ...EMPTY_FILTERS,
        search: data.search ?? local.search ?? "",
        status: data.status ?? local.status ?? "all",
        priority: data.priority ?? local.priority ?? "all",
        category: data.category ?? local.category ?? "all",
        assignee: data.assignee ?? local.assignee ?? "all",
      });
    } catch {
      applyLocalParse();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAsk} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Sparkles className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-primary" />
        <Input
          className="pl-8 pr-8"
          placeholder='e.g. open P1s assigned to Kaushal'
          value={query}
          onChange={(e) => handleChange(e.target.value)}
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <Button type="submit" variant="secondary" size="sm" disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </Button>
    </form>
  );
}
