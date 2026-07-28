import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSessionUser } from "@/lib/security/currentUser";
import { twoFactorService } from "@/lib/security/twoFactor";

// GET: generate a candidate secret + QR code. Nothing is saved yet —
// the secret only gets persisted once the user proves they can generate
// a valid code from it (see POST below). That way a half-finished setup
// can never leave 2FA silently half-enabled.
export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { secret, otpauthUrl } = twoFactorService.generateSecret(session.email);
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

  return NextResponse.json({ secret, qrDataUrl });
}

// POST: confirm the code generated from that secret, then persist it and
// hand back one-time backup codes (shown once, never retrievable again).
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { secret, code } = await req.json();
  if (!secret || !code) {
    return NextResponse.json({ error: "secret and code are required" }, { status: 400 });
  }

  if (!twoFactorService.verifyCode(secret, code)) {
    return NextResponse.json({ error: "That code didn't match — check your authenticator app" }, { status: 400 });
  }

  const { raw: backupCodes, hashed } = twoFactorService.generateBackupCodes();
  await twoFactorService.enable(session.userId, secret, hashed);

  return NextResponse.json({ ok: true, backupCodes });
}
