// Halaman login sementara untuk WP-01. Tampilan final dibuat pada WP-02.
import { redirect } from "next/navigation";

import { AUTH_MESSAGES } from "@/lib/messages";
import { getSession } from "@/server/better-auth/server";
import { GoogleSignInButton } from "./google-sign-in-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const session = await getSession();
  if (session) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Zenith</h1>
          <p className="text-muted-foreground text-sm">
            Masuk untuk memeriksa kesehatan cashflow Anda.
          </p>
        </div>
        {error ? (
          <p
            role="alert"
            className="bg-destructive/10 text-destructive w-full rounded-lg px-4 py-3 text-sm"
          >
            {AUTH_MESSAGES["A-01"]}
          </p>
        ) : null}
        <GoogleSignInButton />
      </div>
    </main>
  );
}
