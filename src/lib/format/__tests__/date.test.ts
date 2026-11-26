import { describe, expect, test } from "bun:test";

import { formatLongDate } from "../date";

// K-70: {D_max} pada W-01 ditampilkan seperti "14 November 2026",
// dihitung dari teks YYYY-MM-DD tanpa zona waktu perangkat.
describe("formatLongDate", () => {
  test.each([
    ["2026-01-05", "5 Januari 2026"],
    ["2026-02-28", "28 Februari 2026"],
    ["2026-03-01", "1 Maret 2026"],
    ["2026-04-30", "30 April 2026"],
    ["2026-05-01", "1 Mei 2026"],
    ["2026-06-15", "15 Juni 2026"],
    ["2026-07-17", "17 Juli 2026"],
    ["2026-08-17", "17 Agustus 2026"],
    ["2026-09-09", "9 September 2026"],
    ["2026-10-31", "31 Oktober 2026"],
    ["2026-11-14", "14 November 2026"],
    ["2026-12-05", "5 Desember 2026"],
    ["2028-02-29", "29 Februari 2028"],
  ])("memformat %p menjadi %p", (value, expected) => {
    expect(formatLongDate(value)).toBe(expected);
  });

  test("hasil sama pada zona waktu proses mana pun", () => {
    const original = process.env.TZ;
    try {
      for (const tz of ["UTC", "America/Los_Angeles", "Pacific/Kiritimati"]) {
        process.env.TZ = tz;
        expect(formatLongDate("2026-11-01")).toBe("1 November 2026");
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  test.each(["2026-02-30", "14/11/2026", ""])("menolak %p", (value) => {
    expect(() => formatLongDate(value)).toThrow(RangeError);
  });
});
