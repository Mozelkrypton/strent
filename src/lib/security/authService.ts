import { prisma } from "@/lib/prisma";
import { verifyPassword, signTwoFactorChallenge, verifyTwoFactorChallenge } from "@/lib/auth";
import { sessionManager, SessionManager } from "./sessionManager";
import { auditLogger, AuditLogger } from "./auditLogger";
import { loginRateLimiter, RateLimiter } from "./rateLimiter";
import { twoFactorService, TwoFactorService } from "./twoFactor";
import { getClientIp } from "./tokens";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export type LoginResult =
  | { status: "ok"; userId: string; sessionToken: string }
  | { status: "2fa_required"; challengeToken: string }
  | { status: "locked"; lockedUntil: Date }
  | { status: "rate_limited"; retryAfterMs?: number }
  | { status: "invalid" };

export type TwoFactorResult =
  | { status: "ok"; userId: string; sessionToken: string }
  | { status: "invalid" };

/**
 * Everything the "sign in" checklist asked for lives here, composed from
 * smaller single-purpose collaborators rather than one giant function:
 * a RateLimiter, an AuditLogger, a SessionManager, a TwoFactorService.
 * The route handler just calls `login()` / `completeTwoFactor()` and reacts
 * to the status it gets back.
 */
export class AuthService {
  constructor(
    private sessions: SessionManager,
    private audit: AuditLogger,
    private limiter: RateLimiter,
    private twoFactor: TwoFactorService
  ) {}

  async login(email: string, password: string, req: Request): Promise<LoginResult> {
    const normalizedEmail = email.trim().toLowerCase();
    const ip = getClientIp(req) ?? "unknown";

    const limit = this.limiter.consume(`login:${ip}:${normalizedEmail}`);
    if (!limit.allowed) {
      await this.audit.logLogin({ email: normalizedEmail, success: false, reason: "rate_limited", req });
      return { status: "rate_limited", retryAfterMs: limit.retryAfterMs };
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      await this.audit.logLogin({ email: normalizedEmail, success: false, reason: "no_such_user", req });
      return { status: "invalid" };
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      await this.audit.logLogin({ userId: user.id, email: normalizedEmail, success: false, reason: "locked_out", req });
      return { status: "locked", lockedUntil: user.lockedUntil };
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      const attempts = user.failedLoginAttempts + 1;
      const shouldLock = attempts >= MAX_FAILED_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: shouldLock ? 0 : attempts,
          lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_MS) : user.lockedUntil
        }
      });

      await this.audit.logLogin({
        userId: user.id,
        email: normalizedEmail,
        success: false,
        reason: shouldLock ? "locked_out" : "invalid_password",
        req
      });

      return shouldLock
        ? { status: "locked", lockedUntil: new Date(Date.now() + LOCKOUT_MS) }
        : { status: "invalid" };
    }

    // Successful password check — clear any prior failure count/lock.
    if (user.failedLoginAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockedUntil: null }
      });
    }

    if (user.twoFactorEnabled) {
      await this.audit.logLogin({
        userId: user.id,
        email: normalizedEmail,
        success: true,
        reason: "password_ok_awaiting_2fa",
        req
      });
      return { status: "2fa_required", challengeToken: signTwoFactorChallenge(user.id) };
    }

    const sessionToken = await this.sessions.create(user.id, req);
    await this.audit.logLogin({ userId: user.id, email: normalizedEmail, success: true, req });
    return { status: "ok", userId: user.id, sessionToken };
  }

  async completeTwoFactor(challengeToken: string, code: string, req: Request): Promise<TwoFactorResult> {
    const payload = verifyTwoFactorChallenge(challengeToken);
    if (!payload) return { status: "invalid" };

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) return { status: "invalid" };

    const validCode = this.twoFactor.verifyCode(user.twoFactorSecret, code);
    const validBackup = !validCode && (await this.twoFactor.consumeBackupCode(user.id, code));

    if (!validCode && !validBackup) {
      await this.audit.logLogin({ userId: user.id, email: user.email, success: false, reason: "bad_2fa_code", req });
      return { status: "invalid" };
    }

    const sessionToken = await this.sessions.create(user.id, req);
    await this.audit.logLogin({
      userId: user.id,
      email: user.email,
      success: true,
      reason: validBackup ? "2fa_backup_code" : "2fa_ok",
      req
    });
    return { status: "ok", userId: user.id, sessionToken };
  }
}

export const authService = new AuthService(sessionManager, auditLogger, loginRateLimiter, twoFactorService);
