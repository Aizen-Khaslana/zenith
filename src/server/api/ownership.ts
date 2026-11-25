// Pemeriksaan kepemilikan direktori (PRD Bagian 5.0 butir 2, NFR-02).
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

import { type Db } from "@/server/db/client";
import { directories } from "@/server/db/schema";

/** Db biasa atau objek transaksi dari db.transaction. */
type DbOrTx = Pick<Db, "select">;

/**
 * Mengambil direktori milik pengguna. Direktori yang tidak ada dan milik
 * pengguna lain sama-sama menghasilkan NOT_FOUND agar tidak membocorkan
 * keberadaan data.
 */
export async function getOwnedDirectory(
  db: DbOrTx,
  userId: string,
  directoryId: string,
) {
  const row = await db
    .select()
    .from(directories)
    .where(and(eq(directories.id, directoryId), eq(directories.userId, userId)))
    .get();
  if (!row) {
    throw new TRPCError({ code: "NOT_FOUND" });
  }
  return row;
}
