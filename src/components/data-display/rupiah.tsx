import { formatRupiah } from "@/lib/format/rupiah";
import { cn } from "@/lib/utils";

type RupiahProps = {
  /** Bilangan bulat. Pembulatan ditentukan pemanggil (PRD 7.8). */
  value: number;
  className?: string;
};

/** Nominal berformat Rp1.337.000 atau -Rp300.000 (PRD 5.1). */
export function Rupiah({ value, className }: RupiahProps) {
  return (
    <span className={cn("tabular-nums", className)}>{formatRupiah(value)}</span>
  );
}
