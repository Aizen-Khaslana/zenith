"use client";

import {
  ArrowUpRightIcon,
  BookOpenIcon,
  ChartLineIcon,
  ClockIcon,
  LayoutGridIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UploadIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useActiveDirectory } from "@/hooks/use-active-directory";
import { cn } from "@/lib/utils";
import {
  APP_LABEL,
  buildNavItems,
  findActiveHref,
  flattenNavHrefs,
  type NavIcon,
  type NavItem,
} from "./nav-items";

const ICONS: Record<NavIcon, LucideIcon> = {
  dashboard: LayoutGridIcon,
  directories: UploadIcon,
  analysis: ChartLineIcon,
  runway: ClockIcon,
  simulation: SlidersHorizontalIcon,
  // Ikon Panduan hanya tampil pada mode ikon. Mode terbuka memakai panah.
  guide: BookOpenIcon,
  settings: SettingsIcon,
};

// Ukuran dari UIReff/02_Dashboard.png (Laporan-WP02 T4).
// Mode ikon: label setinggi 16 disembunyikan dengan margin -16 (bukan -32
// bawaan shadcn untuk label h-8), sehingga label tidak menggeser ikon.
const GROUP_LABEL =
  "h-4 rounded-none px-3 text-[10px]/4 font-semibold uppercase text-sidebar-muted-foreground group-data-[collapsible=icon]:-mt-4";

// Mode ikon: jarak tepi ke tepi 12 px antara logo dan kotak ikon 32x32.
const ICON_MODE_MENU =
  "group-data-[collapsible=icon]:mt-3 group-data-[collapsible=icon]:gap-3";

function useNav() {
  const pathname = usePathname();
  const { activeDirectory } = useActiveDirectory();
  return useMemo(() => {
    const nav = buildNavItems(activeDirectory);
    return { nav, activeHref: findActiveHref(pathname, flattenNavHrefs(nav)) };
  }, [activeDirectory, pathname]);
}

function useCloseOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar();
  return () => {
    if (isMobile) setOpenMobile(false);
  };
}

function MainItem({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = ICONS[item.icon];
  const close = useCloseOnNavigate();
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={item.title}
        render={<Link href={item.href} onClick={close} />}
        className="text-sidebar-foreground data-active:text-sidebar-accent-foreground [&_svg]:text-panel-muted-foreground data-active:[&_svg]:text-sidebar-primary h-11 gap-2.5 rounded-sm px-4 text-[13px] font-medium data-active:font-semibold"
      >
        <Icon aria-hidden="true" />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/** Label aplikasi, item utama, dan grup direktori aktif. */
export function NavMain() {
  const { nav, activeHref } = useNav();
  return (
    <>
      <SidebarGroup className="px-4 pt-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-0">
        <SidebarGroupLabel className={cn(GROUP_LABEL, "mt-13.5")}>
          {APP_LABEL}
        </SidebarGroupLabel>
        <SidebarMenu className={cn("mt-5 gap-2", ICON_MODE_MENU)}>
          {nav.main.map((item) => (
            <MainItem
              key={item.href}
              item={item}
              active={item.href === activeHref}
            />
          ))}
        </SidebarMenu>
      </SidebarGroup>
      {nav.directory ? (
        <SidebarGroup className="mt-4 px-4 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-0">
          <SidebarGroupLabel className={cn(GROUP_LABEL, "normal-case")}>
            {nav.directory.title}
          </SidebarGroupLabel>
          <SidebarMenu className={cn("mt-3 gap-2", ICON_MODE_MENU)}>
            {nav.directory.items.map((item) => (
              <MainItem
                key={item.href}
                item={item}
                active={item.href === activeHref}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ) : null}
    </>
  );
}

/** Grup "Pusat bantuan": Panduan penggunaan (href="#") dan Pengaturan. */
export function NavHelp() {
  const { nav, activeHref } = useNav();
  const close = useCloseOnNavigate();
  return (
    <SidebarGroup className="p-0">
      <SidebarGroupLabel className={GROUP_LABEL}>
        {nav.help.title}
      </SidebarGroupLabel>
      <SidebarMenu className="mt-1.5 gap-0 group-data-[collapsible=icon]:gap-3">
        {nav.help.items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = item.href === activeHref;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={active}
                tooltip={item.title}
                render={<Link href={item.href} onClick={close} />}
                className={cn(
                  "text-sidebar-foreground data-active:text-sidebar-accent-foreground h-8 gap-2 rounded-sm px-3 data-active:font-semibold",
                  item.external ? "text-xs" : "text-[13px]",
                )}
              >
                {item.external ? (
                  <>
                    {/* Mode ikon: hanya satu ikon (sejajar ikon lain) dan
                        tooltip. Mode terbuka: teks lalu panah, tidak berubah. */}
                    <Icon
                      aria-hidden="true"
                      className="hidden group-data-[collapsible=icon]:block"
                    />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-3! group-data-[collapsible=icon]:hidden"
                    />
                  </>
                ) : (
                  <>
                    <Icon
                      aria-hidden="true"
                      className="hidden group-data-[collapsible=icon]:block"
                    />
                    <span>{item.title}</span>
                  </>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
