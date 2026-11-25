// Format nominal rupiah (PRD 5.1): Rp1.337.000 dan -Rp300.000.
// Masukan wajib bilangan bulat. Pembulatan dilakukan pemanggil (PRD 7.8).
// Tidak memakai Intl agar hasil sama di server dan browser apa pun lokalnya.

const THOUSANDS_SEPARATOR = ".";
const DIGIT_GROUP = /\B(?=(\d{3})+(?!\d))/g;

export function formatRupiah(value: number): string {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`Nominal rupiah harus bilangan bulat: ${value}`);
  }
  const digits = Math.abs(value)
    .toString()
    .replace(DIGIT_GROUP, THOUSANDS_SEPARATOR);
  return value < 0 ? `-Rp${digits}` : `Rp${digits}`;
}
