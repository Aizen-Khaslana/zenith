"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Persiapan dark mode. Sampai desain dark mode tersedia, tema dikunci terang
 * dan tidak mengikuti tema sistem operasi.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
