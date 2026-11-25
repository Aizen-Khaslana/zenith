"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect } from "react";

import { ErrorState } from "@/components/feedback/error-state";

const LOAD_FAILED = "Data tidak dapat dimuat. Silakan coba lagi.";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  // reset() saja hanya merender ulang di klien. Galat dari Server Component
  // perlu router.refresh() agar data server diambil ulang, dalam satu transisi.
  function handleRetry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return <ErrorState message={LOAD_FAILED} onRetry={handleRetry} />;
}
