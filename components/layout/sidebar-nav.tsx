"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 px-5">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3.5 py-3 text-sm font-medium transition-colors",
              active
                ? "bg-white/5 text-sidebar-active before:absolute before:top-[18%] before:-left-5 before:h-[64%] before:w-1 before:rounded-r-full before:bg-sidebar-active"
                : "text-sidebar-foreground hover:bg-white/[0.03] hover:text-[#9dc209]"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
