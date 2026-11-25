import { describe, expect, test } from "bun:test";

import { formatRupiah } from "../rupiah";

// PRD 5.1: format Rp1.337.000, negatif -Rp300.000. Pembulatan oleh pemanggil (7.8).
describe("formatRupiah", () => {
  test.each([
    [0, "Rp0"],
    [5, "Rp5"],
    [999, "Rp999"],
    [1000, "Rp1.000"],
    [38312, "Rp38.312"],
    [200000, "Rp200.000"],
    [1337000, "Rp1.337.000"],
    [999999999, "Rp999.999.999"],
    [1000000000, "Rp1.000.000.000"],
  ])("memformat %p menjadi %p", (value, expected) => {
    expect(formatRupiah(value)).toBe(expected);
  });

  test.each([
    [-1, "-Rp1"],
    [-300000, "-Rp300.000"],
    [-1337000, "-Rp1.337.000"],
  ])("memformat negatif %p menjadi %p", (value, expected) => {
    expect(formatRupiah(value)).toBe(expected);
  });

  test("nol negatif ditulis Rp0", () => {
    expect(formatRupiah(-0)).toBe("Rp0");
  });

  test.each([38312.5, Number.NaN, Number.POSITIVE_INFINITY, 2 ** 53])(
    "menolak nilai bukan bilangan bulat aman %p",
    (value) => {
      expect(() => formatRupiah(value)).toThrow(RangeError);
    },
  );
});
