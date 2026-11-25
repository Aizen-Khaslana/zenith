"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/feedback/error-state";

const LOAD_FAILED = "Data tidak dapat dimuat. Silakan coba lagi.";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState message={LOAD_FAILED} onRetry={reset} />;
}
