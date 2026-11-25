"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Pola konteks breadcrumb (PRD 5.8): halaman mengisi, header merender.

export type BreadcrumbItem = { title: string; href?: string };

type BreadcrumbContextValue = {
  items: BreadcrumbItem[];
  setItems: (items: BreadcrumbItem[]) => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BreadcrumbItem[]>([]);
  const value = useMemo(() => ({ items, setItems }), [items]);
  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb(): BreadcrumbContextValue {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error("useBreadcrumb harus dipakai di dalam BreadcrumbProvider");
  }
  return context;
}

/**
 * Mengisi breadcrumb selama komponen terpasang dan mengosongkannya saat
 * dilepas. Efek bergantung pada isi item, bukan identitas array, sehingga
 * array baru dengan isi sama tidak memicu pembaruan.
 */
export function useSetBreadcrumbs(items: BreadcrumbItem[]) {
  const { setItems } = useBreadcrumb();
  const key = JSON.stringify(items);
  useEffect(() => {
    setItems(JSON.parse(key) as BreadcrumbItem[]);
    return () => setItems([]);
  }, [key, setItems]);
}
