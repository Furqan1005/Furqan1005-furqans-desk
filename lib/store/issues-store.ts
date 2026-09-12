"use client";

import { create } from "zustand";

import { createClient } from "@/lib/supabase/client";
import type {
  ActivityLogEntry,
  AppSettings,
  Issue,
  IssuePriority,
  IssueStatus,
  NewIssueInput,
} from "@/lib/types";

interface IssuesState {
  issues: Issue[];
  activityLog: ActivityLogEntry[];
  settings: AppSettings | null;
  loading: boolean;
  initialized: boolean;
  init: () => Promise<void>;
  addIssue: (input: NewIssueInput) => Promise<{ error?: string }>;
  updateIssue: (
    id: string,
    patch: Partial<Issue>,
    summary?: string
  ) => Promise<{ error?: string }>;
  archiveIssue: (id: string, archived: boolean) => Promise<{ error?: string }>;
  deleteIssue: (id: string) => Promise<{ error?: string }>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<{ error?: string }>;
}

const supabase = createClient();
let channelsSubscribed = false;

export const useIssuesStore = create<IssuesState>((set, get) => ({
  issues: [],
  activityLog: [],
  settings: null,
  loading: true,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true, loading: true });

    const [issuesRes, activityRes, settingsRes] = await Promise.all([
      supabase.from("issues").select("*").order("created_at", { ascending: false }),
      supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("app_settings").select("*").eq("id", "default").maybeSingle(),
    ]);

    set({
      issues: (issuesRes.data as Issue[]) ?? [],
      activityLog: (activityRes.data as ActivityLogEntry[]) ?? [],
      settings: (settingsRes.data as AppSettings | null) ?? null,
      loading: false,
    });

    if (channelsSubscribed) return;
    channelsSubscribed = true;

    supabase
      .channel("issues-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues" },
        (payload) => {
          set((state) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Issue;
              if (state.issues.some((i) => i.id === row.id)) return state;
              return { issues: [row, ...state.issues] };
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Issue;
              return {
                issues: state.issues.map((i) => (i.id === row.id ? row : i)),
              };
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as Partial<Issue>;
              return {
                issues: state.issues.filter((i) => i.id !== oldRow.id),
              };
            }
            return state;
          });
        }
      )
      .subscribe();

    supabase
      .channel("activity-log-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_log" },
        (payload) => {
          const row = payload.new as ActivityLogEntry;
          set((state) => {
            if (state.activityLog.some((a) => a.id === row.id)) return state;
            return { activityLog: [row, ...state.activityLog].slice(0, 200) };
          });
        }
      )
      .subscribe();

    supabase
      .channel("app-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        (payload) => {
          const row = payload.new as AppSettings;
          set({ settings: row });
        }
      )
      .subscribe();
  },

  addIssue: async (input) => {
    const { data, error } = await supabase
      .from("issues")
      .insert({
        title: input.title,
        description: input.description ?? null,
        category: input.category ?? null,
        status: input.status ?? "Open",
        priority: input.priority ?? "Medium",
        assigned_to: input.assigned_to ?? null,
        start_date: input.start_date ?? null,
        deadline: input.deadline ?? null,
        remarks: input.remarks ?? null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    await supabase.from("activity_log").insert({
      issue_id: data.id,
      change_summary: `Issue created: "${data.title}"`,
    });

    return {};
  },

  updateIssue: async (id, patch, summary) => {
    const { error } = await supabase.from("issues").update(patch).eq("id", id);
    if (error) return { error: error.message };

    if (summary) {
      await supabase.from("activity_log").insert({
        issue_id: id,
        change_summary: summary,
      });
    }

    return {};
  },

  archiveIssue: async (id, archived) => {
    const issue = get().issues.find((i) => i.id === id);
    return get().updateIssue(
      id,
      { archived },
      `${archived ? "Archived" : "Unarchived"} issue${issue ? `: "${issue.title}"` : ""}`
    );
  },

  deleteIssue: async (id) => {
    const { error } = await supabase.from("issues").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  },

  updateSettings: async (patch) => {
    const { error } = await supabase
      .from("app_settings")
      .update(patch)
      .eq("id", "default");
    if (error) return { error: error.message };
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...patch } : state.settings,
    }));
    return {};
  },
}));

export function describeStatusChange(from: IssueStatus, to: IssueStatus) {
  return `Status changed: ${from} -> ${to}`;
}

export function describePriorityChange(from: IssuePriority, to: IssuePriority) {
  return `Priority changed: ${from} -> ${to}`;
}
