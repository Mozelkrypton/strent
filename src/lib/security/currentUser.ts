import type { NextRequest } from "next/server";
import { sessionManager, SESSION_COOKIE } from "./sessionManager";
import type { Role } from "@/lib/auth";

export type SessionUser = {
  userId: string;
  role: Role;
  email: string;
  name: string;
};

/**
 * Resolves the signed-in user from the session cookie, validating it
 * against the Session table (so a revoked or expired session is rejected
 * even though the cookie itself is still present in the browser).
 */
export async function getSessionUser(req: NextRequest | Request): Promise<SessionUser | null> {
  const token =
    "cookies" in req && typeof (req as NextRequest).cookies?.get === "function"
      ? (req as NextRequest).cookies.get(SESSION_COOKIE)?.value
      : readCookieFromHeader(req, SESSION_COOKIE);

  if (!token) return null;

  const session = await sessionManager.validate(token);
  if (!session) return null;

  return {
    userId: session.user.id,
    role: session.user.role as Role,
    email: session.user.email,
    name: session.user.name
  };
}

function readCookieFromHeader(req: Request, name: string): string | undefined {
  const raw = req.headers.get("cookie");
  if (!raw) return undefined;
  const match = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}
