"use client";

import { create } from "zustand";

import { createClient } from "@/lib/supabase/client";
import type {
  ActivityLogEntry,
  AppSettings,
  Issue,
  IssuePriority,
  IssueStatus,
  KnowledgeSection,
  NewIssueInput,
  NoteColor,
  StickyNote,
} from "@/lib/types";

interface IssuesState {
  issues: Issue[];
  activityLog: ActivityLogEntry[];
  settings: AppSettings | null;
  knowledgeSections: KnowledgeSection[];
  stickyNotes: StickyNote[];
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
  addKnowledgeSection: (title: string, content: string) => Promise<{ error?: string }>;
  updateKnowledgeSection: (
    id: string,
    patch: Partial<Pick<KnowledgeSection, "title" | "content" | "sort_order">>
  ) => Promise<{ error?: string }>;
  deleteKnowledgeSection: (id: string) => Promise<{ error?: string }>;
  addStickyNote: (color: NoteColor) => Promise<{ error?: string; id?: string }>;
  updateStickyNote: (id: string, patch: Partial<Pick<StickyNote, "content" | "color">>) => Promise<{ error?: string }>;
  deleteStickyNote: (id: string) => Promise<{ error?: string }>;
}

const supabase = createClient();
let channelsSubscribed = false;

export const useIssuesStore = create<IssuesState>((set, get) => ({
  issues: [],
  activityLog: [],
  settings: null,
  knowledgeSections: [],
  stickyNotes: [],
  loading: true,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    set({ initialized: true, loading: true });

    const [issuesRes, activityRes, settingsRes, knowledgeRes, notesRes] = await Promise.all([
      supabase.from("issues").select("*").order("created_at", { ascending: false }),
      supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("app_settings").select("*").eq("id", "default").maybeSingle(),
      supabase.from("knowledge_sections").select("*").order("sort_order", { ascending: true }),
      supabase.from("sticky_notes").select("*").order("created_at", { ascending: false }),
    ]);

    set({
      issues: (issuesRes.data as Issue[]) ?? [],
      activityLog: (activityRes.data as ActivityLogEntry[]) ?? [],
      settings: (settingsRes.data as AppSettings | null) ?? null,
      knowledgeSections: (knowledgeRes.data as KnowledgeSection[]) ?? [],
      stickyNotes: (notesRes.data as StickyNote[]) ?? [],
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

    supabase
      .channel("knowledge-sections-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "knowledge_sections" },
        (payload) => {
          set((state) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as KnowledgeSection;
              if (state.knowledgeSections.some((s) => s.id === row.id)) return state;
              return {
                knowledgeSections: [...state.knowledgeSections, row].sort(
                  (a, b) => a.sort_order - b.sort_order
                ),
              };
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as KnowledgeSection;
              return {
                knowledgeSections: state.knowledgeSections
                  .map((s) => (s.id === row.id ? row : s))
                  .sort((a, b) => a.sort_order - b.sort_order),
              };
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as Partial<KnowledgeSection>;
              return {
                knowledgeSections: state.knowledgeSections.filter((s) => s.id !== oldRow.id),
              };
            }
            return state;
          });
        }
      )
      .subscribe();

    supabase
      .channel("sticky-notes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sticky_notes" },
        (payload) => {
          set((state) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as StickyNote;
              if (state.stickyNotes.some((n) => n.id === row.id)) return state;
              return { stickyNotes: [row, ...state.stickyNotes] };
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as StickyNote;
              return {
                stickyNotes: state.stickyNotes.map((n) => (n.id === row.id ? row : n)),
              };
            }
            if (payload.eventType === "DELETE") {
              const oldRow = payload.old as Partial<StickyNote>;
              return {
                stickyNotes: state.stickyNotes.filter((n) => n.id !== oldRow.id),
              };
            }
            return state;
          });
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
        requested_by: input.requested_by ?? null,
        useful_for_team: input.useful_for_team ?? null,
        reason_pain_point: input.reason_pain_point ?? null,
        currently_software: input.currently_software ?? null,
        source_software: input.source_software ?? null,
        request_type: input.request_type ?? null,
        duplicate: input.duplicate ?? null,
        auto_schedule: input.auto_schedule ?? null,
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

  addKnowledgeSection: async (title, content) => {
    const nextOrder = get().knowledgeSections.length
      ? Math.max(...get().knowledgeSections.map((s) => s.sort_order)) + 1
      : 0;
    const { error } = await supabase
      .from("knowledge_sections")
      .insert({ title, content, sort_order: nextOrder });
    if (error) return { error: error.message };
    return {};
  },

  updateKnowledgeSection: async (id, patch) => {
    const { error } = await supabase.from("knowledge_sections").update(patch).eq("id", id);
    if (error) return { error: error.message };
    set((state) => ({
      knowledgeSections: state.knowledgeSections.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    }));
    return {};
  },

  deleteKnowledgeSection: async (id) => {
    const { error } = await supabase.from("knowledge_sections").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  },

  addStickyNote: async (color) => {
    const { data, error } = await supabase
      .from("sticky_notes")
      .insert({ content: "", color })
      .select()
      .single();
    if (error) return { error: error.message };
    return { id: data.id };
  },

  updateStickyNote: async (id, patch) => {
    const { error } = await supabase.from("sticky_notes").update(patch).eq("id", id);
    if (error) return { error: error.message };
    set((state) => ({
      stickyNotes: state.stickyNotes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));
    return {};
  },

  deleteStickyNote: async (id) => {
    const { error } = await supabase.from("sticky_notes").delete().eq("id", id);
    if (error) return { error: error.message };
    return {};
  },
}));

export function describeStatusChange(from: IssueStatus, to: IssueStatus) {
  return `Status changed: ${from} -> ${to}`;
}

export function describePriorityChange(from: IssuePriority, to: IssuePriority) {
  return `Priority changed: ${from} -> ${to}`;
}

export function describeAssigneeChange(from: string | null, to: string | null) {
  return `Reassigned: ${from || "Unassigned"} -> ${to || "Unassigned"}`;
}

export function describeDeadlineChange(from: string | null, to: string | null) {
  return `Deadline changed: ${from || "none"} -> ${to || "none"}`;
}

export function describeParentChange(toParentTitle: string | null) {
  return toParentTitle ? `Nested under: "${toParentTitle}"` : "Removed from parent issue";
}
