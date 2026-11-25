import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { TRPCError } from "@trpc/server";

import { insertDirectory, insertUser } from "@/server/db/__tests__/fixtures";
import { createTestDb, type TestDb } from "@/server/db/__tests__/helpers";
import { getOwnedDirectory } from "../ownership";

let t: TestDb;

beforeEach(async () => {
  t = await createTestDb();
});

afterEach(async () => {
  await t.cleanup();
});

async function codeOf(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (e) {
    return e instanceof TRPCError ? e.code : "BUKAN_TRPC_ERROR";
  }
  return "BERHASIL";
}

describe("getOwnedDirectory", () => {
  test("pemilik mendapatkan direktorinya", async () => {
    const userA = await insertUser(t.db, "a");
    const dirA = await insertDirectory(t.db, userA, "Semester 1");
    const row = await getOwnedDirectory(t.db, userA, dirA);
    expect(row.id).toBe(dirA);
    expect(row.userId).toBe(userA);
    expect(row.name).toBe("Semester 1");
  });

  test("direktori milik pengguna lain ditolak dengan NOT_FOUND", async () => {
    const userA = await insertUser(t.db, "a");
    const userB = await insertUser(t.db, "b");
    const dirB = await insertDirectory(t.db, userB);
    expect(await codeOf(() => getOwnedDirectory(t.db, userA, dirB))).toBe(
      "NOT_FOUND",
    );
  });

  test("direktori yang tidak ada menghasilkan kode yang sama", async () => {
    const userA = await insertUser(t.db, "a");
    expect(
      await codeOf(() => getOwnedDirectory(t.db, userA, crypto.randomUUID())),
    ).toBe("NOT_FOUND");
  });

  test("dapat dipakai di dalam transaksi", async () => {
    const userA = await insertUser(t.db, "a");
    const dirA = await insertDirectory(t.db, userA);
    const id = await t.db.transaction(async (tx) => {
      const row = await getOwnedDirectory(tx, userA, dirA);
      return row.id;
    });
    expect(id).toBe(dirA);
  });
});
