// Pembuat instance Better Auth (PRD Lampiran A.3). Tidak mengimpor env atau
// koneksi global agar tes bisa memakai database sementara.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as authSchema from "@/server/db/auth-schema";
import { type Db } from "@/server/db/client";

export type CreateAuthOptions = {
  secret: string;
  baseURL: string;
  google: { clientId: string; clientSecret: string };
};

// Zenith hanya memakai Google untuk identitas dan tidak memanggil API Google,
// sehingga token OAuth tidak disimpan (PRD 10.4 butir 3, K-11).
const STRIPPED_TOKENS = {
  accessToken: null,
  refreshToken: null,
  idToken: null,
  accessTokenExpiresAt: null,
  refreshTokenExpiresAt: null,
} as const;

export function createAuth(db: Db, opts: CreateAuthOptions) {
  return betterAuth({
    secret: opts.secret,
    baseURL: opts.baseURL,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      usePlural: true,
      schema: authSchema,
    }),
    // Satu-satunya penyedia. emailAndPassword sengaja tidak diaktifkan.
    // Tanpa scope tambahan dan tanpa accessType "offline" (A.3 aturan 4).
    socialProviders: {
      google: {
        clientId: opts.google.clientId,
        clientSecret: opts.google.clientSecret,
      },
    },
    user: {
      additionalFields: {
        aiConsentAt: { type: "date", required: false, input: false },
      },
    },
    advanced: {
      database: { generateId: () => crypto.randomUUID() },
    },
    // Kegagalan sebelum state OAuth terbaca juga kembali ke /login (A-01).
    onAPIError: { errorURL: "/login" },
    databaseHooks: {
      account: {
        create: {
          before: async (account) => ({
            data: { ...account, ...STRIPPED_TOKENS },
          }),
        },
        update: {
          before: async (account) => ({
            data: { ...account, ...STRIPPED_TOKENS },
          }),
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth["$Infer"]["Session"];
