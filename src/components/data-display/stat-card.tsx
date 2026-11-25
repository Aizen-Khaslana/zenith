import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  variant?: "default" | "inverse" | "soft";
  className?: string;
};

// Ukuran sementara dari 02_Dashboard.png (Laporan-WP02 T5), diverifikasi
// ulang saat kartu diisi data pada WP-05.
const VARIANTS = {
  default: "bg-card text-card-foreground border-border",
  inverse: "bg-primary text-primary-foreground border-primary",
  soft: "bg-accent text-accent-foreground border-accent",
} as const;

const MUTED = {
  default: "text-muted-foreground",
  inverse: "text-panel-muted-foreground",
  soft: "text-muted-foreground",
} as const;

/** Kartu angka ringkasan (PRD 5.8 komponen global). */
export function StatCard({
  label,
  value,
  hint,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-h-33 flex-col gap-3 rounded-xl border p-6",
        VARIANTS[variant],
        className,
      )}
    >
      <p className={cn("text-[13px]", MUTED[variant])}>{label}</p>
      <p className="text-[28px]/9 font-semibold">{value}</p>
      {hint ? (
        <p className={cn("text-[13px]", MUTED[variant])}>{hint}</p>
      ) : null}
    </div>
  );
}
