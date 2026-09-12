import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/lib/types";

const VARIANT: Record<IssueStatus, "default" | "secondary" | "success" | "destructive" | "outline"> = {
  Open: "secondary",
  "In Progress": "default",
  Fixed: "success",
  Blocked: "destructive",
  "Won't Fix": "outline",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return <Badge variant={VARIANT[status]}>{status}</Badge>;
}
