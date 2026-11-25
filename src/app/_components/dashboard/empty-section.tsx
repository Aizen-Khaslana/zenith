import { FolderOpenIcon } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";

/** Dashboard tanpa direktori berisi data (PRD 5.3 Empty). */
export function EmptySection() {
  return (
    <EmptyState
      icon={FolderOpenIcon}
      title="Belum ada data untuk dianalisis"
      description="Buat direktori lalu impor data transaksi untuk melihat kesehatan arus kas Anda."
      action={
        <Button nativeButton={false} render={<Link href="/directories" />}>
          Mulai analisis
        </Button>
      }
    />
  );
}
