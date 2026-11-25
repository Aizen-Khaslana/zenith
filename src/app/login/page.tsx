import { redirect } from "next/navigation";

import { LoginIndex } from "@/app/_components/login/login-index";
import { postLoginPath, sanitizeNext } from "@/lib/auth/next-path";
import { getSession } from "@/server/better-auth/server";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;

  const session = await getSession();
  if (session) redirect(postLoginPath(next));

  return (
    <LoginIndex nextPath={sanitizeNext(next)} hasError={error !== undefined} />
  );
}
