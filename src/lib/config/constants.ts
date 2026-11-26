// Seluruh konstanta sistem (PRD Lampiran C). Berkas ini satu-satunya sumber
// batas, ambang, dan anggaran waktu (PRD Aturan 3 butir 4).

// Impor file dan dataset
/** Ukuran file maksimal dalam byte, 5 MB (F-02). */
export const MAX_FILE_BYTES = 5_242_880;
/** Jumlah baris data maksimal per dataset (F-05). */
export const MAX_ROWS = 5_000;
/** Jumlah baris maksimal pada tabel input manual di antarmuka (6.1 butir 4). */
export const MAX_MANUAL_ROWS_UI = 500;
/** Jumlah maksimal pesan kesalahan yang dikirim dan ditampilkan (F-06). */
export const MAX_ERRORS_SHOWN = 100;
/** Jumlah baris pratinjau data pada halaman impor. */
export const PREVIEW_ROWS = 5;
/** Rentang data maksimal dalam hari, dihitung sebagai N_hari (F-08, K-66). */
export const MAX_DAY_SPAN = 366;
/** Nominal transaksi maksimal dalam rupiah (V-09). */
export const MAX_AMOUNT = 999_999_999;
/** Saldo Kas Awal maksimal dalam rupiah (V-14, K-40). */
export const MAX_OPENING_BALANCE = 999_999_999;
/** Panjang maksimal Nama Transaksi (V-05). */
export const MAX_LABEL_LENGTH = 100;

// Engine
/** Hari pengeluaran unik minimal agar regresi dihitung (F-07, K-04). */
export const MIN_EXPENSE_DAYS = 3;
/** W-01 tampil bila D_max lebih dari sekian hari sebelum hari ini. */
export const STALE_DAYS = 14;
/** W-02 tampil bila N_hari kurang dari nilai ini. */
export const SHORT_PERIOD_DAYS = 28;
/** Cakrawala prediksi dan estimasi tanggal habis dalam hari (7.4, K-41). */
export const HORIZON_DAYS = 365;
/** Sisa hari minimal sebelum H_sisa ditambah bulan berikutnya (7.6, K-06). */
export const MIN_REMAINING_DAYS = 7;
/** η simulator dalam satuan persepuluhan (7.7, K-07). */
export const ETA_TENTHS = [0, 1, 3, 5] as const;
/** η yang ditampilkan di antarmuka. η = 0 hanya pembanding (K-32). */
export const ETA_TENTHS_DISPLAYED = [1, 3, 5] as const;
/** Panjang periode sisihan simulator dalam hari (7.7). */
export const SAVING_PERIOD_DAYS = 30;
/** Ambang SEHAT dalam persen: 5 × (I - E) ≥ I (7.2). */
export const HEALTHY_RATIO_PERCENT = 20;

// Direktori dan simulasi
/** Jumlah direktori maksimal per pengguna (K-28). */
export const MAX_DIRECTORIES_PER_USER = 10;
/** Panjang maksimal nama direktori (V-16). */
export const MAX_DIRECTORY_NAME_LENGTH = 100;
/** Panjang maksimal judul target simulasi. */
export const MAX_TARGET_TITLE_LENGTH = 60;

// AI (FR-07b)
/** Batas waktu satu panggilan Gemini dalam milidetik. */
export const AI_TIMEOUT_MS = 10_000;
/** Jumlah percobaan ulang panggilan Gemini. */
export const AI_MAX_RETRY = 2;
/** Anggaran waktu total ringkasan AI dalam milidetik. */
export const AI_TOTAL_BUDGET_MS = 25_000;
/** Jumlah label transaksi maksimal yang dikirim ke AI. */
export const AI_MAX_LABELS = 5;
/** Panjang maksimal setiap label yang dikirim ke AI. */
export const AI_LABEL_MAX_CHARS = 40;

// Versi dan waktu
/** Versi engine. Perbedaan dengan nilai tersimpan memicu hitung ulang (7.9). */
export const ENGINE_VERSION = "1.0.0";
/** Zona waktu acuan "hari ini" pada klien dan server (Aturan 3 butir 11). */
export const TIMEZONE = "Asia/Jakarta";
