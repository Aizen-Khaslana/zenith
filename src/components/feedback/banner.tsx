import { TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export type WarningCode = "W-01" | "W-02" | "W-03" | "W-04";

type BannerProps = {
  code: WarningCode;
  /** Teks dari Lampiran B, nilai placeholder sudah diisi pemanggil. */
  message: string;
  className?: string;
};

/** Peringatan non-blokir W-01 sampai W-04 (PRD 5.1, Lampiran B). */
export function Banner({ code, message, className }: BannerProps) {
  return (
    <Alert
      data-code={code}
      className={cn(
        "border-status-rawan/30 bg-status-rawan-soft text-status-rawan",
        className,
      )}
    >
      <TriangleAlertIcon aria-hidden="true" />
      <AlertDescription className="text-status-rawan">
        {message}
      </AlertDescription>
    </Alert>
  );
}
