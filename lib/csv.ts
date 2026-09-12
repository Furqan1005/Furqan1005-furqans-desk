import type { Issue } from "@/lib/types";

const COLUMNS: (keyof Issue)[] = [
  "title",
  "description",
  "category",
  "status",
  "priority",
  "assigned_to",
  "start_date",
  "deadline",
  "fixed_date",
  "remarks",
  "archived",
  "created_at",
  "updated_at",
];

function escapeCsvValue(value: unknown) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function issuesToCsv(issues: Issue[]) {
  const header = COLUMNS.join(",");
  const rows = issues.map((issue) =>
    COLUMNS.map((col) => escapeCsvValue(issue[col])).join(",")
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
