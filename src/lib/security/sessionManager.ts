import { prisma } from "@/lib/prisma";
import { generateRawToken, hashToken, getClientIp } from "./tokens";

export const SESSION_COOKIE = "strent_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/**
 * Sessions are opaque random tokens, not JWTs: the cookie holds the raw
 * token, only its SHA-256 hash lives in the database, and each row is a
 * real device/browser the user is signed in on. That's what makes
 * "view and revoke devices" possible — a stateless JWT can't be revoked
 * before it expires.
 */
export class SessionManager {
  async create(userId: string, req: Request): Promise<string> {
    const raw = generateRawToken();
    await prisma.session.create({
      data: {
        userId,
        tokenHash: hashToken(raw),
        userAgent: req.headers.get("user-agent") ?? undefined,
        ipAddress: getClientIp(req),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS)
      }
    });
    return raw;
  }

  /** Validates a raw cookie token and returns the session + user, or null. */
  async validate(raw: string) {
    const tokenHash = hashToken(raw);
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true }
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) return null;

    // Best-effort "last seen" bump — don't block the request on it.
    prisma.session
      .update({ where: { id: session.id }, data: { lastUsedAt: new Date() } })
      .catch(() => {});

    return session;
  }

  async revokeByToken(raw: string): Promise<void> {
    await prisma.session.updateMany({
      where: { tokenHash: hashToken(raw) },
      data: { revokedAt: new Date() }
    });
  }

  /** Revoke a specific device by session id — scoped to userId so users can only revoke their own. */
  async revokeById(sessionId: string, userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() }
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async listActive(userId: string) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastUsedAt: "desc" },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true
      }
    });
  }
}

export const sessionManager = new SessionManager();
