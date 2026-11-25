"use client";

import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { NavHelp, NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { type AppUser } from "./user-menu";

export function AppSidebar({ user }: { user: AppUser }) {
  return (
    <Sidebar collapsible="icon" className="group-data-[side=left]:border-r-0">
      <SidebarHeader className="px-6 pt-6 pb-0 group-data-[collapsible=icon]:px-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-sm"
          aria-label="Zenith, ke Dashboard"
        >
          <Image
            src="/logo-zenith.svg"
            alt=""
            width={34}
            height={34}
            unoptimized
            priority
            className="shrink-0 group-data-[collapsible=icon]:size-8"
          />
          <span className="text-sidebar-foreground text-2xl/[34px] font-bold group-data-[collapsible=icon]:hidden">
            Zenith.
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="gap-1.5 px-4 pt-0 pb-17 group-data-[collapsible=icon]:gap-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-4">
        <NavHelp />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
