import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { count, eq } from "drizzle-orm";

import { accounts, sessions, users, verifications } from "@/server/db/auth-schema";
import { createTestDb, type TestDb } from "@/server/db/__tests__/helpers";
import { createAuth, type Auth } from "../create-auth";

const BASE_URL = "http://localhost:3000";
// Nilai palsu khusus tes, bukan kredensial sungguhan.
const FAKE = {
  secret: "test-secret-test-secret-test-secret-0123456789",
  google: { clientId: "test-client-id", clientSecret: "test-client-secret" },
};

let t: TestDb;
let auth: Auth;

beforeEach(async () => {
  t = await createTestDb();
  auth = createAuth(t.db, { ...FAKE, baseURL: BASE_URL });
});

afterEach(async () => {
  await t.cleanup();
});

async function countOf(table: typeof users | typeof sessions | typeof accounts | typeof verifications) {
  const [row] = await t.db.select({ n: count() }).from(table);
  return row?.n ?? 0;
}

function post(path: string, body: unknown) {
  return auth.handler(
    new Request(`${BASE_URL}/api/auth${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: BASE_URL },
      body: JSON.stringify(body),
    }),
  );
}

/** Memulai masuk dengan Google tanpa jaringan: hanya membangun URL Google. */
async function startGoogleSignIn() {
  const res = await post("/sign-in/social", {
    provider: "google",
    callbackURL: "/",
    errorCallbackURL: "/login",
  });
  expect(res.status).toBe(200);
  const body = (await res.json()) as { url: string };
  const state = new URL(body.url).searchParams.get("state");
  const cookies = res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  return { googleUrl: new URL(body.url), state, cookies };
}

describe("email dan kata sandi dinonaktifkan", () => {
  test("/sign-in/email ditolak", async () => {
    const res = await post("/sign-in/email", {
      email: "a@example.com",
      password: "kata-sandi-panjang",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(await countOf(users)).toBe(0);
    expect(await countOf(sessions)).toBe(0);
  });

  test("/sign-up/email ditolak", async () => {
    const res = await post("/sign-up/email", {
      name: "A",
      email: "a@example.com",
      password: "kata-sandi-panjang",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(await countOf(users)).toBe(0);
  });

  test("penyedia selain Google ditolak", async () => {
    const res = await post("/sign-in/social", {
      provider: "github",
      callbackURL: "/",
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(await countOf(verifications)).toBe(0);
  });
});

describe("state OAuth pada verifications (K-10, 10.4 butir 2)", () => {
  test("satu baris state tanpa email, kedaluwarsa sekitar 10 menit", async () => {
    const before = Date.now();
    const { googleUrl, state } = await startGoogleSignIn();

    expect(googleUrl.hostname).toBe("accounts.google.com");
    // Tanpa scope tambahan dan tanpa akses offline (A.3 aturan 4).
    expect(googleUrl.searchParams.get("access_type")).toBeNull();
    expect(googleUrl.searchParams.get("scope")?.split(" ").sort()).toEqual([
      "email",
      "openid",
      "profile",
    ]);

    const rows = await t.db.select().from(verifications);
    expect(rows.length).toBe(1);
    const row = rows[0]!;
    expect(row.identifier).toMatch(/^auth-state:.{32}$/);
    expect(state).toBeTruthy();

    const value = JSON.parse(row.value) as Record<string, unknown>;
    // Dicetak agar dapat dibandingkan dengan K-10 pada laporan WP-01.
    console.log("[K-10] kunci value:", Object.keys(value).sort().join(", "));
    expect(row.value).not.toContain("@");

    const minutes = (row.expiresAt.getTime() - before) / 60_000;
    console.log("[K-10] expiresAt - sekarang (menit):", minutes.toFixed(2));
    expect(minutes).toBeGreaterThan(9);
    expect(minutes).toBeLessThanOrEqual(10.1);
  });
});

describe("pembatalan pada layar Google (AC-06.9)", () => {
  test("kembali ke /login dengan error dan tanpa baris pengguna baru", async () => {
    const { state, cookies } = await startGoogleSignIn();
    expect(await countOf(verifications)).toBe(1);
    const res = await auth.handler(
      new Request(
        `${BASE_URL}/api/auth/callback/google?error=access_denied&state=${encodeURIComponent(state ?? "")}`,
        { method: "GET", headers: { cookie: cookies } },
      ),
    );
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "", BASE_URL);
    console.log("[AC-06.9] location:", location.pathname + location.search);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("error")).toBeTruthy();
    expect(await countOf(users)).toBe(0);
    expect(await countOf(sessions)).toBe(0);
    expect(await countOf(accounts)).toBe(0);
    // K-10: pembatalan lewat tombol Batal (callback access_denied) menghapus
    // baris state pada Better Auth 1.7.28.
    expect(await countOf(verifications)).toBe(0);
  });

  test("callback tanpa state yang sah juga kembali ke /login", async () => {
    const res = await auth.handler(
      new Request(`${BASE_URL}/api/auth/callback/google?error=access_denied`, {
        method: "GET",
      }),
    );
    expect(res.status).toBe(302);
    const location = new URL(res.headers.get("location") ?? "", BASE_URL);
    console.log("[AC-06.9] location tanpa state:", location.pathname + location.search);
    expect(location.pathname).toBe("/login");
    expect(await countOf(users)).toBe(0);
  });
});

describe("akun Google dan token OAuth (K-11, 10.4 butir 3)", () => {
  const fakeTokens = {
    accessToken: "fake-access",
    refreshToken: "fake-refresh",
    idToken: "fake-id",
    accessTokenExpiresAt: new Date(Date.UTC(2030, 0, 1)),
    refreshTokenExpiresAt: new Date(Date.UTC(2030, 0, 1)),
  };

  async function createGoogleUser() {
    const ctx = await auth.$context;
    return ctx.internalAdapter.createOAuthUser(
      { name: "A", email: "a@example.com", emailVerified: true },
      {
        providerId: "google",
        accountId: "google-123",
        scope: "openid email profile",
        ...fakeTokens,
      },
    );
  }

  test("satu login menghasilkan tepat satu users dan satu accounts google, password NULL", async () => {
    await createGoogleUser();
    expect(await countOf(users)).toBe(1);
    const rows = await t.db.select().from(accounts);
    expect(rows.length).toBe(1);
    expect(rows[0]!.providerId).toBe("google");
    expect(rows[0]!.password).toBeNull();
    const [u] = await t.db.select().from(users);
    expect(u!.aiConsentAt).toBeNull();
  });

  test("create: token tidak tersimpan, kolom lain tersimpan", async () => {
    const created = await createGoogleUser();
    const [row] = await t.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, created.account.id));
    expect(row!.accessToken).toBeNull();
    expect(row!.refreshToken).toBeNull();
    expect(row!.idToken).toBeNull();
    expect(row!.accessTokenExpiresAt).toBeNull();
    expect(row!.refreshTokenExpiresAt).toBeNull();
    expect(row!.scope).toBe("openid email profile");
    expect(row!.accountId).toBe("google-123");
  });

  test("update: token baru tetap tidak tersimpan", async () => {
    const created = await createGoogleUser();
    const ctx = await auth.$context;
    await ctx.internalAdapter.updateAccount(created.account.id, {
      ...fakeTokens,
      scope: "openid email",
    });
    const [row] = await t.db
      .select()
      .from(accounts)
      .where(eq(accounts.id, created.account.id));
    expect(row!.accessToken).toBeNull();
    expect(row!.refreshToken).toBeNull();
    expect(row!.idToken).toBeNull();
    expect(row!.accessTokenExpiresAt).toBeNull();
    expect(row!.refreshTokenExpiresAt).toBeNull();
    expect(row!.scope).toBe("openid email");
  });

  test("id memakai UUID", async () => {
    const created = await createGoogleUser();
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(created.user.id).toMatch(uuid);
    expect(created.account.id).toMatch(uuid);
  });
});
