// Skema Zod bersama untuk payload dataset (PRD 6.1). Dipakai klien dan input
// procedure tRPC. Server tetap memvalidasi ulang (Aturan 3 butir 6).
//
// Setiap pelanggaran menghasilkan tepat satu issue dengan kode Lampiran B pada
// `params.code` (K-69, AC-01.6). Setiap kolom diperiksa berurutan dan berhenti
// pada pelanggaran pertama. Penyusunan pesan per baris dikerjakan WP-04.

import { z } from "zod";

import {
  MAX_AMOUNT,
  MAX_DAY_SPAN,
  MAX_LABEL_LENGTH,
  MAX_OPENING_BALANCE,
  MAX_ROWS,
} from "@/lib/config/constants";
import { diffDays, isValidIsoDate } from "@/lib/date/calendar";
import {
  EXPENSE_TIERS,
  FILE_TYPES,
  TRANSACTION_TYPES,
  type ExpenseTier,
  type FileType,
  type TransactionType,
} from "@/lib/domain/enums";

// PRD 6.1 menetapkan file_name maksimal 100 karakter tanpa nama konstanta di
// Lampiran C. Menunggu keputusan pemilik produk (laporan T2).
const MAX_FILE_NAME_LENGTH = 100;

export const DATASET_ISSUE_CODES = [
  "V-01",
  "V-02",
  "V-03",
  "V-04",
  "V-05",
  "V-06",
  "V-07",
  "V-08",
  "V-09",
  "V-10",
  "V-11",
  "V-12",
  "V-13",
  "V-14",
  "F-05",
  "F-08",
] as const;
export type DatasetIssueCode = (typeof DATASET_ISSUE_CODES)[number];

export type TransactionInput = {
  date: string;
  label: string;
  amount: number;
  type: TransactionType;
  expense_tier: ExpenseTier | null;
};

export type DatasetPayload = {
  file_name: string;
  file_type: FileType;
  opening_balance: number;
  transactions: TransactionInput[];
};

/** Kode Lampiran B pada issue, atau null untuk issue tanpa kode. */
export function getIssueCode(issue: z.ZodIssue): DatasetIssueCode | null {
  if (issue.code !== z.ZodIssueCode.custom) return null;
  const code: unknown = issue.params?.code;
  return DATASET_ISSUE_CODES.find((c) => c === code) ?? null;
}

function addCodedIssue(
  ctx: z.RefinementCtx,
  code: DatasetIssueCode,
  path: (string | number)[],
) {
  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message: code,
    params: { code },
    path,
  });
}

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const isMember = <T extends string>(
  values: readonly T[],
  value: unknown,
): value is T => values.some((v) => v === value);

type RawRow = Record<string, unknown>;

/** Pemeriksaan satu baris. Mengembalikan baris bertipe bila sah. */
function checkRow(
  row: RawRow,
  ctx: z.RefinementCtx,
  prefix: (string | number)[],
  today: string | null,
): TransactionInput | null {
  let ok = true;
  const fail = (code: DatasetIssueCode, field: string) => {
    addCodedIssue(ctx, code, [...prefix, field]);
    ok = false;
  };

  const { date, label, amount, type, expense_tier: tier } = row;

  if (isBlank(date)) fail("V-01", "date");
  else if (typeof date !== "string" || !isValidIsoDate(date))
    fail("V-02", "date");
  else if (today !== null && date > today) fail("V-03", "date");

  if (typeof label !== "string" || label.trim() === "") fail("V-04", "label");
  else if (label.length > MAX_LABEL_LENGTH) fail("V-05", "label");

  if (typeof amount !== "number" || Number.isNaN(amount))
    fail("V-06", "amount");
  else if (amount <= 0) fail("V-07", "amount");
  else if (!Number.isInteger(amount) && Number.isFinite(amount))
    fail("V-08", "amount");
  else if (amount > MAX_AMOUNT) fail("V-09", "amount");

  if (!isMember(TRANSACTION_TYPES, type)) fail("V-10", "type");

  const tierBlank = isBlank(tier);
  if (type === "PEMASUKAN") {
    if (!tierBlank) fail("V-12", "expense_tier");
  } else if (tierBlank) {
    if (type === "PENGELUARAN") fail("V-11", "expense_tier");
  } else if (!isMember(EXPENSE_TIERS, tier)) {
    fail("V-13", "expense_tier");
  }

  if (!ok) return null;
  return {
    date: date as string,
    label: label as string,
    amount: amount as number,
    type: type as TransactionType,
    expense_tier: tierBlank ? null : (tier as ExpenseTier),
  };
}

const rawRow = z.record(z.unknown());

function rowSchema(today: string | null) {
  return rawRow.transform(
    (row, ctx) => checkRow(row, ctx, [], today) ?? z.NEVER,
  );
}

/**
 * Skema satu baris tanpa V-03, untuk validasi baris tabel manual di
 * antarmuka. V-03 butuh tanggal hari ini dan diperiksa skema payload.
 */
export const transactionInputSchema: z.ZodType<
  TransactionInput,
  z.ZodTypeDef,
  unknown
> = rowSchema(null);

/**
 * Skema payload dataset. `today` adalah tanggal hari ini pada zona
 * Asia/Jakarta (jakartaToday), diberikan pemanggil (Aturan 3 butir 11).
 */
export function createDatasetPayloadSchema({
  today,
}: {
  today: string;
}): z.ZodType<DatasetPayload, z.ZodTypeDef, unknown> {
  if (!isValidIsoDate(today)) {
    throw new RangeError(`Tanggal hari ini tidak valid: "${today}"`);
  }

  const fileNameSchema = z.string().min(1).max(MAX_FILE_NAME_LENGTH);
  const fileTypeSchema = z.enum(FILE_TYPES);

  // Seluruh kolom diterima sebagai unknown agar setiap kolom tetap diperiksa
  // walaupun kolom lain gagal.
  return z.record(z.unknown()).transform((payload, ctx) => {
    let ok = true;
    const forward = (field: string, error: z.ZodError) => {
      for (const issue of error.issues) {
        ctx.addIssue({ ...issue, path: [field, ...issue.path] });
      }
      ok = false;
    };

    const fileName = fileNameSchema.safeParse(payload.file_name);
    if (!fileName.success) forward("file_name", fileName.error);
    const fileType = fileTypeSchema.safeParse(payload.file_type);
    if (!fileType.success) forward("file_type", fileType.error);

    const balance = payload.opening_balance;
    const balanceOk =
      typeof balance === "number" &&
      Number.isInteger(balance) &&
      balance >= 0 &&
      balance <= MAX_OPENING_BALANCE;
    if (!balanceOk) {
      addCodedIssue(ctx, "V-14", ["opening_balance"]);
      ok = false;
    }

    const rows = payload.transactions;
    if (!Array.isArray(rows) || rows.length < 1 || rows.length > MAX_ROWS) {
      // Baris tidak diperiksa bila jumlahnya di luar batas (satu pelanggaran).
      addCodedIssue(ctx, "F-05", ["transactions"]);
      return z.NEVER;
    }

    const parsed: TransactionInput[] = [];
    let dMin: string | null = null;
    let dMax: string | null = null;
    for (const [index, row] of (rows as unknown[]).entries()) {
      const raw = rawRow.safeParse(row);
      if (!raw.success) {
        // Baris bukan objek: diperlakukan sebagai baris tanpa tanggal.
        addCodedIssue(ctx, "V-01", ["transactions", index, "date"]);
        ok = false;
        continue;
      }
      const value = checkRow(raw.data, ctx, ["transactions", index], today);
      if (value) parsed.push(value);
      else ok = false;

      // F-08 memakai seluruh tanggal yang sah, termasuk dari baris yang
      // gagal pada kolom lain.
      const date = raw.data.date;
      if (typeof date === "string" && isValidIsoDate(date)) {
        if (dMin === null || date < dMin) dMin = date;
        if (dMax === null || date > dMax) dMax = date;
      }
    }

    if (
      dMin !== null &&
      dMax !== null &&
      diffDays(dMax, dMin) + 1 > MAX_DAY_SPAN
    ) {
      addCodedIssue(ctx, "F-08", ["transactions"]);
      ok = false;
    }

    if (!ok || !fileName.success || !fileType.success || !balanceOk) {
      return z.NEVER;
    }
    return {
      file_name: fileName.data,
      file_type: fileType.data,
      opening_balance: balance,
      transactions: parsed,
    };
  });
}
