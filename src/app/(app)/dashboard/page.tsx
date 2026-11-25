import { EmptySection } from "@/app/_components/dashboard/empty-section";
import { HeaderSection } from "@/app/_components/dashboard/header-section";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { requireSession } from "@/server/better-auth/require-session";

// WP-02: Dashboard hanya keadaan empty (PRD 5.8). Data dan pemilih direktori
// ditambahkan pada WP-05 dan WP-06.
export default async function DashboardPage() {
  const session = await requireSession();
  return (
    <div className="flex flex-col gap-7.5">
      <PageBreadcrumb items={[{ title: "Dashboard" }]} />
      <HeaderSection userName={session.user.name} createHref="/directories" />
      <EmptySection />
    </div>
  );
}
