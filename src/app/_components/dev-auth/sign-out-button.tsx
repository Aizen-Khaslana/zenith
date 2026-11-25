"use client";

// Sementara untuk uji login WP-01. Keluar yang final ada pada WP-02 (AC-06.10).
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/server/better-auth/client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await authClient.signOut();
    window.location.assign("/login");
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? "Memproses..." : "Keluar"}
    </Button>
  );
}
