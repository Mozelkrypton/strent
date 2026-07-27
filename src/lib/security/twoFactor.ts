import { authenticator } from "otplib";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashToken } from "./tokens";

const APP_NAME = "Strent";

export class TwoFactorService {
  /** Generates a new TOTP secret + the otpauth:// URL to render as a QR code. */
  generateSecret(email: string): { secret: string; otpauthUrl: string } {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(email, APP_NAME, secret);
    return { secret, otpauthUrl };
  }

  verifyCode(secret: string, code: string): boolean {
    try {
      return authenticator.check(code.trim(), secret);
    } catch {
      return false;
    }
  }

  /** Returns both the raw codes (show once, never stored) and their hashes (what gets stored). */
  generateBackupCodes(count = 8): { raw: string[]; hashed: string[] } {
    const raw = Array.from({ length: count }, () => crypto.randomBytes(5).toString("hex"));
    return { raw, hashed: raw.map(hashToken) };
  }

  async enable(userId: string, secret: string, hashedBackupCodes: string[]): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, twoFactorSecret: secret, twoFactorBackupCodes: hashedBackupCodes }
    });
  }

  async disable(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] }
    });
  }

  /** One-time backup codes: valid once, then removed from the list. */
  async consumeBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const hashed = hashToken(code.trim());
    if (!user.twoFactorBackupCodes.includes(hashed)) return false;

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: user.twoFactorBackupCodes.filter((c) => c !== hashed) }
    });
    return true;
  }
}

export const twoFactorService = new TwoFactorService();
