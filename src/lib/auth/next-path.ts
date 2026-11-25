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

const DEFAULT_AFTER_LOGIN = "/dashboard";

/** Tujuan setelah masuk: `next` yang lolos penyaring, atau /dashboard. */
export function postLoginPath(value: unknown): string {
  const next = sanitizeNext(value);
  return next === FALLBACK ? DEFAULT_AFTER_LOGIN : next;
}

/** Alamat /login yang membawa `next` bila ada path asal yang sah. */
export function loginHref(value: unknown): string {
  const next = sanitizeNext(value);
  return next === FALLBACK
    ? "/login"
    : `/login?next=${encodeURIComponent(next)}`;
}
