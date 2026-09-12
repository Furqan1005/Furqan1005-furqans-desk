import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SummaryCards({
  open,
  inProgress,
  fixedThisWeek,
  overdue,
}: {
  open: number;
  inProgress: number;
  fixedThisWeek: number;
  overdue: number;
}) {
  const items = [
    { label: "Open", value: open },
    { label: "In Progress", value: inProgress },
    { label: "Fixed This Week", value: fixedThisWeek },
    { label: "Overdue", value: overdue, alert: overdue > 0 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="pb-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span
              className={cn(
                "text-3xl font-semibold tabular-nums",
                item.alert && "text-destructive"
              )}
            >
              {item.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
