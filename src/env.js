import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Nama variabel final mengikuti PRD K-18. GEMINI_API_KEY opsional sampai WP-08 (K-14).
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    TURSO_AUTH_TOKEN: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GEMINI_API_KEY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {},

  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Jalankan `build` atau `dev` dengan `SKIP_ENV_VALIDATION` untuk melewati validasi env.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * String kosong dianggap undefined.
   */
  emptyStringAsUndefined: true,
});
