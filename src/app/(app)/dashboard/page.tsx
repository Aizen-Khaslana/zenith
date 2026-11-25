import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { requireSession } from "@/server/better-auth/require-session";

// SEMENTARA (T4): hanya agar kerangka dapat diperiksa di browser.
// Isi final (header-section, empty-section) dibuat pada T5.
export default async function DashboardPage() {
  await requireSession();
  return (
    <>
      <PageBreadcrumb items={[{ title: "Dashboard" }]} />
      <h1 className="text-[34px]/[42px] font-semibold">Dashboard</h1>
    </>
  );
}
