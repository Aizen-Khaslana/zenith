import { cn } from "@/lib/utils";

export type HealthStatus = "SEHAT" | "RAWAN" | "KRITIS";

const STYLES: Record<HealthStatus, { badge: string; dot: string }> = {
  SEHAT: {
    badge: "bg-status-sehat-soft text-status-sehat",
    dot: "bg-status-sehat",
  },
  RAWAN: {
    badge: "bg-status-rawan-soft text-status-rawan",
    dot: "bg-status-rawan",
  },
  KRITIS: {
    badge: "bg-status-kritis-soft text-status-kritis",
    dot: "bg-status-kritis",
  },
};

/** Lencana status kesehatan cashflow (PRD 7.2). Warna RAWAN dan KRITIS turunan (P9). */
export function StatusBadge({
  status,
  className,
}: {
  status: HealthStatus;
  className?: string;
}) {
  const style = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold",
        style.badge,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-2 rounded-full", style.dot)}
      />
      {status}
    </span>
  );
}
