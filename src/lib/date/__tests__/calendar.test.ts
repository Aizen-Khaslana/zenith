import { describe, expect, test } from "bun:test";

import {
  addDays,
  daysInMonth,
  diffDays,
  fromDayNumber,
  isValidIsoDate,
  jakartaToday,
  parseIsoDate,
  toDayNumber,
} from "../calendar";

// Aritmetika kalender murni atas teks YYYY-MM-DD (PRD Aturan 3 butir 5).

describe("isValidIsoDate", () => {
  test.each([
    "2026-11-01",
    "2026-11-30",
    "2026-12-31",
    "2028-02-29",
    "2000-02-29",
    "2026-01-01",
  ])("menerima %p", (value) => {
    expect(isValidIsoDate(value)).toBe(true);
  });

  test.each([
    "2026-02-29", // bukan tahun kabisat
    "1900-02-29", // kelipatan 100 bukan kabisat
    "2026-11-31",
    "2026-04-31",
    "2026-13-01",
    "2026-00-10",
    "2026-11-00",
    "0000-01-01",
    "2026-1-01",
    "2026-11-1",
    "26-11-01",
    "2026/11/01",
    "01/11/2026",
    "2026-11-01T00:00",
    " 2026-11-01",
    "",
  ])("menolak %p", (value) => {
    expect(isValidIsoDate(value)).toBe(false);
  });
});

describe("parseIsoDate", () => {
  test("memecah tanggal menjadi tahun, bulan, dan hari", () => {
    expect(parseIsoDate("2026-11-14")).toEqual({
      year: 2026,
      month: 11,
      day: 14,
    });
  });

  test("melempar galat untuk tanggal tidak valid", () => {
    expect(() => parseIsoDate("2026-02-30")).toThrow(RangeError);
  });
});

describe("daysInMonth", () => {
  test.each([
    [2026, 1, 31],
    [2026, 2, 28],
    [2028, 2, 29],
    [2000, 2, 29],
    [2100, 2, 28],
    [2026, 4, 30],
    [2026, 11, 30],
    [2026, 12, 31],
  ])("tahun %p bulan %p memiliki %p hari", (year, month, expected) => {
    expect(daysInMonth(year, month)).toBe(expected);
  });
});

describe("toDayNumber dan fromDayNumber", () => {
  test("1970-01-01 adalah hari ke-0", () => {
    expect(toDayNumber("1970-01-01")).toBe(0);
    expect(fromDayNumber(0)).toBe("1970-01-01");
  });

  test("tanggal sebelum 1970 bernilai negatif", () => {
    expect(toDayNumber("1969-12-31")).toBe(-1);
    expect(fromDayNumber(-1)).toBe("1969-12-31");
  });

  test("bolak-balik setiap hari selama empat tahun termasuk kabisat", () => {
    const start = toDayNumber("2026-01-01");
    for (let i = 0; i < 4 * 366; i++) {
      const iso = fromDayNumber(start + i);
      expect(isValidIsoDate(iso)).toBe(true);
      expect(toDayNumber(iso)).toBe(start + i);
    }
  });
});

describe("addDays", () => {
  test.each([
    ["2026-11-14", 5, "2026-11-19"], // D-01 tanggal habis
    ["2026-11-30", 5, "2026-12-05"], // D-09 melintasi bulan
    ["2026-11-14", 10, "2026-11-24"], // D-13 estimasi rata-rata
    ["2026-12-31", 1, "2027-01-01"], // melintasi tahun
    ["2028-02-28", 1, "2028-02-29"],
    ["2026-02-28", 1, "2026-03-01"],
    ["2026-11-14", 0, "2026-11-14"],
    ["2026-11-01", -1, "2026-10-31"],
    ["2026-11-14", 365, "2027-11-14"],
  ])("%p ditambah %p hari menjadi %p", (date, days, expected) => {
    expect(addDays(date, days)).toBe(expected);
  });
});

describe("diffDays", () => {
  test.each([
    ["2026-11-14", "2026-11-01", 13], // D-01: N_hari = 13 + 1
    ["2026-11-30", "2026-11-17", 13], // D-09
    ["2026-11-01", "2026-11-14", -13],
    ["2026-11-10", "2026-11-10", 0],
    ["2027-01-01", "2026-12-31", 1],
    ["2027-01-01", "2026-01-01", 365],
    ["2029-01-01", "2028-01-01", 366],
    ["2026-11-29", "2026-11-14", 15], // W-01 tepat lewat 14 hari
  ])("%p dikurangi %p adalah %p hari", (a, b, expected) => {
    expect(diffDays(a, b)).toBe(expected);
  });
});

describe("jakartaToday", () => {
  // Asia/Jakarta = UTC+7 sepanjang tahun. Jam tetap, bukan jam sistem.
  test.each([
    ["2026-11-26T16:59:59.999Z", "2026-11-26"],
    ["2026-11-26T17:00:00.000Z", "2026-11-27"],
    ["2026-11-26T17:30:00.000Z", "2026-11-27"],
    ["2026-11-26T00:00:00.000Z", "2026-11-26"],
    ["2026-12-31T17:00:00.000Z", "2027-01-01"],
    ["2028-02-28T17:00:00.000Z", "2028-02-29"],
  ])("instan %p adalah %p di Jakarta", (instant, expected) => {
    expect(jakartaToday(new Date(instant))).toBe(expected);
  });

  test("tidak bergantung zona waktu proses", () => {
    const original = process.env.TZ;
    try {
      for (const tz of ["UTC", "America/Los_Angeles", "Pacific/Kiritimati"]) {
        process.env.TZ = tz;
        expect(jakartaToday(new Date("2026-11-26T17:30:00.000Z"))).toBe(
          "2026-11-27",
        );
      }
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  test("menolak instan tidak valid", () => {
    expect(() => jakartaToday(new Date(Number.NaN))).toThrow(RangeError);
  });
});
