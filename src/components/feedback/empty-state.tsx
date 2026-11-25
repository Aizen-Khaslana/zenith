import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  /** Tombol tindakan (PRD 5.1: empty berisi penjelasan dan tombol). */
  action?: React.ReactNode;
  className?: string;
};

/** Keadaan empty untuk area data (PRD 5.1, 5.8). */
export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "bg-card border-border flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="bg-accent text-accent-foreground flex size-12 items-center justify-center rounded-full">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      ) : null}
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {action}
    </section>
  );
}
