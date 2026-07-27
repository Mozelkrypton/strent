import crypto from "crypto";

/** A random, URL-safe token to hand to the user (email link, cookie value, etc). */
export function generateRawToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

/** One-way hash of a raw token. Only this ever touches the database. */
export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? undefined;
}
