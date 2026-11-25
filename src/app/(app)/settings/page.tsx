import { PlaceholderSection } from "@/app/_components/placeholder/placeholder-section";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { requireSession } from "@/server/better-auth/require-session";

export default async function Page() {
  await requireSession();
  return (
    <>
      <PageBreadcrumb items={[{ title: "Pengaturan" }]} />
      <PlaceholderSection title="Pengaturan" />
    </>
  );
}
