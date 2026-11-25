import { describe, expect, test } from "bun:test";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { type Session } from "@/server/better-auth/create-auth";
import { type Db } from "@/server/db/client";
import { AppValidationError } from "../errors";
import {
  createCallerFactory,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  type TRPCContext,
} from "../trpc";

// Router uji lokal (bukan procedure produksi).
const testRouter = createTRPCRouter({
  ping: publicProcedure.query(() => "pong"),
  whoami: protectedProcedure.query(({ ctx }) => ctx.user.id),
  echo: publicProcedure
    .input(z.object({ n: z.number().int() }))
    .query(({ input }) => input.n),
  failValidation: publicProcedure.mutation(() => {
    throw new TRPCError({
      code: "BAD_REQUEST",
      cause: new AppValidationError([
        { row: 2, code: "V-01", message: "contoh" },
      ]),
    });
  }),
  crash: publicProcedure.mutation(() => {
    throw new Error("detail internal rahasia");
  }),
});

const createCaller = createCallerFactory(testRouter);

// db tidak dipakai router uji, sehingga tidak ada koneksi database.
const ctx = (session: Session | null): TRPCContext => ({
  db: {} as Db,
  session,
  headers: new Headers(),
});

const fakeSession = {
  session: { id: "s1", userId: "u1" },
  user: { id: "u1", name: "A", email: "a@example.com" },
} as unknown as Session;

async function caught(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (e) {
    return e;
  }
  throw new Error("Diharapkan galat");
}

describe("procedure", () => {
  test("protectedProcedure tanpa sesi menghasilkan UNAUTHORIZED", async () => {
    const e = await caught(() => createCaller(ctx(null)).whoami());
    expect(e).toBeInstanceOf(TRPCError);
    expect((e as TRPCError).code).toBe("UNAUTHORIZED");
  });

  test("protectedProcedure dengan sesi meneruskan user", async () => {
    expect(await createCaller(ctx(fakeSession)).whoami()).toBe("u1");
  });

  test("publicProcedure tanpa sesi berhasil", async () => {
    expect(await createCaller(ctx(null)).ping()).toBe("pong");
  });
});

describe("errorFormatter (PRD 6.5)", () => {
  // createCaller tidak menjalankan errorFormatter, jadi diuji lewat handler HTTP.
  async function call(path: string, method: "GET" | "POST", input?: unknown) {
    const { fetchRequestHandler } = await import(
      "@trpc/server/adapters/fetch"
    );
    const superjson = (await import("superjson")).default;
    const encoded = encodeURIComponent(
      JSON.stringify(superjson.serialize(input)),
    );
    const url =
      method === "GET"
        ? `http://localhost/api/trpc/${path}?input=${encoded}`
        : `http://localhost/api/trpc/${path}`;
    const res = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(url, {
        method,
        headers: { "content-type": "application/json" },
        body:
          method === "POST"
            ? JSON.stringify(superjson.serialize(input))
            : undefined,
      }),
      router: testRouter,
      createContext: () => ctx(null),
    });
    const body = (await res.json()) as {
      error: { json: { message: string; data: Record<string, unknown> } };
    };
    return { status: res.status, error: body.error.json };
  }

  test("UNAUTHORIZED lewat HTTP berstatus 401", async () => {
    const r = await call("whoami", "GET");
    expect(r.status).toBe(401);
    expect(r.error.data.code).toBe("UNAUTHORIZED");
  });

  test("AppValidationError masuk ke data.errors dan data.totalErrors", async () => {
    const r = await call("failValidation", "POST");
    expect(r.status).toBe(400);
    expect(r.error.data.errors).toEqual([
      { row: 2, code: "V-01", message: "contoh" },
    ]);
    expect(r.error.data.totalErrors).toBe(1);
  });

  test("input tidak valid menghasilkan BAD_REQUEST dengan zodError", async () => {
    const r = await call("echo", "GET", { n: 1.5 });
    expect(r.status).toBe(400);
    expect(r.error.data.zodError).not.toBeNull();
  });

  test("kesalahan tak terduga tidak membocorkan detail internal", async () => {
    const r = await call("crash", "POST");
    expect(r.status).toBe(500);
    expect(r.error.data.code).toBe("INTERNAL_SERVER_ERROR");
    expect(r.error.data.stack ?? null).toBeNull();
    expect(JSON.stringify(r.error)).not.toContain("rahasia");
  });
});
