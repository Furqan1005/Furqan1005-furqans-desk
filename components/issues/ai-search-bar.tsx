"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { IssueFilterState } from "./issue-filters";
import { EMPTY_FILTERS } from "./issue-filters";

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

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, categories, assignees }),
      });
      if (!res.ok) throw new Error("parse-failed");
      const data = await res.json();
      onParsed({
        ...EMPTY_FILTERS,
        search: data.search ?? "",
        status: data.status ?? "all",
        priority: data.priority ?? "all",
        category: data.category ?? "all",
        assignee: data.assignee ?? "all",
      });
    } catch {
      // Fall back to a plain substring search over the typed query.
      onParsed({ ...EMPTY_FILTERS, search: query });
      toast.message("Couldn't parse that as filters — searching as plain text instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleAsk} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Sparkles className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-primary" />
        <Input
          className="pl-8"
          placeholder='Try "open P1s assigned to Kaushal"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button type="submit" variant="secondary" size="sm" disabled={loading}>
        {loading ? "Thinking..." : "Ask"}
      </Button>
    </form>
  );
}
