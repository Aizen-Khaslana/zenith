// Halaman sementara untuk menguji login pada WP-01. Diganti pada WP-02:
// rute `/` menjadi pengarah ke /login atau /dashboard (PRD Bagian 5.0).
import { redirect } from "next/navigation";

import { SignOutButton } from "@/app/_components/dev-auth/sign-out-button";
import { getSession } from "@/server/better-auth/server";

export default async function Home() {
  const session = await getSession();
  // Tanpa sesi ke /login. /login hanya mengarah balik ke / bila sesi ada,
  // sehingga keduanya tidak saling mengarahkan dalam keadaan yang sama.
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <h1 className="text-2xl font-semibold">Zenith</h1>
        <dl className="text-muted-foreground flex flex-col gap-1 text-sm">
          <dt className="sr-only">Nama</dt>
          <dd>{session.user.name}</dd>
          <dt className="sr-only">Email</dt>
          <dd>{session.user.email}</dd>
          <dt className="sr-only">ID pengguna</dt>
          <dd className="font-mono text-xs">{session.user.id}</dd>
        </dl>
        <SignOutButton />
      </div>
    </main>
  );
}
