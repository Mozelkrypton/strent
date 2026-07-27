import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export type Role = "TENANT" | "LANDLORD" | "ADMIN";

// --- Short-lived "password already checked, waiting on 2FA code" challenge ---
// Deliberately NOT a session: 5-minute expiry, single purpose, never touches
// the Session table. A real session is only created once the 2FA code checks out.
type TwoFactorChallengePayload = { userId: string; purpose: "2fa_challenge" };

export function signTwoFactorChallenge(userId: string): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");
  const payload: TwoFactorChallengePayload = { userId, purpose: "2fa_challenge" };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "5m" });
}

export function verifyTwoFactorChallenge(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TwoFactorChallengePayload;
    if (payload.purpose !== "2fa_challenge") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
