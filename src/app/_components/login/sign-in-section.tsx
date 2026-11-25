import { CheckIcon, CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AUTH_MESSAGES } from "@/lib/messages";
import { GoogleSignInButton } from "./google-sign-in-button";

const FEATURES = [
  "Analisis dari unggahan Excel atau CSV",
  "Prediksi berbasis perhitungan deterministik",
  "Narasi AI untuk menjelaskan hasil analisis",
] as const;

// Pemisah baris yang hanya berlaku pada layar lebar (sesuai desain 01).
function WideBreak() {
  return <br className="hidden lg:inline" />;
}

type SignInSectionProps = {
  nextPath: string;
  hasError: boolean;
};

export function SignInSection({ nextPath, hasError }: SignInSectionProps) {
  return (
    <section className="bg-card text-card-foreground flex items-center px-6 py-10 sm:px-12 lg:min-h-screen lg:px-[88px] lg:py-16">
      <div className="flex w-full max-w-[574px] flex-col gap-6">
        <p className="text-brand-accent-strong text-[11px]/4 font-semibold uppercase">
          Selamat datang di Zenith
        </p>
        <h2 className="text-[28px]/9 font-semibold lg:text-[34px]/[49px]">
          Langkah pertama menuju
          <WideBreak /> finansial yang lebih sehat.
        </h2>
        <p className="text-muted-foreground text-[15px]/[22px]">
          Masuk untuk mengubah data transaksi menjadi
          <WideBreak /> wawasan yang bisa Anda tindak lanjuti.
        </p>

        {hasError ? (
          <Alert variant="destructive" role="alert">
            <CircleAlertIcon />
            <AlertDescription>{AUTH_MESSAGES["A-01"]}</AlertDescription>
          </Alert>
        ) : null}

        <GoogleSignInButton nextPath={nextPath} />

        <p className="text-muted-foreground text-xs/[17px]">
          Akun Google Anda digunakan untuk identitas masuk.
          <WideBreak /> Tidak ada akses ke rekening bank Anda.
        </p>

        <div className="bg-background border-border flex flex-col rounded-xl border p-6 lg:h-[179px]">
          <h3 className="text-base/6 font-semibold">
            Satu tempat untuk memahami keuangan
          </h3>
          <ul className="text-muted-foreground mt-3 flex flex-col text-[13px]/[19px]">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <CheckIcon className="size-3 shrink-0" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* K-48: ditampilkan sebagai teks tanpa tautan. */}
        <p className="text-muted-foreground text-[11px]/4">
          Dengan masuk, Anda menyetujui Ketentuan Layanan
          <WideBreak /> dan Kebijakan Privasi Zenith.
        </p>
      </div>
    </section>
  );
}
