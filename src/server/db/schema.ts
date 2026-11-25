// Tabel domain Zenith (PRD Lampiran A.4). Hanya directories yang membawa
// user_id; tabel di bawahnya diakses lewat direktori yang sudah diverifikasi.
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

import { users } from "./auth-schema";

export const directories = sqliteTable(
  "directories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [index("directories_user_created_idx").on(t.userId, t.createdAt)],
);

export const importBatches = sqliteTable(
  "import_batches",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    directoryId: text("directory_id")
      .notNull()
      .references(() => directories.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileType: text("file_type", {
      enum: ["XLSX", "XLS", "CSV", "MANUAL"],
    }).notNull(),
    rowCount: integer("row_count").notNull(),
    openingBalance: integer("opening_balance").notNull().default(0),
    periodStart: text("period_start").notNull(),
    periodEnd: text("period_end").notNull(),
    dayCount: integer("day_count").notNull(),
    activeDayCount: integer("active_day_count").notNull(), // jumlah tanggal unik dengan pengeluaran
    engineVersion: text("engine_version").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("import_batches_directory_uq").on(t.directoryId),
    check("import_batches_opening_balance_chk", sql`${t.openingBalance} >= 0`),
    check("import_batches_period_chk", sql`${t.periodEnd} >= ${t.periodStart}`),
  ],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    batchId: text("batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    rowNumber: integer("row_number").notNull(),
    trxDate: text("trx_date").notNull(), // YYYY-MM-DD
    label: text("label").notNull(),
    amount: integer("amount").notNull(),
    type: text("type", { enum: ["PEMASUKAN", "PENGELUARAN"] }).notNull(),
    expenseTier: text("expense_tier", {
      enum: ["PRIMER", "SEKUNDER", "TERSIER"],
    }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    uniqueIndex("transactions_batch_row_uq").on(t.batchId, t.rowNumber),
    index("transactions_batch_date_idx").on(t.batchId, t.trxDate),
    check("transactions_amount_chk", sql`${t.amount} > 0`),
    check(
      "transactions_type_chk",
      sql`${t.type} IN ('PEMASUKAN','PENGELUARAN')`,
    ),
    check(
      "transactions_tier_chk",
      sql`${t.expenseTier} IS NULL OR ${t.expenseTier} IN ('PRIMER','SEKUNDER','TERSIER')`,
    ),
    check(
      "transactions_tier_presence_chk",
      sql`(${t.type} = 'PENGELUARAN') = (${t.expenseTier} IS NOT NULL)`,
    ),
  ],
);

export const batchAnalytics = sqliteTable(
  "batch_analytics",
  {
    batchId: text("batch_id")
      .primaryKey()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    totalIncome: integer("total_income").notNull(),
    totalExpense: integer("total_expense").notNull(),
    expensePrimer: integer("expense_primer").notNull(),
    expenseSekunder: integer("expense_sekunder").notNull(),
    expenseTersier: integer("expense_tersier").notNull(),
    currentBalance: integer("current_balance").notNull(),
    ncfRatio: real("ncf_ratio"),
    healthStatus: text("health_status", {
      enum: ["SEHAT", "RAWAN", "KRITIS"],
    }).notNull(),
    ratioPrimer: real("ratio_primer"),
    ratioSekunder: real("ratio_sekunder"),
    ratioTersier: real("ratio_tersier"),
    burnRate: real("burn_rate").notNull(),
    runwayStatus: text("runway_status", {
      enum: ["NORMAL", "TIDAK_TERHINGGA", "HABIS"],
    }).notNull(),
    runwayDays: real("runway_days"),
    regressionStatus: text("regression_status", {
      enum: [
        "DATA_TIDAK_CUKUP",
        "SUDAH_HABIS",
        "ESTIMASI_RATA_RATA",
        "DIPREDIKSI",
        "TIDAK_HABIS",
      ],
    }).notNull(),
    slopeM: real("slope_m"),
    interceptC: real("intercept_c"),
    depletionDate: text("depletion_date"), // terisi bila DIPREDIKSI atau ESTIMASI_RATA_RATA
  },
  (t) => [
    check(
      "batch_analytics_total_chk",
      sql`${t.totalExpense} = ${t.expensePrimer} + ${t.expenseSekunder} + ${t.expenseTersier}`,
    ),
    check(
      "batch_analytics_health_chk",
      sql`${t.healthStatus} IN ('SEHAT','RAWAN','KRITIS')`,
    ),
  ],
);

export const simulations = sqliteTable(
  "simulations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    batchId: text("batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    scenarioType: text("scenario_type", {
      enum: ["BARANG_IMPIAN", "UTANG"],
    }).notNull(),
    targetAmount: integer("target_amount").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("simulations_batch_uq").on(t.batchId),
    check("simulations_target_chk", sql`${t.targetAmount} > 0`),
  ],
);

export const aiFeedbacks = sqliteTable(
  "ai_feedbacks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    batchId: text("batch_id")
      .notNull()
      .references(() => importBatches.id, { onDelete: "cascade" }),
    scope: text("scope", { enum: ["ANALISIS", "SIMULASI"] }).notNull(),
    source: text("source", { enum: ["GEMINI", "TEMPLATE"] }).notNull(),
    modelName: text("model_name"),
    narrative: text("narrative").notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    fallbackReason: text("fallback_reason", {
      enum: ["NO_CONSENT", "TIMEOUT", "API_ERROR", "GROUNDING_FAILED"],
    }),
    latencyMs: integer("latency_ms"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("ai_feedbacks_batch_scope_uq").on(t.batchId, t.scope)],
);
