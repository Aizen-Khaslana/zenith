import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

// Ukuran dari 02_Dashboard.png (Laporan-WP02 T5): judul 30 semibold, deskripsi
// 14 px 8 di bawahnya, tombol rata atas judul di kanan.
export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-x-6 gap-y-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="text-[30px]/9 font-semibold">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 sm:mt-0.5">{action}</div> : null}
    </div>
  );
}
