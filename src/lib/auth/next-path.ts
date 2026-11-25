// Penyaring parameter `next` pada /login (PRD 5.8, K-24, 10.4 butir 7).
// Murni: dipakai oleh server (requireSession, halaman login) dan tes.

const FALLBACK = "/";

// Backslash ditolak karena browser memperlakukan "/\host" seperti "//host".
// Karakter kontrol U+0000 sampai U+001F (termasuk tab dan baris baru) dibuang
// browser dari URL sehingga dapat menyamarkan "//".
const FORBIDDEN_CHARS = /[\\\u0000-\u001f]/;

/**
 * Mengembalikan `value` bila berupa path internal yang diawali satu garis
 * miring. Selain itu mengembalikan "/".
 */
export function sanitizeNext(value: unknown): string {
  if (typeof value !== "string") return FALLBACK;
  if (!value.startsWith("/") || value.startsWith("//")) return FALLBACK;
  if (FORBIDDEN_CHARS.test(value)) return FALLBACK;
  return value;
}
