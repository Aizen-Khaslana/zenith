import { describe, expect, test } from "bun:test";

import { firstName } from "../first-name";

// Sapaan Dashboard memakai nama depan dari sesi ("Halo, Nadia.").
describe("firstName", () => {
  test.each([
    ["Nadia Putri", "Nadia"],
    ["Nadia", "Nadia"],
    ["  Nadia   Putri  ", "Nadia"],
    ["Nadia\tPutri", "Nadia"],
    ["Muhammad Al Fatih", "Muhammad"],
  ])("%p menjadi %p", (name, expected) => {
    expect(firstName(name)).toBe(expected);
  });

  test.each([[""], ["   "]])("nama kosong %p menghasilkan null", (name) => {
    expect(firstName(name)).toBeNull();
  });
});
