import { PRIORITY_OPTIONS, type IssuePriority, type IssueStatus } from "@/lib/types";

export interface ParsedSearch {
  status?: IssueStatus;
  priority?: IssuePriority;
  category?: string;
  assignee?: string;
  search?: string;
}

const PRIORITY_CODE_MAP: Record<string, IssuePriority> = {
  p1: "Critical",
  p2: "High",
  p3: "Medium",
  p4: "Low",
};

const STATUS_PHRASES: [RegExp, IssueStatus][] = [
  [/\bwon'?t\s*fix\b/i, "Won't Fix"],
  [/\bin[\s-]?progress\b/i, "In Progress"],
  [/\bblocked\b/i, "Blocked"],
  [/\bfixed\b/i, "Fixed"],
  [/\bopen\b/i, "Open"],
];

/**
 * Rule-based parser for the "AI search" bar so it keeps working with zero
 * API cost, and as a fallback when the real AI route is unavailable/unfunded.
 * Understands the team's own shorthand (P1-P4 priority codes, "assigned to X").
 */
export function parseSearchQueryLocally(
  query: string,
  { categories, assignees }: { categories: string[]; assignees: string[] }
): ParsedSearch {
  let remaining = query;
  const result: ParsedSearch = {};

  for (const [pattern, status] of STATUS_PHRASES) {
    if (pattern.test(remaining)) {
      result.status = status;
      remaining = remaining.replace(pattern, " ");
      break;
    }
  }

  const codeMatch = remaining.match(/\bp([1-4])s?\b/i);
  if (codeMatch) {
    result.priority = PRIORITY_CODE_MAP[`p${codeMatch[1]}`];
    remaining = remaining.replace(codeMatch[0], " ");
  } else {
    for (const priority of PRIORITY_OPTIONS) {
      const pattern = new RegExp(`\\b${priority}\\b`, "i");
      if (pattern.test(remaining)) {
        result.priority = priority;
        remaining = remaining.replace(pattern, " ");
        break;
      }
    }
  }

  const assignedMatch = remaining.match(/\bassigned(?:\s+to)?\s+([a-z][\w'-]*)/i);
  if (assignedMatch) {
    const name = assignedMatch[1];
    const known = assignees.find((a) => a.toLowerCase() === name.toLowerCase());
    result.assignee = known ?? name;
    remaining = remaining.replace(assignedMatch[0], " ");
  } else {
    const foundAssignee = assignees.find((a) =>
      new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(remaining)
    );
    if (foundAssignee) {
      result.assignee = foundAssignee;
      remaining = remaining.replace(new RegExp(`\\b${foundAssignee}\\b`, "i"), " ");
    }
  }

  const foundCategory = categories.find((c) =>
    new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(remaining)
  );
  if (foundCategory) {
    result.category = foundCategory;
    remaining = remaining.replace(new RegExp(`\\b${foundCategory}\\b`, "i"), " ");
  }

  const leftover = remaining
    .replace(/\b(all|issues?|please|show|find|me|the|for)\b/gi, " ")
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (leftover) result.search = leftover;

  return result;
}

export function hasAnyMatch(parsed: ParsedSearch) {
  return Boolean(parsed.status || parsed.priority || parsed.category || parsed.assignee || parsed.search);
}
