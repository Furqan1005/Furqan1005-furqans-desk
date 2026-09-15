import type { ReactNode } from "react";

import { CurrentUserProvider, type CurrentUser } from "@/lib/auth/user-context";
import { StoreInit } from "./store-init";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";

export function AppShell({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  return (
    <CurrentUserProvider user={user}>
      <StoreInit />
      <div className="flex min-h-svh w-full">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar py-6 md:flex">
          <div className="mb-6 flex items-center gap-2 px-5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold text-white">
              FA
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">Furqan&apos;s Desk</span>
              <span className="text-[11px] text-sidebar-foreground/70">
                Nothing falls through
              </span>
            </div>
          </div>
          <SidebarNav />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-x-hidden bg-background px-4 py-5 md:px-8 md:py-6">
            {children}
          </main>
        </div>
      </div>
    </CurrentUserProvider>
  );
}
