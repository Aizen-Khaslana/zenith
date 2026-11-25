import { describe, expect, test } from "bun:test";

import { sanitizeNext } from "../next-path";

// PRD 5.8, K-24, dan 10.4 butir 7 (backslash dan karakter kontrol ditolak).
describe("sanitizeNext", () => {
  test.each([
    "/",
    "/dashboard",
    "/settings",
    "/directories/abc/import",
    "/dashboard?dir=abc",
    "/directories/abc?tab=manual#bagian",
  ])("menerima path internal %p apa adanya", (value) => {
    expect(sanitizeNext(value)).toBe(value);
  });

  test.each([
    ["diawali //", "//evil.com"],
    ["diawali // dengan path", "//evil.com/dashboard"],
    ["URL absolut https", "https://evil.com"],
    ["URL absolut http", "http://evil.com/dashboard"],
    ["skema javascript", "javascript:alert(1)"],
    ["tanpa garis miring awal", "dashboard"],
    ["string kosong", ""],
    ["diawali backslash", "\\evil.com"],
    ["garis miring lalu backslash", "/\\evil.com"],
    ["backslash di tengah", "/dashboard\\..\\x"],
    ["tab", "/\tevil.com"],
    ["baris baru", "/dashboard\n"],
    ["carriage return", "/dashboard\r"],
    ["karakter null", "/dashboard\u0000"],
    ["karakter kontrol U+001F", "/\u001fevil"],
  ])("mengganti %s dengan /", (_label, value) => {
    expect(sanitizeNext(value)).toBe("/");
  });

  // Setiap kasus dibungkus tuple karena test.each menyebarkan elemen array.
  test.each([
    [undefined],
    [null],
    [1],
    [["/dashboard"]],
    [{ path: "/dashboard" }],
  ])("mengganti nilai bukan string %p dengan /", (value) => {
    expect(sanitizeNext(value)).toBe("/");
  });
});
