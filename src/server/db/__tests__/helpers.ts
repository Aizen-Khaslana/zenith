import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

import { migrate } from "drizzle-orm/libsql/migrator";

import { createDb, type DbHandle } from "../client";

export type TestDb = DbHandle & { cleanup: () => Promise<void> };

/** Database libSQL berkas sementara dengan seluruh migrasi diterapkan. */
export async function createTestDb(): Promise<TestDb> {
  const base = resolve(tmpdir());
  const dir = await mkdtemp(join(base, "zenith-test-"));
  const file = join(dir, "test.db");
  if (!resolve(file).startsWith(base + sep)) {
    throw new Error("Database tes harus berada di direktori sementara");
  }
  const handle = createDb({ url: `file:${file}` });
  await handle.ready;
  await migrate(handle.db, { migrationsFolder: "drizzle" });
  return {
    ...handle,
    cleanup: async () => {
      handle.client.close();
      await rm(dir, { recursive: true, force: true });
    },
  };
}

/** Pesan galat libSQL beserta penyebabnya, untuk mencocokkan jenis constraint. */
export function errorText(e: unknown): string {
  const parts: string[] = [];
  let cur: unknown = e;
  while (cur instanceof Error) {
    parts.push(cur.message);
    cur = cur.cause;
  }
  return parts.join(" | ");
}

export async function expectConstraint(
  run: () => Promise<unknown>,
  kind: "UNIQUE" | "CHECK" | "FOREIGN KEY",
): Promise<void> {
  let caught: unknown;
  try {
    await run();
  } catch (e) {
    caught = e;
  }
  if (caught === undefined) {
    throw new Error(`Diharapkan pelanggaran ${kind}, tetapi operasi berhasil`);
  }
  const text = errorText(caught);
  if (!text.includes(`${kind} constraint failed`)) {
    throw new Error(`Diharapkan pelanggaran ${kind}, didapat: ${text}`);
  }
}
