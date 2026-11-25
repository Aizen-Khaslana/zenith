import Image from "next/image";

import { APP_LABEL } from "@/components/app-layout/nav-items";
import { formatRupiah } from "@/lib/format/rupiah";

// Nilai ilustrasi statis sesuai desain 01 (K-49), bukan data pengguna.
const ILLUSTRATION_BALANCE = 613000;

// Pemisah baris yang hanya berlaku pada layar lebar (sesuai desain 01).
function WideBreak() {
  return <br className="hidden lg:inline" />;
}

export function HeroSection() {
  return (
    <section className="bg-primary text-primary-foreground flex flex-col px-6 py-10 sm:px-12 lg:min-h-screen lg:p-16">
      <div className="flex items-center gap-3.5">
        <Image
          src="/logo-zenith.svg"
          alt=""
          width={46}
          height={46}
          unoptimized
          priority
        />
        <span className="text-[28px]/[34px] font-bold">Zenith.</span>
      </div>

      <p className="text-panel-muted-foreground mt-10 text-[11px]/4 font-semibold uppercase lg:mt-11.5">
        {APP_LABEL}
      </p>
      <h1 className="mt-6 text-4xl/[1.3] font-semibold lg:mt-8.5 lg:text-[52px]/[77px]">
        Kenali uangmu.
        <WideBreak /> Kendalikan
        <WideBreak /> masa depanmu.
      </h1>
      <p className="text-panel-muted-foreground mt-6 text-base lg:mt-7.5 lg:text-[17px]/[25px]">
        Pahami kesehatan arus kas, prediksi daya tahan saldo, dan
        <WideBreak /> ambil keputusan finansial dengan lebih tenang.
      </p>

      <div
        aria-hidden="true"
        className="bg-panel text-panel-foreground border-panel-border mt-8 flex w-full flex-col rounded-xl border p-6 lg:h-[279px] lg:w-[560px]"
      >
        <p className="text-panel-muted-foreground text-[10px]/4 font-semibold uppercase">
          Kesehatan finansial Anda
        </p>
        <div className="mt-3 flex flex-wrap items-start gap-6">
          <span className="mt-0.75 text-[36px]/[44px] font-semibold">
            {formatRupiah(ILLUSTRATION_BALANCE)}
          </span>
          <span className="bg-status-sehat-soft text-status-sehat inline-flex h-7 items-center gap-1.5 rounded-full px-4 text-xs font-semibold">
            <span className="bg-status-sehat size-2 rounded-full" />
            SEHAT
          </span>
        </div>
        <p className="text-panel-muted-foreground mt-4.75 text-xs/4">
          Saldo saat ini · 1 sampai 14 November 2026
        </p>
        <div className="mt-3.25 flex gap-1">
          <span className="bg-chart-1 h-3 flex-[174] rounded-full" />
          <span className="bg-chart-2 h-3 flex-[79] rounded-full" />
          <span className="bg-brand-accent h-3 flex-[251] rounded-full" />
        </div>
        <p className="mt-4.5 text-[13px]/[18px]">
          Lebih jelas melihat kondisi. Lebih siap melangkah.
        </p>
      </div>

      <p className="text-panel-muted-foreground mt-8.5 text-xs/4">
        Dirancang untuk perjalanan finansial mahasiswa.
      </p>
    </section>
  );
}
