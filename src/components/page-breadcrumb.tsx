"use client";

import { useSetBreadcrumbs, type BreadcrumbItem } from "@/hooks/use-breadcrumb";

type PageBreadcrumbProps = { items: BreadcrumbItem[] };

/** Mengisi konteks breadcrumb tanpa merender apa pun (PRD 5.8). */
export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  useSetBreadcrumbs(items);
  return null;
}
