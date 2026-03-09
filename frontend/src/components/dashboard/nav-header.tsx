"use client";

import * as React from "react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export default function SidebarNavHeader() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-default hover:bg-transparent active:bg-transparent"
        >
          <div className="size-8 rounded-lg bg-linear-to-tr from-foreground to-muted-foreground flex items-center justify-center shadow-md">
            <span className="text-background font-bold text-lg">V</span>
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-semibold tracking-tight">
                  VidSurvey
                </span>
              </div>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
