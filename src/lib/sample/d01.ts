// Data contoh D-01 (PRD Lampiran D, K-71): 28 baris November 2026, S_0 200.000.
// Dipakai tes skema dan engine serta halaman fitur selama impor belum tersedia.

import type { ExpenseTier, TransactionType } from "@/lib/domain/enums";

type SampleRow = {
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  expense_tier: ExpenseTier | null;
};

const income = (date: string, label: string, amount: number): SampleRow => ({
  date,
  label,
  amount,
  type: "PEMASUKAN",
  expense_tier: null,
});

const expense = (
  date: string,
  label: string,
  amount: number,
  expense_tier: ExpenseTier,
): SampleRow => ({ date, label, amount, type: "PENGELUARAN", expense_tier });

export const D01_OPENING_BALANCE = 200_000;

export const D01_TRANSACTIONS: readonly SampleRow[] = [
  income("2026-11-01", "Uang saku bulanan", 1_500_000),
  expense("2026-11-01", "Makan siang", 20_000, "PRIMER"),
  expense("2026-11-01", "Laundry bulanan", 100_000, "SEKUNDER"),
  expense("2026-11-02", "Makan malam", 18_000, "PRIMER"),
  expense("2026-11-02", "Bensin motor", 30_000, "PRIMER"),
  expense("2026-11-03", "Makan siang", 22_000, "PRIMER"),
  expense("2026-11-03", "Paket data", 60_000, "SEKUNDER"),
  expense("2026-11-04", "Fotokopi modul", 15_000, "SEKUNDER"),
  expense("2026-11-04", "Makan malam", 25_000, "PRIMER"),
  expense("2026-11-05", "Nongkrong kafe", 85_000, "TERSIER"),
  expense("2026-11-06", "Makan siang", 25_000, "PRIMER"),
  expense("2026-11-06", "Beli buku catatan", 40_000, "SEKUNDER"),
  expense("2026-11-07", "Nonton bioskop", 60_000, "TERSIER"),
  expense("2026-11-07", "Makan malam", 30_000, "PRIMER"),
  income("2026-11-08", "Honor asisten praktikum", 250_000),
  expense("2026-11-08", "Makan siang", 28_000, "PRIMER"),
  expense("2026-11-09", "Belanja baju online", 190_000, "TERSIER"),
  expense("2026-11-09", "Bensin motor", 30_000, "PRIMER"),
  expense("2026-11-10", "Makan siang", 30_000, "PRIMER"),
  expense("2026-11-10", "Makan malam", 35_000, "PRIMER"),
  expense("2026-11-11", "Nongkrong kafe", 120_000, "TERSIER"),
  expense("2026-11-11", "Makan siang", 30_000, "PRIMER"),
  expense("2026-11-12", "Makan malam", 35_000, "PRIMER"),
  expense("2026-11-12", "Langganan streaming", 54_000, "TERSIER"),
  expense("2026-11-13", "Makan siang", 32_000, "PRIMER"),
  expense("2026-11-13", "Makan malam", 38_000, "PRIMER"),
  expense("2026-11-14", "Nongkrong kafe", 150_000, "TERSIER"),
  expense("2026-11-14", "Makan siang", 35_000, "PRIMER"),
];

/** Payload Bagian 6.1 untuk D-01, seolah diunggah sebagai CSV. */
export const D01_PAYLOAD = {
  file_name: "data-contoh-d01.csv",
  file_type: "CSV",
  opening_balance: D01_OPENING_BALANCE,
  transactions: D01_TRANSACTIONS,
} as const;
