import { describe, expect, test } from "bun:test";

import { MAX_ERRORS_SHOWN } from "@/lib/config/constants";
import { AppValidationError, toAppErrorData } from "../errors";

const make = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    row: i + 2,
    code: "V-01",
    message: `baris ${i + 2}`,
  }));

describe("AppValidationError", () => {
  test("memotong ke MAX_ERRORS_SHOWN dan menyimpan jumlah total", () => {
    const total = MAX_ERRORS_SHOWN + 50;
    const e = new AppValidationError(make(total));
    expect(e.errors.length).toBe(MAX_ERRORS_SHOWN);
    expect(e.totalErrors).toBe(total);
    expect(e.errors[0]?.row).toBe(2);
  });

  test("di bawah batas tidak dipotong", () => {
    const e = new AppValidationError(make(3));
    expect(e.errors.length).toBe(3);
    expect(e.totalErrors).toBe(3);
  });
});

describe("toAppErrorData", () => {
  test("AppValidationError menjadi errors dan totalErrors", () => {
    const data = toAppErrorData(new AppValidationError(make(1)));
    expect(data.totalErrors).toBe(1);
    expect(data.errors?.length).toBe(1);
  });

  test("cause lain menghasilkan objek kosong", () => {
    expect(toAppErrorData(new Error("x"))).toEqual({});
    expect(toAppErrorData(undefined)).toEqual({});
  });
});
