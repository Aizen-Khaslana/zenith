// Aritmetika kalender murni atas teks YYYY-MM-DD (PRD Aturan 3 butir 5).
// Tidak memakai objek Date untuk menghitung tanggal, sehingga hasil tidak
// bergantung zona waktu perangkat. Kalender Gregorian proleptik.

import { TIMEZONE } from "@/lib/config/constants";

export type CalendarDate = { year: number; month: number; day: number };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// Fakta kalender, bukan konfigurasi.
const MONTHS_PER_YEAR = 12;
const FEBRUARY = 2;
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;
const LEAP_DAY = 29;
const LEAP_CYCLE_YEARS = 4;
const CENTURY_YEARS = 100;
const YEARS_PER_ERA = 400; // satu siklus penuh kalender Gregorian
const DAYS_PER_YEAR = 365;
const DAYS_PER_ERA = 146_097;
const DAYS_PER_LEAP_CYCLE = 1_461;
const DAYS_PER_CENTURY = 36_524;
const YEAR_WIDTH = 4;
const MONTH_DAY_WIDTH = 2;
// Selisih hari antara 0000-03-01 dan 1970-01-01 (algoritme civil from days).
const EPOCH_SHIFT = 719_468;
// Bulan dihitung mulai Maret agar hari kabisat berada di akhir tahun.
const MARCH_BASED_OFFSET = 3;
const MARCH_BASED_DAYS_NUM = 153;
const MARCH_BASED_DAYS_ADD = 2;
const MARCH_BASED_DAYS_DEN = 5;

function isLeapYear(year: number): boolean {
  return (
    (year % LEAP_CYCLE_YEARS === 0 && year % CENTURY_YEARS !== 0) ||
    year % YEARS_PER_ERA === 0
  );
}

export function daysInMonth(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > MONTHS_PER_YEAR) {
    throw new RangeError(`Bulan tidak valid: ${month}`);
  }
  if (month === FEBRUARY && isLeapYear(year)) return LEAP_DAY;
  return DAYS_IN_MONTH[month - 1]!;
}

function tryParse(value: string): CalendarDate | null {
  const match = ISO_DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1 || month < 1 || month > MONTHS_PER_YEAR || day < 1) return null;
  if (day > daysInMonth(year, month)) return null;
  return { year, month, day };
}

/** Benar bila teks berbentuk YYYY-MM-DD dan tanggalnya ada di kalender. */
export function isValidIsoDate(value: string): boolean {
  return tryParse(value) !== null;
}

export function parseIsoDate(value: string): CalendarDate {
  const parsed = tryParse(value);
  if (!parsed) throw new RangeError(`Tanggal tidak valid: "${value}"`);
  return parsed;
}

function pad(value: number, width: number): string {
  return value.toString().padStart(width, "0");
}

export function formatIsoDate({ year, month, day }: CalendarDate): string {
  return `${pad(year, YEAR_WIDTH)}-${pad(month, MONTH_DAY_WIDTH)}-${pad(day, MONTH_DAY_WIDTH)}`;
}

/** Nomor hari sejak 1970-01-01 (hari ke-0). */
export function toDayNumber(value: string): number {
  const { year, month, day } = parseIsoDate(value);
  const y = month <= FEBRUARY ? year - 1 : year;
  const era = Math.floor(y / YEARS_PER_ERA);
  const yearOfEra = y - era * YEARS_PER_ERA;
  const marchMonth =
    (month + MONTHS_PER_YEAR - MARCH_BASED_OFFSET) % MONTHS_PER_YEAR;
  const dayOfYear =
    Math.floor(
      (MARCH_BASED_DAYS_NUM * marchMonth + MARCH_BASED_DAYS_ADD) /
        MARCH_BASED_DAYS_DEN,
    ) +
    day -
    1;
  const dayOfEra =
    yearOfEra * DAYS_PER_YEAR +
    Math.floor(yearOfEra / LEAP_CYCLE_YEARS) -
    Math.floor(yearOfEra / CENTURY_YEARS) +
    dayOfYear;
  return era * DAYS_PER_ERA + dayOfEra - EPOCH_SHIFT;
}

/** Kebalikan toDayNumber. */
export function fromDayNumber(dayNumber: number): string {
  if (!Number.isSafeInteger(dayNumber)) {
    throw new RangeError(`Nomor hari harus bilangan bulat: ${dayNumber}`);
  }
  const z = dayNumber + EPOCH_SHIFT;
  const era = Math.floor(z / DAYS_PER_ERA);
  const dayOfEra = z - era * DAYS_PER_ERA;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / (DAYS_PER_LEAP_CYCLE - 1)) +
      Math.floor(dayOfEra / DAYS_PER_CENTURY) -
      Math.floor(dayOfEra / (DAYS_PER_ERA - 1))) /
      DAYS_PER_YEAR,
  );
  const dayOfYear =
    dayOfEra -
    (DAYS_PER_YEAR * yearOfEra +
      Math.floor(yearOfEra / LEAP_CYCLE_YEARS) -
      Math.floor(yearOfEra / CENTURY_YEARS));
  const marchMonth = Math.floor(
    (MARCH_BASED_DAYS_DEN * dayOfYear + MARCH_BASED_DAYS_ADD) /
      MARCH_BASED_DAYS_NUM,
  );
  const day =
    dayOfYear -
    Math.floor(
      (MARCH_BASED_DAYS_NUM * marchMonth + MARCH_BASED_DAYS_ADD) /
        MARCH_BASED_DAYS_DEN,
    ) +
    1;
  const month =
    marchMonth < MONTHS_PER_YEAR - MARCH_BASED_OFFSET + 1
      ? marchMonth + MARCH_BASED_OFFSET
      : marchMonth + MARCH_BASED_OFFSET - MONTHS_PER_YEAR;
  const year = yearOfEra + era * YEARS_PER_ERA + (month <= FEBRUARY ? 1 : 0);
  return formatIsoDate({ year, month, day });
}

export function addDays(value: string, days: number): string {
  return fromDayNumber(toDayNumber(value) + days);
}

/** Jumlah hari dari b ke a (a - b). */
export function diffDays(a: string, b: string): number {
  return toDayNumber(a) - toDayNumber(b);
}

const jakartaFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Tanggal kalender pada zona Asia/Jakarta untuk instan yang diberikan.
 * Instan selalu parameter (jam tetap pada tes), bukan jam sistem.
 */
export function jakartaToday(instant: Date): string {
  if (Number.isNaN(instant.getTime())) {
    throw new RangeError("Instan waktu tidak valid");
  }
  const parts = jakartaFormatter.formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return formatIsoDate({
    year: get("year"),
    month: get("month"),
    day: get("day"),
  });
}
