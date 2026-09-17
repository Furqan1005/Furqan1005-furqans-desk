export const STATUS_OPTIONS = [
  "Open",
  "In Progress",
  "Fixed",
  "Blocked",
  "Won't Fix",
] as const;

export const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"] as const;

export type IssueStatus = (typeof STATUS_OPTIONS)[number];
export type IssuePriority = (typeof PRIORITY_OPTIONS)[number];

export interface Issue {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assigned_to: string | null;
  start_date: string | null;
  deadline: string | null;
  fixed_date: string | null;
  remarks: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
  requested_by: string | null;
  useful_for_team: string | null;
  reason_pain_point: string | null;
  currently_software: string | null;
  source_software: string | null;
  request_type: string | null;
  duplicate: string | null;
  auto_schedule: string | null;
  parent_id: string | null;
}

export interface ActivityLogEntry {
  id: string;
  issue_id: string;
  change_summary: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  categories: string[];
  default_status: IssueStatus;
  default_priority: IssuePriority;
  updated_at: string;
}

export interface KnowledgeSection {
  id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export const NOTE_COLORS = ["yellow", "pink", "blue", "green", "purple"] as const;
export type NoteColor = (typeof NOTE_COLORS)[number];

export interface StickyNote {
  id: string;
  content: string;
  color: NoteColor;
  created_at: string;
  updated_at: string;
}

export interface FixBankEntry {
  id: string;
  issue_id: string | null;
  title: string;
  category: string | null;
  root_cause: string | null;
  troubleshooting_steps: string | null;
  fix: string;
  created_at: string;
  updated_at: string;
}

export type NewFixBankEntryInput = Pick<FixBankEntry, "title" | "fix"> &
  Partial<Pick<FixBankEntry, "issue_id" | "category" | "root_cause" | "troubleshooting_steps">>;

export type NewIssueInput = Pick<Issue, "title"> &
  Partial<
    Pick<
      Issue,
      | "description"
      | "category"
      | "status"
      | "priority"
      | "assigned_to"
      | "start_date"
      | "deadline"
      | "remarks"
      | "requested_by"
      | "useful_for_team"
      | "reason_pain_point"
      | "currently_software"
      | "source_software"
      | "request_type"
      | "duplicate"
      | "auto_schedule"
    >
  >;

export const INTAKE_FIELD_LABELS: Record<
  | "requested_by"
  | "useful_for_team"
  | "reason_pain_point"
  | "currently_software"
  | "source_software"
  | "request_type"
  | "duplicate"
  | "auto_schedule",
  string
> = {
  requested_by: "Requested by",
  useful_for_team: "Useful for team",
  reason_pain_point: "Reason / Pain point",
  currently_software: "Currently software",
  source_software: "Source software",
  request_type: "Request type",
  duplicate: "Duplicate",
  auto_schedule: "Auto schedule",
};
