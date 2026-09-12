import { Badge } from "@/components/ui/badge";
import type { IssuePriority } from "@/lib/types";

const VARIANT: Record<IssuePriority, "destructive" | "warning" | "secondary" | "outline"> = {
  Critical: "destructive",
  High: "warning",
  Medium: "secondary",
  Low: "outline",
};

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return <Badge variant={VARIANT[priority]}>{priority}</Badge>;
}
