"use client";

import { useState } from "react";
import { Download, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIssuesStore } from "@/lib/store/issues-store";
import { PRIORITY_OPTIONS, STATUS_OPTIONS, type IssuePriority, type IssueStatus } from "@/lib/types";
import { downloadCsv, issuesToCsv } from "@/lib/csv";

export default function SettingsPage() {
  const settings = useIssuesStore((s) => s.settings);
  const issues = useIssuesStore((s) => s.issues);
  const activityLog = useIssuesStore((s) => s.activityLog);
  const updateSettings = useIssuesStore((s) => s.updateSettings);
  const [newCategory, setNewCategory] = useState("");

  const categories = settings?.categories ?? [];

  async function addCategory() {
    const value = newCategory.trim();
    if (!value) return;
    if (categories.includes(value)) {
      toast.error("That category already exists.");
      return;
    }
    const { error } = await updateSettings({ categories: [...categories, value] });
    if (error) toast.error(error);
    else setNewCategory("");
  }

  async function removeCategory(category: string) {
    const { error } = await updateSettings({
      categories: categories.filter((c) => c !== category),
    });
    if (error) toast.error(error);
  }

  async function setDefaultStatus(value: IssueStatus) {
    const { error } = await updateSettings({ default_status: value });
    if (error) toast.error(error);
  }

  async function setDefaultPriority(value: IssuePriority) {
    const { error } = await updateSettings({ default_priority: value });
    if (error) toast.error(error);
  }

  function exportJson() {
    const payload = { issues, activityLog, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `furqans-desk-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    downloadCsv(
      `furqans-desk-all-issues-${new Date().toISOString().slice(0, 10)}.csv`,
      issuesToCsv(issues)
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage categories, defaults, and export your data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Used when creating and filtering issues.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c} variant="secondary" className="gap-1 py-1 pr-1">
                {c}
                <button
                  onClick={() => removeCategory(c)}
                  aria-label={`Remove ${c}`}
                  className="rounded-full p-0.5 hover:bg-black/10"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              placeholder="New category name"
            />
            <Button onClick={addCategory} size="sm">
              <Plus />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Defaults for new issues</CardTitle>
          <CardDescription>Applied when opening the New Issue form.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Default status</span>
            <Select
              value={settings?.default_status ?? "Open"}
              onValueChange={(v) => setDefaultStatus(v as IssueStatus)}
            >
              <SelectTrigger className="w-full">
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
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Default priority</span>
            <Select
              value={settings?.default_priority ?? "Medium"}
              onValueChange={(v) => setDefaultPriority(v as IssuePriority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export data</CardTitle>
          <CardDescription>Download everything stored in your desk.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download />
            All issues (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <Download />
            Full export (JSON)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
