import { describe, expect, test } from "bun:test";

import * as constants from "../constants";

// PRD Lampiran C. Setiap konstanta wajib ada dengan nilai persis seperti tabel.
const LAMPIRAN_C = {
  MAX_FILE_BYTES: 5_242_880,
  MAX_ROWS: 5_000,
  MAX_MANUAL_ROWS_UI: 500,
  MAX_ERRORS_SHOWN: 100,
  PREVIEW_ROWS: 5,
  MAX_DAY_SPAN: 366,
  MAX_AMOUNT: 999_999_999,
  MAX_OPENING_BALANCE: 999_999_999,
  MAX_LABEL_LENGTH: 100,
  MIN_EXPENSE_DAYS: 3,
  STALE_DAYS: 14,
  SHORT_PERIOD_DAYS: 28,
  HORIZON_DAYS: 365,
  MIN_REMAINING_DAYS: 7,
  ETA_TENTHS: [0, 1, 3, 5],
  ETA_TENTHS_DISPLAYED: [1, 3, 5],
  SAVING_PERIOD_DAYS: 30,
  HEALTHY_RATIO_PERCENT: 20,
  MAX_DIRECTORIES_PER_USER: 10,
  MAX_DIRECTORY_NAME_LENGTH: 100,
  MAX_TARGET_TITLE_LENGTH: 60,
  AI_TIMEOUT_MS: 10_000,
  AI_MAX_RETRY: 2,
  AI_TOTAL_BUDGET_MS: 25_000,
  AI_MAX_LABELS: 5,
  AI_LABEL_MAX_CHARS: 40,
  ENGINE_VERSION: "1.0.0",
  TIMEZONE: "Asia/Jakarta",
} as const;

describe("konstanta Lampiran C", () => {
  test.each(Object.entries(LAMPIRAN_C))(
    "%s sesuai Lampiran C",
    (name, value) => {
      expect(constants).toHaveProperty(name);
      expect(constants[name as keyof typeof constants]).toEqual(value);
    },
  );

  test("tidak ada konstanta di luar Lampiran C", () => {
    expect(Object.keys(constants).sort()).toEqual(
      Object.keys(LAMPIRAN_C).sort(),
    );
  });

  test("skenario yang ditampilkan adalah bagian dari skenario engine", () => {
    for (const k of constants.ETA_TENTHS_DISPLAYED) {
      expect(constants.ETA_TENTHS).toContain(k);
    }
  });
});
