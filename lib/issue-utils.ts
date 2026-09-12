import type { Issue } from "@/lib/types";

const OPEN_STATUSES = new Set(["Open", "In Progress", "Blocked"]);

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseDate(value: string | null) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isOverdue(issue: Issue) {
  if (issue.archived) return false;
  if (!OPEN_STATUSES.has(issue.status)) return false;
  const deadline = parseDate(issue.deadline);
  if (!deadline) return false;
  return deadline.getTime() < startOfToday().getTime();
}

export function isDueThisWeek(issue: Issue) {
  if (issue.archived) return false;
  if (!OPEN_STATUSES.has(issue.status)) return false;
  const deadline = parseDate(issue.deadline);
  if (!deadline) return false;
  const today = startOfToday();
  const sevenDaysOut = new Date(today);
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7);
  return deadline.getTime() >= today.getTime() && deadline.getTime() <= sevenDaysOut.getTime();
}

export function isFixedThisWeek(issue: Issue) {
  const fixedDate = parseDate(issue.fixed_date);
  if (!fixedDate) return false;
  const today = startOfToday();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return fixedDate.getTime() >= sevenDaysAgo.getTime() && fixedDate.getTime() <= today.getTime();
}

export function matchesAssignee(issue: Issue, name: string) {
  if (!issue.assigned_to) return false;
  return issue.assigned_to.trim().toLowerCase() === name.trim().toLowerCase();
}

const PRIORITY_RANK: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function sortByPriorityThenDeadline(a: Issue, b: Issue) {
  const pr = (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
  if (pr !== 0) return pr;
  const da = parseDate(a.deadline)?.getTime() ?? Infinity;
  const db = parseDate(b.deadline)?.getTime() ?? Infinity;
  return da - db;
}

export function computeOverviewCounts(issues: Issue[]) {
  const active = issues.filter((i) => !i.archived);
  return {
    open: active.filter((i) => i.status === "Open").length,
    inProgress: active.filter((i) => i.status === "In Progress").length,
    fixedThisWeek: active.filter((i) => i.status === "Fixed" && isFixedThisWeek(i)).length,
    overdue: active.filter(isOverdue).length,
  };
}

export function formatDate(value: string | null) {
  const d = parseDate(value);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
