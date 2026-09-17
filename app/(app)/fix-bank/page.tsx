"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FixBankEntryDialog } from "@/components/fixbank/fix-bank-entry-dialog";
import { FixBankEntryCard } from "@/components/fixbank/fix-bank-entry-card";
import { useIssuesStore } from "@/lib/store/issues-store";

export default function FixBankPage() {
  const entries = useIssuesStore((s) => s.fixBankEntries);
  const loading = useIssuesStore((s) => s.loading);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) =>
      [e.title, e.category, e.root_cause, e.troubleshooting_steps, e.fix]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [entries, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Fix Bank</h1>
          <p className="text-sm text-muted-foreground">
            Root cause, troubleshooting steps, and the exact fix for issues you&apos;ve resolved —
            so the same problem gets solved faster next time.
          </p>
        </div>
        <FixBankEntryDialog
          trigger={
            <Button size="sm">
              <Plus />
              New Entry
            </Button>
          }
        />
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-8"
          placeholder="Search the Fix Bank…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-16 text-sm text-muted-foreground">
          {entries.length === 0
            ? 'No entries yet — resolve an issue, then use "Add to Fix Bank" from its menu.'
            : "No entries match your search."}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <FixBankEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
