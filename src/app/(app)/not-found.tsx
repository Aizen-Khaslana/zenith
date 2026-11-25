import { SearchXIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Button } from "@/components/ui/button";

// Halaman 404 di dalam kerangka (app), dipakai AC-06.2 lewat notFound()
// dari getOwnedDirectory pada WP-04 dan WP-05.
export default function AppNotFound() {
  return (
    <>
      <PageBreadcrumb items={[{ title: "Halaman tidak ditemukan" }]} />
      <EmptyState
        icon={SearchXIcon}
        title="Halaman tidak ditemukan"
        description="Halaman yang Anda cari tidak ada atau tidak dapat Anda akses."
        action={
          <Button nativeButton={false} render={<Link href="/dashboard" />}>
            Kembali ke Dashboard
          </Button>
        }
      />
    </>
  );
}
