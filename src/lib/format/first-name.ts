/** Kata pertama dari nama sesi, atau null bila nama kosong. */
export function firstName(name: string): string | null {
  const [first] = name.trim().split(/\s+/);
  // "".split(...) menghasilkan [""], sehingga string kosong diperiksa eksplisit.
  if (!first) return null;
  return first;
}
