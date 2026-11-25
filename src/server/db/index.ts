import "server-only";

import { env } from "@/env";
import { createDb, type DbHandle } from "./client";

/**
 * Cache koneksi di development agar HMR tidak membuat koneksi baru.
 * Yang di-cache adalah seluruh handle sehingga `ready` tidak dibuat ulang.
 */
const globalForDb = globalThis as unknown as {
  dbHandle: DbHandle | undefined;
};

const handle =
  globalForDb.dbHandle ??
  createDb({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN });
if (env.NODE_ENV !== "production") globalForDb.dbHandle = handle;

// Aplikasi gagal start bila foreign key tidak aktif (K-13).
await handle.ready;

export const client = handle.client;
export const db = handle.db;
export type { Db } from "./client";
