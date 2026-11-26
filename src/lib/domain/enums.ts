// Nilai enum domain yang dibagi pakai skema Zod, engine, dan antarmuka.
// Harus sama dengan enum kolom pada src/server/db/schema.ts (Lampiran A).
// Berkas ini tanpa dependensi agar boleh diimpor engine.

export const TRANSACTION_TYPES = ["PEMASUKAN", "PENGELUARAN"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const EXPENSE_TIERS = ["PRIMER", "SEKUNDER", "TERSIER"] as const;
export type ExpenseTier = (typeof EXPENSE_TIERS)[number];

export const FILE_TYPES = ["XLSX", "XLS", "CSV", "MANUAL"] as const;
export type FileType = (typeof FILE_TYPES)[number];
