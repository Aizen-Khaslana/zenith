import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * Router utama. Router fitur (directory, dataset, simulation, narrative,
 * account) di src/server/api/routers/ ditambahkan pada WP masing-masing.
 */
export const appRouter = createTRPCRouter({});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
