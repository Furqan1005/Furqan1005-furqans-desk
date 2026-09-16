import type { Issue } from "@/lib/types";

interface ColumnDef {
  key: keyof Issue;
  header: string;
}

// Ordered to mirror the team's own Daily Task Tracker spreadsheet, with the
// fields that tracker doesn't have (category, dates, etc.) appended after.
const COLUMNS: ColumnDef[] = [
  { key: "created_at", header: "Date Received" },
  { key: "duplicate", header: "Duplicate" },
  { key: "title", header: "Request/Task Name" },
  { key: "requested_by", header: "Requested By" },
  { key: "useful_for_team", header: "Useful for Entire Team" },
  { key: "reason_pain_point", header: "Reason/Pain Point" },
  { key: "remarks", header: "Remarks" },
  { key: "status", header: "Status" },
  { key: "priority", header: "Priority" },
  { key: "auto_schedule", header: "Auto schedule" },
  { key: "currently_software", header: "Currently Software" },
  { key: "source_software", header: "Source Software" },
  { key: "request_type", header: "Request Type" },
  { key: "assigned_to", header: "EDP Team" },
  { key: "category", header: "Category" },
  { key: "description", header: "Description" },
  { key: "start_date", header: "Start Date" },
  { key: "deadline", header: "Deadline" },
  { key: "fixed_date", header: "Fixed Date" },
  { key: "archived", header: "Archived" },
  { key: "updated_at", header: "Updated At" },
];

function formatCsvCell(key: keyof Issue, value: unknown) {
  if (value === null || value === undefined) return "";
  if (key === "created_at" || key === "updated_at") {
    return String(value).slice(0, 10);
  }
  return String(value);
}

function escapeCsvValue(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function issuesToCsv(issues: Issue[]) {
  const header = COLUMNS.map((c) => escapeCsvValue(c.header)).join(",");
  const rows = issues.map((issue) =>
    COLUMNS.map((c) => escapeCsvValue(formatCsvCell(c.key, issue[c.key]))).join(",")
  );
  return [header, ...rows].join("\n");
}

// A short, plain-English export for sharing a quick status update (e.g. with
// a manager) rather than the full tracker-matching column set above.
const SIMPLE_COLUMNS: ColumnDef[] = [
  { key: "title", header: "Issue" },
  { key: "status", header: "Fixed" },
  { key: "remarks", header: "Why it's fixed" },
];

export function issuesToSimpleCsv(issues: Issue[]) {
  const header = SIMPLE_COLUMNS.map((c) => escapeCsvValue(c.header)).join(",");
  const rows = issues.map((issue) =>
    SIMPLE_COLUMNS.map((c) => escapeCsvValue(formatCsvCell(c.key, issue[c.key]))).join(",")
  );
  return [header, ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
