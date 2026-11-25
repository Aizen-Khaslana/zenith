import { HourglassIcon } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/page-header";

// SEMENTARA: dipakai halaman yang isinya dibuat pada WP fitur (WP-04 sampai
// WP-09). Dihapus saat halaman terakhir yang memakainya diganti.
export function PlaceholderSection({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-7.5">
      <PageHeader title={title} />
      <EmptyState
        icon={HourglassIcon}
        title="Halaman sedang disiapkan"
        description="Isi halaman ini tersedia pada tahap pengembangan berikutnya."
      />
    </div>
  );
}
