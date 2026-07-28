import { prisma } from "@/lib/prisma";
import { generateRawToken, hashToken } from "./tokens";

/**
 * Shared shape of the EmailVerificationToken and PasswordResetToken Prisma
 * delegates — just enough of the Prisma Client API for this base class to
 * operate on either table generically.
 */
type TokenDelegate = {
  create: (args: { data: { userId: string; tokenHash: string; expiresAt: Date } }) => Promise<unknown>;
  findUnique: (args: { where: { tokenHash: string } }) => Promise<{
    userId: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null>;
  update: (args: { where: { tokenHash: string }; data: { usedAt: Date } }) => Promise<unknown>;
};

/** Casts a Prisma model delegate down to the narrow shape this service needs,
 * sidestepping Prisma's more elaborate generated argument types. */
function asTokenDelegate(delegate: unknown): TokenDelegate {
  return delegate as TokenDelegate;
}

/**
 * Base class for "prove you own this email address" flows: generate a raw
 * token, store only its hash, and later exchange the raw token for the
 * user id exactly once before it expires.
 *
 * Subclasses just plug in a Prisma delegate and a time-to-live — all the
 * hashing/expiry/single-use logic lives here once.
 */
export abstract class ExpiringTokenService {
  protected abstract ttlMs: number;
  protected abstract delegate: TokenDelegate;

  /** Creates a token for the user and returns the RAW value to send them. */
  async issue(userId: string): Promise<string> {
    const raw = generateRawToken();
    await this.delegate.create({
      data: { userId, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + this.ttlMs) }
    });
    return raw;
  }

  /**
   * Redeems a raw token. Returns the userId if it's valid, unused, and
   * unexpired — and immediately marks it used so it can't be replayed.
   */
  async consume(raw: string): Promise<{ userId: string } | null> {
    const tokenHash = hashToken(raw);
    const record = await this.delegate.findUnique({ where: { tokenHash } });
    if (!record) return null;
    if (record.usedAt) return null;
    if (record.expiresAt < new Date()) return null;

    await this.delegate.update({ where: { tokenHash }, data: { usedAt: new Date() } });
    return { userId: record.userId };
  }
}

export class EmailVerificationService extends ExpiringTokenService {
  protected ttlMs = 1000 * 60 * 60 * 24; // 24 hours
  protected delegate = asTokenDelegate(prisma.emailVerificationToken);
}

export class PasswordResetService extends ExpiringTokenService {
  protected ttlMs = 1000 * 60 * 30; // 30 minutes — short-lived, per the checklist
  protected delegate = asTokenDelegate(prisma.passwordResetToken);
}
