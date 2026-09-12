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
    >
  >;
