import { redirect } from "next/navigation";

import { getSession } from "@/server/better-auth/server";

// Pengarah (PRD 5.0): belum masuk ke /login, sudah masuk ke /dashboard.
export default async function Home() {
  const session = await getSession();
  redirect(session ? "/dashboard" : "/login");
}
