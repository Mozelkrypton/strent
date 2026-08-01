import { cookies } from "next/headers";
import { sessionManager, SESSION_COOKIE } from "./sessionManager";

/** For use in Server Components / layouts, where there's no Request object
 * to read a cookie from — only next/headers' cookies(). API routes should
 * keep using getSessionUser(req) instead. */
export async function getServerSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return sessionManager.validate(token);
}
