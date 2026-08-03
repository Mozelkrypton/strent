import { NextResponse } from "next/server";
import type { SessionUser } from "@/lib/security/currentUser";

export type AdminGateResult = { ok: true } | { ok: false; response: NextResponse };

/**
 * Every admin API route calls this first. Requires role=ADMIN AND a real
 * adminLevel AND 2FA enabled — a privileged account without MFA doesn't get
 * in, full stop. That's what makes "admin" mean something here rather than
 * being just another role check.
 */
export function requireAdmin(session: SessionUser | null, options?: { superAdminOnly?: boolean }): AdminGateResult {
  if (!session) {
    return { ok: false, response: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  }
  if (session.role !== "ADMIN" || !session.adminLevel) {
    return { ok: false, response: NextResponse.json({ error: "Admin access required" }, { status: 403 }) };
  }
  if (!session.twoFactorEnabled) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Enable two-factor authentication in your profile settings before accessing admin tools" },
        { status: 403 }
      )
    };
  }
  if (options?.superAdminOnly && session.adminLevel !== "SUPER_ADMIN") {
    return { ok: false, response: NextResponse.json({ error: "Super-admin access required" }, { status: 403 }) };
  }
  return { ok: true };
}
