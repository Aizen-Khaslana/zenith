"use client";

import { CircleAlertIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
  className?: string;
};

/** Keadaan error dengan tombol Coba lagi (PRD 5.1, 5.8). */
export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        "bg-card border-border flex flex-col items-center gap-4 rounded-xl border px-6 py-12 text-center",
        className,
      )}
    >
      <span className="bg-status-kritis-soft text-status-kritis flex size-12 items-center justify-center rounded-full">
        <CircleAlertIcon aria-hidden="true" className="size-6" />
      </span>
      <p className="max-w-md text-sm">{message}</p>
      <Button type="button" variant="outline" onClick={onRetry}>
        <RotateCcwIcon aria-hidden="true" />
        Coba lagi
      </Button>
    </section>
  );
}
