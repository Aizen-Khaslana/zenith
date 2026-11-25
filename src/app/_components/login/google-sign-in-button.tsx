"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { loginHref, postLoginPath } from "@/lib/auth/next-path";
import { authClient } from "@/server/better-auth/client";

type GoogleSignInButtonProps = {
  /** Path tujuan yang sudah disaring server. */
  nextPath: string;
};

export function GoogleSignInButton({ nextPath }: GoogleSignInButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    // Better Auth menambahkan &error=... pada errorCallbackURL sehingga /login
    // menampilkan A-01 dan `next` tetap terbawa (AC-06.9).
    const errorUrl = loginHref(nextPath);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: postLoginPath(nextPath),
      errorCallbackURL: errorUrl,
    });
    if (error) {
      const separator = errorUrl.includes("?") ? "&" : "?";
      window.location.assign(`${errorUrl}${separator}error=sign_in_failed`);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="border-border bg-card hover:bg-muted h-14 w-full gap-4 rounded-md text-sm font-semibold"
      onClick={handleClick}
      disabled={pending}
    >
      <Image src="/google.svg" alt="" width={18} height={18} unoptimized />
      {pending ? "Mengalihkan ke Google..." : "Masuk dengan Google"}
    </Button>
  );
}
