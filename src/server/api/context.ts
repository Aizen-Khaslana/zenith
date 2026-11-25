import "server-only";

import { auth } from "@/server/better-auth";
import { db } from "@/server/db";
import { type TRPCContext } from "./trpc";

/**
 * Context tRPC untuk route handler dan pemanggil Server Component.
 * @see https://trpc.io/docs/server/context
 */
export async function createTRPCContext(opts: {
  headers: Headers;
}): Promise<TRPCContext> {
  const session = await auth.api.getSession({ headers: opts.headers });
  return { db, session, headers: opts.headers };
}
