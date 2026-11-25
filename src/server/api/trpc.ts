/**
 * Inisialisasi tRPC (PRD Bagian 5.0 dan 6.5).
 *
 * Berkas ini tidak mengimpor koneksi database atau Better Auth global sehingga
 * dapat dipakai tes. Context dibuat di src/server/api/context.ts.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { type Session } from "@/server/better-auth/create-auth";
import { type Db } from "@/server/db/client";
import { INTERNAL_ERROR_MESSAGE, toAppErrorData } from "./errors";

export type TRPCContext = {
  db: Db;
  session: Session | null;
  headers: Headers;
};

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const internal = error.code === "INTERNAL_SERVER_ERROR";
    return {
      ...shape,
      message: internal ? INTERNAL_ERROR_MESSAGE : shape.message,
      data: {
        ...shape.data,
        stack: undefined,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
        ...toAppErrorData(error.cause),
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

/** Procedure tanpa syarat sesi. */
export const publicProcedure = t.procedure;

/**
 * Procedure yang mewajibkan sesi. Tanpa sesi menghasilkan UNAUTHORIZED.
 * Procedure yang menyentuh data pengguna wajib memakai ini lalu memeriksa
 * kepemilikan lewat getOwnedDirectory (src/server/api/ownership.ts).
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: { session: ctx.session, user: ctx.session.user },
  });
});
