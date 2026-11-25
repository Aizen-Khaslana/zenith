import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { loginHref } from "@/lib/auth/next-path";
import { getSession } from "./server";

/**
 * Pemeriksaan sesi untuk rute (app) (PRD 5.8, AC-UI.1, AC-06.1). Dipanggil di
 * layout (app) dan di setiap halaman, karena layout tidak dirender ulang pada
 * navigasi sisi klien. getSession() di-cache per permintaan.
 */
export async function requireSession() {
  const session = await getSession();
  if (session) return session;

  const requestHeaders = await headers();
  redirect(loginHref(requestHeaders.get("x-pathname")));
}
