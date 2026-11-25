import { PlaceholderSection } from "@/app/_components/placeholder/placeholder-section";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { requireSession } from "@/server/better-auth/require-session";

// SEMENTARA: PRD 5.0 menjadikan rute ini pengarah (berisi data ke analysis,
// kosong ke import). Pengarah membutuhkan getOwnedDirectory dan data impor,
// sehingga dikerjakan pada WP-04. Nama direktori juga baru tersedia di WP-04.
export default async function Page() {
  await requireSession();
  return (
    <>
      <PageBreadcrumb
        items={[{ title: "Direktori Data", href: "/directories" }]}
      />
      <PlaceholderSection title="Direktori" />
    </>
  );
}
