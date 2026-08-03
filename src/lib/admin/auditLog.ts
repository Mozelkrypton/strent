import { prisma } from "@/lib/prisma";

export class AdminAuditLogger {
  /** Never throws into the caller — a logging failure shouldn't be the
   * reason an admin action itself fails, but it's logged to the console
   * so a silent audit gap doesn't go unnoticed. */
  async log(adminId: string, action: string, targetType: string, targetId: string, detail?: string): Promise<void> {
    try {
      await prisma.adminActionLog.create({ data: { adminId, action, targetType, targetId, detail } });
    } catch (err) {
      console.error("[admin-audit] failed to record action:", err);
    }
  }
}

export const adminAuditLogger = new AdminAuditLogger();
