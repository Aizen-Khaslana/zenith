"use client";

import { LogOutIcon } from "lucide-react";
import { useState, type ReactElement } from "react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AUTH_MESSAGES } from "@/lib/messages";
import { authClient } from "@/server/better-auth/client";

/** Data pengguna dari sesi server, dioper lewat props (tanpa useSession). */
export type AppUser = { name: string; email: string };

type UserMenuProps = {
  user: AppUser;
  /** Elemen pemicu. Header dan footer sidebar memakai pemicu berbeda. */
  trigger: ReactElement;
  side?: "top" | "bottom" | "right";
  align?: "start" | "end";
};

/** Menu pengguna berisi Keluar (PRD 5.8, AC-06.10). */
export function UserMenu({
  user,
  trigger,
  side = "bottom",
  align = "end",
}: UserMenuProps) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    const { error } = await authClient.signOut();
    if (error) {
      setPending(false);
      toast.error(AUTH_MESSAGES["A-02"]);
      return;
    }
    // Muat ulang penuh agar cache klien dan sesi lama tidak tersisa.
    window.location.assign("/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />
      <DropdownMenuContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-auto min-w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5">
            <span className="text-foreground truncate text-sm font-semibold">
              {user.name}
            </span>
            <span className="text-muted-foreground truncate text-xs font-normal">
              {user.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={handleSignOut}
        >
          <LogOutIcon />
          {pending ? "Memproses..." : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
