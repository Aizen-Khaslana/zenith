import { describe, expect, test } from "bun:test";

// Pesan penjaga dari paket server-only (node_modules/server-only/index.js).
const SERVER_ONLY_MESSAGE =
  "This module cannot be imported from a Client Component module.";

async function importError(load: () => Promise<unknown>): Promise<string> {
  try {
    await load();
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
  return "IMPOR_BERHASIL";
}

describe("pengaman database bersama", () => {
  test("DATABASE_URL dan TURSO_AUTH_TOKEN tidak tersedia saat tes", () => {
    expect(process.env.DATABASE_URL).toBeUndefined();
    expect(process.env.TURSO_AUTH_TOKEN).toBeUndefined();
  });

  // Galat harus berasal dari server-only, bukan validasi env atau galat lain,
  // sehingga dipastikan modul berhenti sebelum env dibaca atau koneksi dibuat.
  const guarded: Array<[string, () => Promise<unknown>]> = [
    ["@/server/db", () => import("@/server/db")],
    ["@/server/better-auth", () => import("@/server/better-auth")],
    ["@/server/api/context", () => import("@/server/api/context")],
  ];

  for (const [name, load] of guarded) {
    test(`${name} ditolak oleh penjaga server-only`, async () => {
      expect(await importError(load)).toContain(SERVER_ONLY_MESSAGE);
    });
  }
});
