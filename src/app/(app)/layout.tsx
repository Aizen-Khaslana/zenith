import { cookies } from "next/headers";

import { Toaster } from "@/components/ui/sonner";
import { ActiveDirectoryProvider } from "@/hooks/use-active-directory";
import { BreadcrumbProvider } from "@/hooks/use-breadcrumb";
import { AppLayout } from "@/layouts/app-layout";
import { requireSession } from "@/server/better-auth/require-session";

// Nama cookie yang ditulis komponen sidebar shadcn (src/components/ui/sidebar.tsx).
const SIDEBAR_COOKIE = "sidebar_state";

export default async function AppGroupLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get(SIDEBAR_COOKIE)?.value !== "false";
  const user = { name: session.user.name, email: session.user.email };

  return (
    <BreadcrumbProvider>
      <ActiveDirectoryProvider>
        <AppLayout user={user} defaultOpen={defaultOpen}>
          {children}
        </AppLayout>
        <Toaster position="top-right" />
      </ActiveDirectoryProvider>
    </BreadcrumbProvider>
  );
}
