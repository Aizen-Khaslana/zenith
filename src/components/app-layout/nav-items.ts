// Penyusun menu sidebar (PRD 5.8 Sidebar, AC-UI.2). Fungsi murni: tanpa React,
// ikon, atau Next.js. Ikon dipetakan dari `icon` oleh nav-main.

export type NavIcon =
  | "dashboard"
  | "directories"
  | "analysis"
  | "runway"
  | "simulation"
  | "guide"
  | "settings";

export type NavItem = {
  title: string;
  href: string;
  icon: NavIcon;
  /** Tautan bukan rute aplikasi (Panduan penggunaan), tidak pernah aktif. */
  external?: boolean;
};

export type NavGroup = { title: string; items: NavItem[] };

export type ActiveDirectory = { id: string; name: string; hasData: boolean };

export type NavItems = {
  main: NavItem[];
  /** Hanya ada di dalam direktori yang berisi data. */
  directory: NavGroup | null;
  help: NavGroup;
};

/** Teks di bawah logo dan awalan breadcrumb (PRD 5.8, K-46). */
export const APP_LABEL = "Klinik Finansial Mahasiswa";

const GUIDE_HREF = "#";

export function buildNavItems(active: ActiveDirectory | null): NavItems {
  const main: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { title: "Direktori Data", href: "/directories", icon: "directories" },
  ];

  const help: NavGroup = {
    title: "Pusat bantuan",
    items: [
      {
        title: "Panduan penggunaan",
        href: GUIDE_HREF,
        icon: "guide",
        external: true,
      },
      { title: "Pengaturan", href: "/settings", icon: "settings" },
    ],
  };

  let directory: NavGroup | null = null;
  if (active?.hasData) {
    const base = `/directories/${encodeURIComponent(active.id)}`;
    directory = {
      title: active.name,
      items: [
        {
          title: "Analisis Keuangan",
          href: `${base}/analysis`,
          icon: "analysis",
        },
        {
          title: "Runway dan Prediksi",
          href: `${base}/runway`,
          icon: "runway",
        },
        {
          title: "Simulasi Skenario",
          href: `${base}/simulation`,
          icon: "simulation",
        },
      ],
    };
  }

  return { main, directory, help };
}

/** Seluruh href rute aplikasi pada menu, tanpa tautan eksternal. */
export function flattenNavHrefs(nav: NavItems): string[] {
  return [...nav.main, ...(nav.directory?.items ?? []), ...nav.help.items]
    .filter((item) => !item.external)
    .map((item) => item.href);
}

function matchesPrefix(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Href item aktif: awalan path terpanjang yang cocok per segmen, agar
 * "Direktori Data" tidak aktif bersamaan dengan item direktori.
 */
export function findActiveHref(
  pathname: string,
  hrefs: readonly string[],
): string | null {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  let best: string | null = null;
  for (const href of hrefs) {
    if (
      matchesPrefix(path, href) &&
      (best === null || href.length > best.length)
    ) {
      best = href;
    }
  }
  return best;
}
