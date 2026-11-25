"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/server/better-auth/client";

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      // Better Auth menambahkan ?error=... sehingga /login menampilkan A-01.
      errorCallbackURL: "/login",
    });
    if (error) {
      window.location.assign("/login?error=sign_in_failed");
    }
  }

  return (
    <Button size="lg" onClick={handleClick} disabled={pending}>
      {pending ? "Mengalihkan ke Google..." : "Masuk dengan Google"}
    </Button>
  );
}
