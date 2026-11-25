import { NextResponse, type NextRequest } from "next/server";

/**
 * Menyalin path asal ke header `x-pathname` agar requireSession() dapat
 * membentuk /login?next=<path asal> (PRD 5.8, 10.4 butir 6). Tidak memeriksa
 * sesi: pemeriksaan dilakukan di server oleh layout dan setiap halaman (app).
 * Nilai dari klien selalu ditimpa, lalu tetap disaring oleh sanitizeNext.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/directories/:path*", "/settings/:path*"],
};
