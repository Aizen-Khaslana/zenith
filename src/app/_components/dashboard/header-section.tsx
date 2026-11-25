import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { firstName } from "@/lib/format/first-name";

const TAGLINE = "Kenali kondisi hari ini, rencanakan hari esok.";

type HeaderSectionProps = {
  userName: string;
  /** Tujuan Create Data: impor direktori aktif, atau /directories (PRD 5.3). */
  createHref: string;
};

export function HeaderSection({ userName, createHref }: HeaderSectionProps) {
  const name = firstName(userName);
  return (
    <PageHeader
      title="Dashboard"
      description={name ? `Halo, ${name}. ${TAGLINE}` : TAGLINE}
      action={
        // Tombol 150×42 dari 02_Dashboard.png. "Create Data" adalah
        // pengecualian bahasa (K-45).
        <Button
          nativeButton={false}
          render={<Link href={createHref} />}
          className="h-10.5 min-w-37.5 rounded-sm text-[13px] font-semibold"
        >
          Create Data
        </Button>
      }
    />
  );
}
