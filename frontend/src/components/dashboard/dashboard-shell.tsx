"use client";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardSidebar from "./app-sidebar";
import { ModeToggle } from "../mode-toggle";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar />

      <SidebarInset>
        <header className="h-16 shrink-0 items-center gap-2 px-4 justify-between flex">
          <SidebarTrigger className="-ml-1" />

          <ModeToggle />
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
