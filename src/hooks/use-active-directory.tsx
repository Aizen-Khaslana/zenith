"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { type ActiveDirectory } from "@/components/app-layout/nav-items";

// Direktori aktif untuk sidebar (Analisis-WP02 4.3). Sidebar berada di layout
// (app) sehingga tidak mengetahui [id]. Pada WP-02 nilainya selalu null.
// WP-04 mengisinya dari directories/[id]/layout.tsx lewat useSetActiveDirectory.

type ActiveDirectoryContextValue = {
  activeDirectory: ActiveDirectory | null;
  setActiveDirectory: (value: ActiveDirectory | null) => void;
};

const ActiveDirectoryContext =
  createContext<ActiveDirectoryContextValue | null>(null);

export function ActiveDirectoryProvider({ children }: { children: ReactNode }) {
  const [activeDirectory, setActiveDirectory] =
    useState<ActiveDirectory | null>(null);
  const value = useMemo(
    () => ({ activeDirectory, setActiveDirectory }),
    [activeDirectory],
  );
  return (
    <ActiveDirectoryContext.Provider value={value}>
      {children}
    </ActiveDirectoryContext.Provider>
  );
}

export function useActiveDirectory(): ActiveDirectoryContextValue {
  const context = useContext(ActiveDirectoryContext);
  if (!context) {
    throw new Error(
      "useActiveDirectory harus dipakai di dalam ActiveDirectoryProvider",
    );
  }
  return context;
}

/** Menetapkan direktori aktif selama komponen terpasang. */
export function useSetActiveDirectory(value: ActiveDirectory | null) {
  const { setActiveDirectory } = useActiveDirectory();
  const key = JSON.stringify(value);
  useEffect(() => {
    setActiveDirectory(JSON.parse(key) as ActiveDirectory | null);
    return () => setActiveDirectory(null);
  }, [key, setActiveDirectory]);
}
