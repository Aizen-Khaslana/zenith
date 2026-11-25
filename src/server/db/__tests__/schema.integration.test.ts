import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { count, eq } from "drizzle-orm";
import { type SQLiteTable } from "drizzle-orm/sqlite-core";

import { enforceForeignKeys } from "../client";
import { accounts, sessions, users, verifications } from "../auth-schema";
import {
  aiFeedbacks,
  batchAnalytics,
  directories,
  importBatches,
  simulations,
  transactions,
} from "../schema";
import {
  analyticsValues,
  batchValues,
  insertDirectory,
  insertFullDataset,
  insertSessionAndAccount,
  insertUser,
} from "./fixtures";
import { createTestDb, expectConstraint, type TestDb } from "./helpers";

let t: TestDb;

beforeEach(async () => {
  t = await createTestDb();
});

afterEach(async () => {
  await t.cleanup();
});

const EXPECTED_TABLES = [
  "accounts",
  "ai_feedbacks",
  "batch_analytics",
  "directories",
  "import_batches",
  "sessions",
  "simulations",
  "transactions",
  "users",
  "verifications",
];

async function fkValue(run: () => Promise<{ rows: unknown[] }>) {
  const rs = await run();
  const row = rs.rows[0] as { foreign_keys?: unknown } | undefined;
  return Number(row?.foreign_keys);
}

async function rows(table: SQLiteTable) {
  const [r] = await t.db.select({ n: count() }).from(table);
  return r?.n ?? 0;
}

describe("migrasi", () => {
  test("database kosong menghasilkan tepat 10 tabel bernama jamak", async () => {
    const rs = await t.client.execute(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> '__drizzle_migrations' ORDER BY name",
    );
    expect(rs.rows.map((r) => r.name)).toEqual(EXPECTED_TABLES);
  });
});

describe("PRAGMA foreign_keys (K-13)", () => {
  test("aktif pada panggilan pertama dan berikutnya", async () => {
    expect(await fkValue(() => t.client.execute("PRAGMA foreign_keys"))).toBe(1);
    expect(await fkValue(() => t.client.execute("PRAGMA foreign_keys"))).toBe(1);
  });

  test("aktif di dalam transaksi interaktif", async () => {
    const tx = await t.client.transaction("write");
    try {
      expect(await fkValue(() => tx.execute("PRAGMA foreign_keys"))).toBe(1);
    } finally {
      await tx.rollback();
    }
  });

  test("aktif di dalam batch", async () => {
    const [rs] = await t.client.batch(["PRAGMA foreign_keys"], "read");
    expect(Number((rs!.rows[0] as { foreign_keys?: unknown }).foreign_keys)).toBe(1);
  });

  test("enforceForeignKeys gagal bila pragma tetap 0", async () => {
    const fake = {
      execute: async () => ({ rows: [{ foreign_keys: 0 }] }),
    } as unknown as Parameters<typeof enforceForeignKeys>[0];
    let message = "TIDAK_MELEMPAR";
    try {
      await enforceForeignKeys(fake);
    } catch (e) {
      message = e instanceof Error ? e.message : String(e);
    }
    expect(message).toContain("PRAGMA foreign_keys tidak aktif");
  });
});

describe("CASCADE", () => {
  test("hapus directories menghapus seluruh data di bawahnya, direktori lain utuh", async () => {
    const userId = await insertUser(t.db, "a");
    const target = await insertFullDataset(t.db, userId);
    const other = await insertFullDataset(t.db, userId);

    await t.db.delete(directories).where(eq(directories.id, target.directoryId));

    expect(await rows(directories)).toBe(1);
    expect(await rows(importBatches)).toBe(1);
    expect(await rows(transactions)).toBe(2);
    expect(await rows(batchAnalytics)).toBe(1);
    expect(await rows(simulations)).toBe(1);
    expect(await rows(aiFeedbacks)).toBe(2);
    const [left] = await t.db.select({ id: importBatches.id }).from(importBatches);
    expect(left?.id).toBe(other.batchId);
  });

  test("hapus import_batches menghapus seluruh data anak, direktori tetap", async () => {
    const userId = await insertUser(t.db, "a");
    const { batchId } = await insertFullDataset(t.db, userId);

    await t.db.delete(importBatches).where(eq(importBatches.id, batchId));

    expect(await rows(directories)).toBe(1);
    expect(await rows(importBatches)).toBe(0);
    expect(await rows(transactions)).toBe(0);
    expect(await rows(batchAnalytics)).toBe(0);
    expect(await rows(simulations)).toBe(0);
    expect(await rows(aiFeedbacks)).toBe(0);
  });

  test("hapus users menghapus sesi, akun, direktori, dan turunannya; verifications tetap", async () => {
    const userA = await insertUser(t.db, "a");
    const userB = await insertUser(t.db, "b");
    await insertSessionAndAccount(t.db, userA);
    await insertSessionAndAccount(t.db, userB);
    await insertFullDataset(t.db, userA);
    await insertFullDataset(t.db, userB);
    await t.db.insert(verifications).values({
      id: crypto.randomUUID(),
      identifier: "auth-state:x",
      value: "{}",
      expiresAt: new Date(Date.UTC(2030, 0, 1)),
    });

    await t.db.delete(users).where(eq(users.id, userA));

    expect(await rows(users)).toBe(1);
    expect(await rows(sessions)).toBe(1);
    expect(await rows(accounts)).toBe(1);
    expect(await rows(directories)).toBe(1);
    expect(await rows(importBatches)).toBe(1);
    expect(await rows(transactions)).toBe(2);
    expect(await rows(batchAnalytics)).toBe(1);
    expect(await rows(simulations)).toBe(1);
    expect(await rows(aiFeedbacks)).toBe(2);
    expect(await rows(verifications)).toBe(1);
  });
});

describe("constraint unik", () => {
  test("import_batches kedua pada direktori yang sama ditolak", async () => {
    const userId = await insertUser(t.db, "a");
    const directoryId = await insertDirectory(t.db, userId);
    await t.db.insert(importBatches).values(batchValues(directoryId));
    await expectConstraint(
      () => t.db.insert(importBatches).values(batchValues(directoryId)),
      "UNIQUE",
    );
  });

  test("simulations kedua pada batch yang sama ditolak", async () => {
    const userId = await insertUser(t.db, "a");
    const { batchId } = await insertFullDataset(t.db, userId);
    await expectConstraint(
      () =>
        t.db.insert(simulations).values({
          batchId,
          title: "Motor",
          scenarioType: "UTANG",
          targetAmount: 500,
        }),
      "UNIQUE",
    );
  });

  test("ai_feedbacks kedua pada pasangan batch_id dan scope yang sama ditolak", async () => {
    const userId = await insertUser(t.db, "a");
    const { batchId } = await insertFullDataset(t.db, userId);
    await expectConstraint(
      () =>
        t.db.insert(aiFeedbacks).values({
          batchId,
          scope: "ANALISIS",
          source: "GEMINI",
          narrative: "c",
        }),
      "UNIQUE",
    );
  });

  test("users.email", async () => {
    await insertUser(t.db, "a");
    await expectConstraint(() => insertUser(t.db, "a"), "UNIQUE");
  });

  test("sessions.token", async () => {
    const userId = await insertUser(t.db, "a");
    const token = crypto.randomUUID();
    const row = () =>
      t.db.insert(sessions).values({
        id: crypto.randomUUID(),
        userId,
        token,
        expiresAt: new Date(Date.UTC(2030, 0, 1)),
      });
    await row();
    await expectConstraint(row, "UNIQUE");
  });

  test("accounts (provider_id, account_id)", async () => {
    const userId = await insertUser(t.db, "a");
    const row = () =>
      t.db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId,
        providerId: "google",
        accountId: "google-123",
      });
    await row();
    await expectConstraint(row, "UNIQUE");
  });

  test("transactions (batch_id, row_number)", async () => {
    const userId = await insertUser(t.db, "a");
    const { batchId } = await insertFullDataset(t.db, userId);
    await expectConstraint(
      () =>
        t.db.insert(transactions).values({
          batchId,
          rowNumber: 1,
          trxDate: "2026-11-03",
          label: "Ulang",
          amount: 5,
          type: "PEMASUKAN",
        }),
      "UNIQUE",
    );
  });

  test("batch_analytics.batch_id (1:1)", async () => {
    const userId = await insertUser(t.db, "a");
    const { batchId } = await insertFullDataset(t.db, userId);
    await expectConstraint(
      () => t.db.insert(batchAnalytics).values(analyticsValues(batchId)),
      "UNIQUE",
    );
  });
});

describe("CHECK dan foreign key", () => {
  async function newBatch() {
    const userId = await insertUser(t.db, "a");
    const directoryId = await insertDirectory(t.db, userId);
    const [b] = await t.db
      .insert(importBatches)
      .values(batchValues(directoryId))
      .returning({ id: importBatches.id });
    return { directoryId, batchId: b!.id };
  }

  const trx = (batchId: string, over: Record<string, unknown>) =>
    t.db.insert(transactions).values({
      batchId,
      rowNumber: 1,
      trxDate: "2026-11-01",
      label: "x",
      amount: 10,
      type: "PENGELUARAN",
      expenseTier: "PRIMER",
      ...over,
    } as typeof transactions.$inferInsert);

  test("amount harus lebih dari 0", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(() => trx(batchId, { amount: 0 }), "CHECK");
  });

  test("PEMASUKAN tidak boleh memiliki tier", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(
      () => trx(batchId, { type: "PEMASUKAN", expenseTier: "PRIMER" }),
      "CHECK",
    );
  });

  test("PENGELUARAN wajib memiliki tier", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(() => trx(batchId, { expenseTier: null }), "CHECK");
  });

  test("tier di luar enum ditolak", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(() => trx(batchId, { expenseTier: "MEWAH" }), "CHECK");
  });

  test("type di luar enum ditolak", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(
      () => trx(batchId, { type: "TRANSFER", expenseTier: null }),
      "CHECK",
    );
  });

  test("opening_balance negatif ditolak", async () => {
    const userId = await insertUser(t.db, "a");
    const directoryId = await insertDirectory(t.db, userId);
    await expectConstraint(
      () =>
        t.db
          .insert(importBatches)
          .values({ ...batchValues(directoryId), openingBalance: -1 }),
      "CHECK",
    );
  });

  test("period_end sebelum period_start ditolak", async () => {
    const userId = await insertUser(t.db, "a");
    const directoryId = await insertDirectory(t.db, userId);
    await expectConstraint(
      () =>
        t.db.insert(importBatches).values({
          ...batchValues(directoryId),
          periodStart: "2026-11-02",
          periodEnd: "2026-11-01",
        }),
      "CHECK",
    );
  });

  test("total_expense harus sama dengan jumlah tier", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(
      () =>
        t.db
          .insert(batchAnalytics)
          .values({ ...analyticsValues(batchId), totalExpense: 61 }),
      "CHECK",
    );
  });

  test("health_status di luar enum ditolak", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(
      () =>
        t.db.insert(batchAnalytics).values({
          ...analyticsValues(batchId),
          healthStatus: "BAGUS",
        } as unknown as typeof batchAnalytics.$inferInsert),
      "CHECK",
    );
  });

  test("target_amount harus lebih dari 0", async () => {
    const { batchId } = await newBatch();
    await expectConstraint(
      () =>
        t.db.insert(simulations).values({
          batchId,
          title: "x",
          scenarioType: "UTANG",
          targetAmount: 0,
        }),
      "CHECK",
    );
  });

  test("transactions dengan batch_id fiktif ditolak", async () => {
    await expectConstraint(() => trx(crypto.randomUUID(), {}), "FOREIGN KEY");
  });

  test("directories dengan user_id fiktif ditolak", async () => {
    await expectConstraint(
      () => insertDirectory(t.db, crypto.randomUUID()),
      "FOREIGN KEY",
    );
  });
});
