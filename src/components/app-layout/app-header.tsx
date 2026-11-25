"use client";

import { ChevronDownIcon, PanelLeftIcon } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useBreadcrumb } from "@/hooks/use-breadcrumb";
import { cn } from "@/lib/utils";
import { APP_LABEL } from "./nav-items";
import { UserMenu, type AppUser } from "./user-menu";

function Separator({ className }: { className?: string }) {
  return (
    <BreadcrumbSeparator className={cn("text-foreground", className)}>
      /
    </BreadcrumbSeparator>
  );
}

export function AppHeader({ user }: { user: AppUser }) {
  const { toggleSidebar } = useSidebar();
  const { items } = useBreadcrumb();

  return (
    <header className="bg-card sticky top-0 z-10 flex h-19 shrink-0 items-center gap-2 px-4 md:px-8">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="-ml-1.5"
        onClick={toggleSidebar}
      >
        <PanelLeftIcon aria-hidden="true" />
        <span className="sr-only">Buka atau tutup menu</span>
      </Button>

      <Breadcrumb aria-label="Jejak navigasi" className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap gap-2 text-[13px]">
          {/* Awalan tanpa tautan, disembunyikan pada layar sempit (PRD 5.8). */}
          <BreadcrumbItem className="mr-2 hidden md:inline-flex">
            {APP_LABEL}
          </BreadcrumbItem>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <Fragment key={`${item.title}-${index}`}>
                {/* Pemisah sesudah awalan ikut tersembunyi pada layar sempit. */}
                <Separator
                  className={index === 0 ? "hidden md:inline-flex" : undefined}
                />
                <BreadcrumbItem className="min-w-0">
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="truncate">
                      {item.title}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link href={item.href} />}
                      className="truncate"
                    >
                      {item.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <UserMenu
        user={user}
        trigger={
          <Button
            type="button"
            variant="ghost"
            className="text-foreground -mr-2 h-9 max-w-48 gap-1 px-2 text-[13px] font-semibold"
          >
            <span className="truncate">{user.name}</span>
            <ChevronDownIcon aria-hidden="true" className="size-3" />
          </Button>
        }
      />
    </header>
  );
}
