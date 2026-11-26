// Format tanggal panjang Indonesia, contoh "14 November 2026" (K-70).
// Dihitung dari teks YYYY-MM-DD tanpa Date atau Intl, sehingga hasil sama
// di server dan browser apa pun zona waktunya.

import { parseIsoDate } from "@/lib/date/calendar";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

export function formatLongDate(value: string): string {
  const { year, month, day } = parseIsoDate(value);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}
