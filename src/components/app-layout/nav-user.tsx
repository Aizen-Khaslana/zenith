"use client";

import { UserIcon } from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserMenu, type AppUser } from "./user-menu";

/** Footer sidebar: nama dan email dari sesi, membuka menu Keluar. */
export function NavUser({ user }: { user: AppUser }) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenu
          user={user}
          side="top"
          align="start"
          trigger={
            <SidebarMenuButton
              size="lg"
              // Tanpa tooltip: tombol ini sudah menjadi pemicu dropdown, dan
              // dua pemicu pada satu elemen dapat menghalangi menu terbuka.
              aria-label={`Menu pengguna, ${user.name}`}
              className="data-popup-open:bg-sidebar-accent h-auto flex-col items-start gap-3.5 rounded-sm px-3 py-0 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center"
            >
              <UserIcon
                aria-hidden="true"
                className="hidden group-data-[collapsible=icon]:block"
              />
              <span className="w-full truncate text-sm/5 font-bold group-data-[collapsible=icon]:hidden">
                {user.name}
              </span>
              <span className="text-panel-muted-foreground w-full truncate text-[11px]/4 group-data-[collapsible=icon]:hidden">
                {user.email}
              </span>
            </SidebarMenuButton>
          }
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
