import { defineConfig } from "drizzle-kit";

// Dibaca langsung dari process.env (bun run memuat .env) agar drizzle-kit
// tidak bergantung pada alias tsconfig atau validasi env aplikasi.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL belum diisi");

export default defineConfig({
  schema: ["./src/server/db/auth-schema.ts", "./src/server/db/schema.ts"],
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
});
