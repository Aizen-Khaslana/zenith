import { describe, expect, test } from "bun:test";
import { type z } from "zod";

import { MAX_AMOUNT, MAX_LABEL_LENGTH, MAX_ROWS } from "@/lib/config/constants";
import { addDays } from "@/lib/date/calendar";
import {
  D01_OPENING_BALANCE,
  D01_PAYLOAD,
  D01_TRANSACTIONS,
} from "@/lib/sample/d01";

import {
  createDatasetPayloadSchema,
  getIssueCode,
  transactionInputSchema,
  type DatasetIssueCode,
  type TransactionInput,
} from "../dataset";

// PRD 6.1, K-66, K-69, K-73. Satu pelanggaran = tepat satu issue berkode (AC-01.6).

const TODAY = "2026-11-14"; // D_max D-01
const schema = createDatasetPayloadSchema({ today: TODAY });

const validExpense: TransactionInput = {
  date: "2026-11-10",
  label: "Makan siang",
  amount: 20_000,
  type: "PENGELUARAN",
  expense_tier: "PRIMER",
};
const validIncome: TransactionInput = {
  date: "2026-11-01",
  label: "Uang saku",
  amount: 1_000_000,
  type: "PEMASUKAN",
  expense_tier: null,
};

function payloadWith(transactions: unknown[], overrides: object = {}) {
  return {
    file_name: "data.csv",
    file_type: "CSV",
    opening_balance: 0,
    transactions,
    ...overrides,
  };
}

function issuesOf(input: unknown, s: z.ZodTypeAny = schema) {
  const result = s.safeParse(input);
  expect(result.success).toBe(false);
  return result.success ? [] : result.error.issues;
}

function expectSingleIssue(
  input: unknown,
  code: DatasetIssueCode,
  path: (string | number)[],
) {
  const issues = issuesOf(input);
  expect(issues.map((i) => ({ code: getIssueCode(i), path: i.path }))).toEqual([
    { code, path },
  ]);
}

describe("D-01", () => {
  test("diterima dan keluaran sama dengan masukan", () => {
    expect(D01_TRANSACTIONS).toHaveLength(28);
    expect(D01_OPENING_BALANCE).toBe(200_000);
    const result = schema.safeParse(D01_PAYLOAD);
    expect(result.error?.issues).toBeUndefined();
    expect(result.data).toEqual({
      ...D01_PAYLOAD,
      transactions: [...D01_TRANSACTIONS],
    });
  });

  test("setiap baris D-01 diterima skema baris", () => {
    for (const row of D01_TRANSACTIONS) {
      expect(transactionInputSchema.safeParse(row).success).toBe(true);
    }
  });
});

describe("satu pelanggaran baris menghasilkan tepat satu issue", () => {
  // Baris pelanggar diletakkan pada indeks 1 di antara baris sah.
  const cases: [DatasetIssueCode, string, string, Record<string, unknown>][] = [
    ["V-01", "tanggal kosong", "date", { date: "" }],
    ["V-01", "tanggal hanya spasi", "date", { date: "   " }],
    ["V-01", "tanggal null", "date", { date: null }],
    ["V-01", "tanggal tidak ada", "date", { date: undefined }],
    ["V-02", "tanggal tidak ada di kalender", "date", { date: "2026-02-30" }],
    ["V-02", "format DD/MM/YYYY", "date", { date: "14/11/2026" }],
    ["V-02", "tanggal bukan teks", "date", { date: 20261114 }],
    ["V-03", "tanggal sesudah hari ini", "date", { date: "2026-11-15" }],
    ["V-04", "label kosong", "label", { label: "" }],
    ["V-04", "label hanya spasi", "label", { label: "   " }],
    ["V-04", "label hanya tab dan baris baru", "label", { label: "\t\n " }],
    ["V-04", "label null", "label", { label: null }],
    [
      "V-05",
      "label 101 karakter",
      "label",
      { label: "a".repeat(MAX_LABEL_LENGTH + 1) },
    ],
    ["V-06", "nominal berupa teks", "amount", { amount: "18000" }],
    ["V-06", "nominal NaN", "amount", { amount: Number.NaN }],
    ["V-06", "nominal tidak ada", "amount", { amount: undefined }],
    ["V-07", "nominal -5", "amount", { amount: -5 }],
    ["V-07", "nominal 0", "amount", { amount: 0 }],
    ["V-07", "nominal negatif pecahan", "amount", { amount: -5.5 }],
    ["V-08", "nominal pecahan", "amount", { amount: 1500.5 }],
    ["V-09", "nominal 1.000.000.000", "amount", { amount: MAX_AMOUNT + 1 }],
    ["V-10", "tipe tidak dikenal", "type", { type: "TRANSFER" }],
    ["V-10", "tipe huruf kecil", "type", { type: "pengeluaran" }],
    ["V-10", "tipe tidak ada", "type", { type: undefined }],
    ["V-11", "pengeluaran tanpa jenis", "expense_tier", { expense_tier: null }],
    ["V-11", "pengeluaran jenis kosong", "expense_tier", { expense_tier: "" }],
    ["V-13", "jenis tidak dikenal", "expense_tier", { expense_tier: "MEWAH" }],
  ];

  test.each(cases)("%s: %s", (code, _name, field, patch) => {
    const bad = { ...validExpense, ...patch };
    expectSingleIssue(payloadWith([validIncome, bad, validExpense]), code, [
      "transactions",
      1,
      field,
    ]);
  });

  test("V-12: pemasukan dengan jenis pengeluaran", () => {
    const bad = { ...validIncome, expense_tier: "PRIMER" };
    expectSingleIssue(payloadWith([validExpense, bad]), "V-12", [
      "transactions",
      1,
      "expense_tier",
    ]);
  });

  test("V-12: pemasukan dengan jenis tidak dikenal tetap hanya V-12", () => {
    const bad = { ...validIncome, expense_tier: "MEWAH" };
    expectSingleIssue(payloadWith([validExpense, bad]), "V-12", [
      "transactions",
      1,
      "expense_tier",
    ]);
  });

  test("amount = -5 hanya menghasilkan V-07", () => {
    const issues = issuesOf(payloadWith([{ ...validExpense, amount: -5 }]));
    expect(issues).toHaveLength(1);
    expect(getIssueCode(issues[0]!)).toBe("V-07");
  });

  test("skema baris memberi kode yang sama tanpa awalan transactions", () => {
    const result = transactionInputSchema.safeParse({
      ...validExpense,
      label: "   ",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((i) => [getIssueCode(i), i.path])).toEqual([
      ["V-04", ["label"]],
    ]);
  });

  test("dua pelanggaran pada dua baris menghasilkan dua issue", () => {
    const issues = issuesOf(
      payloadWith([
        { ...validExpense, amount: -5 },
        validIncome,
        { ...validExpense, label: "" },
      ]),
    );
    expect(issues.map((i) => [getIssueCode(i), i.path])).toEqual([
      ["V-07", ["transactions", 0, "amount"]],
      ["V-04", ["transactions", 2, "label"]],
    ]);
  });
});

describe("batas nilai baris", () => {
  test("label 100 karakter diterima", () => {
    const row = { ...validExpense, label: "a".repeat(MAX_LABEL_LENGTH) };
    expect(schema.safeParse(payloadWith([row])).success).toBe(true);
  });

  test("label tidak dipangkas", () => {
    const row = { ...validExpense, label: "  Makan siang " };
    expect(schema.parse(payloadWith([row])).transactions[0]?.label).toBe(
      "  Makan siang ",
    );
  });

  test.each([1, MAX_AMOUNT])("nominal %p diterima", (amount) => {
    const row = { ...validExpense, amount };
    expect(schema.safeParse(payloadWith([row])).success).toBe(true);
  });

  test("pemasukan tanpa kunci expense_tier diterima sebagai null", () => {
    const { expense_tier: _omit, ...row } = validIncome;
    const parsed = schema.parse(payloadWith([row]));
    expect(parsed.transactions[0]?.expense_tier).toBeNull();
  });

  test("kunci tambahan pada baris dibuang", () => {
    const parsed = schema.parse(payloadWith([{ ...validExpense, extra: 1 }]));
    expect(parsed.transactions[0]).toEqual(validExpense);
  });
});

describe("V-03 terhadap hari ini", () => {
  test("tanggal sama dengan hari ini diterima", () => {
    const row = { ...validExpense, date: TODAY };
    expect(schema.safeParse(payloadWith([row])).success).toBe(true);
  });

  test("tanggal sehari sesudah hari ini ditolak V-03", () => {
    const row = { ...validExpense, date: addDays(TODAY, 1) };
    expectSingleIssue(payloadWith([row]), "V-03", ["transactions", 0, "date"]);
  });

  test("hari ini berasal dari parameter, bukan jam sistem", () => {
    const later = createDatasetPayloadSchema({ today: "2026-11-30" });
    const row = { ...validExpense, date: "2026-11-30" };
    expect(later.safeParse(payloadWith([row])).success).toBe(true);
    expect(schema.safeParse(payloadWith([row])).success).toBe(false);
  });

  test("parameter hari ini yang tidak valid ditolak saat membuat skema", () => {
    expect(() => createDatasetPayloadSchema({ today: "2026-02-30" })).toThrow(
      RangeError,
    );
  });
});

describe("V-14 Saldo Kas Awal", () => {
  test.each([0, 200_000, 999_999_999])("S_0 %p diterima", (value) => {
    const p = payloadWith([validExpense], { opening_balance: value });
    expect(schema.safeParse(p).success).toBe(true);
  });

  test.each([
    ["1.000.000.000", 1_000_000_000],
    ["negatif", -1],
    ["pecahan", 1500.5],
    ["teks", "200000"],
    ["null", null],
    ["NaN", Number.NaN],
  ])("S_0 %s ditolak hanya V-14", (_name, value) => {
    const p = payloadWith([validExpense], { opening_balance: value });
    expectSingleIssue(p, "V-14", ["opening_balance"]);
  });
});

describe("F-05 jumlah baris", () => {
  const rows = (n: number) => Array.from({ length: n }, () => validExpense);

  test("0 baris ditolak F-05", () => {
    expectSingleIssue(payloadWith([]), "F-05", ["transactions"]);
  });

  test("5.000 baris diterima", () => {
    expect(schema.safeParse(payloadWith(rows(MAX_ROWS))).success).toBe(true);
  });

  test("5.001 baris ditolak hanya F-05", () => {
    expectSingleIssue(payloadWith(rows(MAX_ROWS + 1)), "F-05", [
      "transactions",
    ]);
  });

  test("transactions bukan larik ditolak F-05", () => {
    expectSingleIssue(payloadWith([], { transactions: "x" }), "F-05", [
      "transactions",
    ]);
  });
});

describe("F-08 rentang tanggal (K-66: N_hari maksimal 366)", () => {
  const span = (n: number) => {
    const first = addDays(TODAY, -(n - 1));
    return payloadWith([
      { ...validExpense, date: TODAY },
      { ...validExpense, date: first },
    ]);
  };

  test("N_hari 366 diterima", () => {
    expect(schema.safeParse(span(366)).success).toBe(true);
  });

  test("N_hari 367 ditolak hanya F-08", () => {
    expectSingleIssue(span(367), "F-08", ["transactions"]);
  });

  test("tanggal tidak sah tidak ikut dihitung F-08, hanya V-02", () => {
    const p = payloadWith([
      { ...validExpense, date: TODAY },
      { ...validExpense, date: "bukan tanggal" },
    ]);
    expectSingleIssue(p, "V-02", ["transactions", 1, "date"]);
  });
});

describe("kolom payload lain", () => {
  test.each(["XLSX", "XLS", "CSV", "MANUAL"])(
    "file_type %p diterima",
    (fileType) => {
      const p = payloadWith([validExpense], { file_type: fileType });
      expect(schema.safeParse(p).success).toBe(true);
    },
  );

  test("file_type tidak dikenal ditolak", () => {
    const issues = issuesOf(payloadWith([validExpense], { file_type: "PDF" }));
    expect(issues.map((i) => i.path)).toEqual([["file_type"]]);
  });

  test.each([
    ["kosong", ""],
    ["101 karakter", "a".repeat(101)],
  ])("file_name %s ditolak", (_name, fileName) => {
    const issues = issuesOf(
      payloadWith([validExpense], { file_name: fileName }),
    );
    expect(issues.map((i) => i.path)).toEqual([["file_name"]]);
  });

  test("kolom payload yang gagal tidak menyembunyikan kesalahan baris", () => {
    const issues = issuesOf(
      payloadWith([{ ...validExpense, amount: -5 }], {
        file_type: "PDF",
        opening_balance: -1,
      }),
    );
    expect(issues.map((i) => [getIssueCode(i), i.path])).toEqual([
      [null, ["file_type"]],
      ["V-14", ["opening_balance"]],
      ["V-07", ["transactions", 0, "amount"]],
    ]);
  });

  test("baris bukan objek ditolak V-01 saja", () => {
    expectSingleIssue(payloadWith([validExpense, "baris"]), "V-01", [
      "transactions",
      1,
      "date",
    ]);
  });

  test("file_name 100 karakter diterima", () => {
    const p = payloadWith([validExpense], { file_name: "a".repeat(100) });
    expect(schema.safeParse(p).success).toBe(true);
  });
});
