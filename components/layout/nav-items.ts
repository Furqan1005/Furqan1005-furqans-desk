import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ListChecks,
  User,
  CalendarDays,
  Loader,
  CalendarClock,
  Archive,
  Sparkles,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/issues", label: "All Issues", icon: ListChecks },
  { href: "/my-work", label: "My Work", icon: User },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/in-progress", label: "In Progress", icon: Loader },
  { href: "/due-this-week", label: "Due This Week", icon: CalendarClock },
  { href: "/archived", label: "Archived", icon: Archive },
  { href: "/desk-ai", label: "Desk AI", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];
