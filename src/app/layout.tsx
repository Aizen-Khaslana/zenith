import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Zenith",
  description: "Pengecekan kesehatan cashflow mahasiswa",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Satu-satunya tempat nama font ditulis di luar globals.css (PRD 5.8).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <TRPCReactProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
