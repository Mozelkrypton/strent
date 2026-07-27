import { prisma } from "@/lib/prisma";
import { getClientIp } from "./tokens";

export type LoginAuditEntry = {
  userId?: string;
  email: string;
  success: boolean;
  reason?: string;
  req: Request;
};

/** Writes to the LoginEvent audit trail. Never throws into the caller — a
 * logging failure should never be the reason a login itself fails. */
export class AuditLogger {
  async logLogin({ userId, email, success, reason, req }: LoginAuditEntry): Promise<void> {
    try {
      await prisma.loginEvent.create({
        data: {
          userId,
          email,
          success,
          reason,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get("user-agent") ?? undefined
        }
      });
    } catch (err) {
      console.error("[audit] failed to record login event:", err);
    }
  }
}

export const auditLogger = new AuditLogger();
