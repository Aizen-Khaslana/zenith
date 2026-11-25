import { AppHeader } from "@/components/app-layout/app-header";
import { AppSidebar } from "@/components/app-layout/app-sidebar";
import { type AppUser } from "@/components/app-layout/user-menu";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Lebar sidebar 228 px dari UIReff/02_Dashboard.png (Laporan-WP02 T4).
const SIDEBAR_STYLE = { "--sidebar-width": "14.25rem" } as React.CSSProperties;

type AppLayoutProps = {
  user: AppUser;
  /** Keadaan sidebar desktop dari cookie, agar tidak berkedip saat dimuat. */
  defaultOpen: boolean;
  children: React.ReactNode;
};

/** Kerangka (app): sidebar, header, dan area konten (PRD 5.8). */
export function AppLayout({ user, defaultOpen, children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen} style={SIDEBAR_STYLE}>
      <AppSidebar user={user} />
      <SidebarInset className="min-w-0">
        <AppHeader user={user} />
        <div className="flex-1 px-4 py-6 md:px-8 md:py-9">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
