// Pembuat koneksi database. Tidak mengimpor env agar bisa dipakai tes.
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as authSchema from "./auth-schema";
import * as domainSchema from "./schema";

export const schema = { ...authSchema, ...domainSchema };

export type Db = ReturnType<typeof drizzle<typeof schema, Client>>;

/**
 * Menyalakan foreign key lalu memeriksa ulang lewat panggilan terpisah.
 * @libsql/client tidak punya hook per koneksi: klien lokal memakai pool dan
 * klien remote membuka stream baru per panggilan. Pemeriksaan kedua memastikan
 * panggilan berikutnya juga menegakkan foreign key (PRD Lampiran A.5, K-13).
 */
export async function enforceForeignKeys(client: Client): Promise<void> {
  await client.execute("PRAGMA foreign_keys = ON");
  const rs = await client.execute("PRAGMA foreign_keys");
  if (Number(rs.rows[0]?.foreign_keys) !== 1) {
    throw new Error("PRAGMA foreign_keys tidak aktif pada koneksi database");
  }
}

export type DbHandle = { client: Client; db: Db; ready: Promise<void> };

export function createDb(cfg: { url: string; authToken?: string }): DbHandle {
  const client = createClient(cfg);
  const ready = enforceForeignKeys(client);
  // Penolakan tetap dilaporkan lewat `await ready`; ini hanya mencegah
  // unhandled rejection sebelum pemanggil sempat menunggunya.
  ready.catch(() => undefined);
  const db = drizzle(client, { schema });
  return { client, db, ready };
}
