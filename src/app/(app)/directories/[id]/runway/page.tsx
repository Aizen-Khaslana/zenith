import { PlaceholderSection } from "@/app/_components/placeholder/placeholder-section";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { requireSession } from "@/server/better-auth/require-session";

// Nama direktori belum tersedia sampai WP-04 (directory.get), sehingga
// segmen {nama direktori} dilewati, bukan diisi nama karangan atau id.

export default async function Page() {
  await requireSession();
  return (
    <>
      <PageBreadcrumb
        items={[
          { title: "Direktori Data", href: "/directories" },
          { title: "Runway dan Prediksi" },
        ]}
      />
      <PlaceholderSection title="Runway dan Prediksi" />
    </>
  );
}
