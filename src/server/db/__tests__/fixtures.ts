// Pembuat baris uji minimal untuk tes integrasi skema.
import { type Db } from "../client";
import { accounts, sessions, users } from "../auth-schema";
import {
  aiFeedbacks,
  batchAnalytics,
  directories,
  importBatches,
  simulations,
  transactions,
} from "../schema";

export async function insertUser(db: Db, tag: string) {
  const id = crypto.randomUUID();
  await db.insert(users).values({
    id,
    name: `Pengguna ${tag}`,
    email: `${tag}@example.com`,
  });
  return id;
}

export async function insertSessionAndAccount(db: Db, userId: string) {
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId,
    token: crypto.randomUUID(),
    expiresAt: new Date(Date.UTC(2030, 0, 1)),
  });
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    userId,
    providerId: "google",
    accountId: crypto.randomUUID(),
  });
}

export async function insertDirectory(db: Db, userId: string, name = "Data") {
  const [row] = await db
    .insert(directories)
    .values({ userId, name })
    .returning({ id: directories.id });
  return row!.id;
}

export const batchValues = (directoryId: string) => ({
  directoryId,
  fileName: "data.csv",
  fileType: "CSV" as const,
  rowCount: 2,
  openingBalance: 0,
  periodStart: "2026-11-01",
  periodEnd: "2026-11-02",
  dayCount: 2,
  activeDayCount: 1,
  engineVersion: "test",
});

export const analyticsValues = (batchId: string) => ({
  batchId,
  totalIncome: 100,
  totalExpense: 60,
  expensePrimer: 30,
  expenseSekunder: 20,
  expenseTersier: 10,
  currentBalance: 40,
  ncfRatio: 0.4,
  healthStatus: "SEHAT" as const,
  burnRate: 30,
  runwayStatus: "NORMAL" as const,
  runwayDays: 1.3,
  regressionStatus: "DATA_TIDAK_CUKUP" as const,
});

/** Satu direktori lengkap: batch, 2 transaksi, analitik, simulasi, 2 ringkasan AI. */
export async function insertFullDataset(db: Db, userId: string) {
  const directoryId = await insertDirectory(db, userId);
  const [batch] = await db
    .insert(importBatches)
    .values(batchValues(directoryId))
    .returning({ id: importBatches.id });
  const batchId = batch!.id;
  await db.insert(transactions).values([
    {
      batchId,
      rowNumber: 1,
      trxDate: "2026-11-01",
      label: "Kiriman",
      amount: 100,
      type: "PEMASUKAN",
    },
    {
      batchId,
      rowNumber: 2,
      trxDate: "2026-11-02",
      label: "Makan",
      amount: 60,
      type: "PENGELUARAN",
      expenseTier: "PRIMER",
    },
  ]);
  await db.insert(batchAnalytics).values(analyticsValues(batchId));
  await db.insert(simulations).values({
    batchId,
    title: "Laptop",
    scenarioType: "BARANG_IMPIAN",
    targetAmount: 1000,
  });
  await db.insert(aiFeedbacks).values([
    { batchId, scope: "ANALISIS", source: "TEMPLATE", narrative: "a" },
    { batchId, scope: "SIMULASI", source: "TEMPLATE", narrative: "b" },
  ]);
  return { directoryId, batchId };
}
