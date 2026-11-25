// Bentuk data kesalahan tRPC (PRD Bagian 6.5). Tanpa impor db, auth, atau env.
import { MAX_ERRORS_SHOWN } from "@/lib/config/constants";

export type AppErrorItem = { row: number; code: string; message: string };

/** Ditambahkan ke `error.data` melalui errorFormatter di src/server/api/trpc.ts. */
export type AppErrorData = {
  errors?: AppErrorItem[];
  totalErrors?: number;
};

/**
 * Dilempar sebagai `cause` TRPCError BAD_REQUEST. Hanya MAX_ERRORS_SHOWN
 * pesan pertama yang disimpan, beserta jumlah total (D1).
 */
export class AppValidationError extends Error {
  readonly errors: AppErrorItem[];
  readonly totalErrors: number;

  constructor(all: readonly AppErrorItem[]) {
    super("Validasi gagal");
    this.name = "AppValidationError";
    this.errors = all.slice(0, MAX_ERRORS_SHOWN);
    this.totalErrors = all.length;
  }
}

/** Mengubah `cause` menjadi AppErrorData. Cause lain menghasilkan objek kosong. */
export function toAppErrorData(cause: unknown): AppErrorData {
  if (cause instanceof AppValidationError) {
    return { errors: cause.errors, totalErrors: cause.totalErrors };
  }
  return {};
}

/** Pesan umum untuk INTERNAL_SERVER_ERROR, tanpa detail internal (6.5). */
export const INTERNAL_ERROR_MESSAGE = "Terjadi kesalahan pada server.";
