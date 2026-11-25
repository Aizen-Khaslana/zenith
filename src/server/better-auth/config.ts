import "server-only";

import { env } from "@/env";
import { db } from "@/server/db";
import { createAuth } from "./create-auth";

export const auth = createAuth(db, {
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  },
});

export type { Session } from "./create-auth";
