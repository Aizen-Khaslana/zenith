import { describe, expect, test } from "bun:test";

import { buildNavItems, findActiveHref, flattenNavHrefs } from "../nav-items";

const dir = { id: "dir-1", name: "Rencana Gacha", hasData: true };

// PRD 5.8 Sidebar dan AC-UI.2.
describe("buildNavItems", () => {
  test("di luar direktori: tiga item tetap dan tanpa grup direktori", () => {
    const nav = buildNavItems(null);
    expect(nav.main.map((i) => [i.title, i.href])).toEqual([
      ["Dashboard", "/dashboard"],
      ["Direktori Data", "/directories"],
    ]);
    expect(nav.directory).toBeNull();
    expect(nav.help.title).toBe("Pusat bantuan");
    expect(nav.help.items.map((i) => [i.title, i.href])).toEqual([
      ["Panduan penggunaan", "#"],
      ["Pengaturan", "/settings"],
    ]);
    const fixed = [...nav.main, ...nav.help.items].filter(
      (i) => i.href !== "#",
    );
    expect(fixed).toHaveLength(3);
  });

  test("direktori dengan hasData benar menambah tiga item direktori", () => {
    const nav = buildNavItems(dir);
    expect(nav.directory?.title).toBe("Rencana Gacha");
    expect(nav.directory?.items.map((i) => [i.title, i.href])).toEqual([
      ["Analisis Keuangan", "/directories/dir-1/analysis"],
      ["Runway dan Prediksi", "/directories/dir-1/runway"],
      ["Simulasi Skenario", "/directories/dir-1/simulation"],
    ]);
    expect(nav.main).toHaveLength(2);
  });

  test("direktori dengan hasData salah tidak menambah item", () => {
    expect(buildNavItems({ ...dir, hasData: false }).directory).toBeNull();
  });

  test("id direktori di-encode pada href", () => {
    const nav = buildNavItems({ ...dir, id: "a/b c" });
    expect(nav.directory?.items[0]?.href).toBe(
      "/directories/a%2Fb%20c/analysis",
    );
  });

  test("Panduan penggunaan tidak ikut pencocokan item aktif", () => {
    expect(flattenNavHrefs(buildNavItems(null))).not.toContain("#");
  });
});

describe("findActiveHref", () => {
  const outside = flattenNavHrefs(buildNavItems(null));
  const inside = flattenNavHrefs(buildNavItems(dir));

  test.each([
    ["/dashboard", "/dashboard"],
    ["/directories", "/directories"],
    ["/settings", "/settings"],
    ["/directories/dir-1/import", "/directories"],
  ])("di luar direktori %p menandai %p", (pathname, expected) => {
    expect(findActiveHref(pathname, outside)).toBe(expected);
  });

  test.each([
    ["/directories/dir-1/analysis", "/directories/dir-1/analysis"],
    ["/directories/dir-1/runway", "/directories/dir-1/runway"],
    ["/directories/dir-1/simulation/x", "/directories/dir-1/simulation"],
    ["/directories/dir-1/import", "/directories"],
  ])("di dalam direktori %p hanya menandai %p", (pathname, expected) => {
    expect(findActiveHref(pathname, inside)).toBe(expected);
  });

  test("awalan harus berhenti di batas segmen", () => {
    expect(findActiveHref("/dashboards", outside)).toBeNull();
    expect(findActiveHref("/settings-lain", outside)).toBeNull();
  });

  test("garis miring di akhir diabaikan", () => {
    expect(findActiveHref("/settings/", outside)).toBe("/settings");
  });

  test("rute tanpa item menghasilkan null", () => {
    expect(findActiveHref("/login", outside)).toBeNull();
    expect(findActiveHref("/", outside)).toBeNull();
  });
});
