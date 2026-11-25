// Preload bun test. Bun memuat .env otomatis, sehingga kredensial database
// bersama dihapus di sini sebelum berkas tes mana pun dievaluasi. Tes hanya
// memakai database libSQL berkas sementara (src/server/db/__tests__/helpers.ts).
delete process.env.DATABASE_URL;
delete process.env.TURSO_AUTH_TOKEN;
