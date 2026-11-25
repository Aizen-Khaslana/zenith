import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/context";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
// TODO: hapus saat router pertama ditambahkan ke appRouter. Cast sementara ini
// hanya ada karena appRouter masih kosong pada WP-01, sehingga pemeriksaan
// generic createHydrationHelpers salah membaca AppRouter sebagai AnyRouter.
type HydrationCaller = Parameters<typeof createHydrationHelpers<AppRouter>>[0];
const caller = createCaller(createContext) as unknown as HydrationCaller;

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
