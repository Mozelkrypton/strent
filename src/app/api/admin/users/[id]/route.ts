import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { adminAuditLogger } from "@/lib/admin/auditLog";
import { sessionManager } from "@/lib/security/sessionManager";

const VALID_ACTIONS = [
  "suspend",
  "unsuspend",
  "revoke-sessions",
  "grant-admin",
  "grant-super-admin",
  "revoke-admin"
] as const;
type Action = (typeof VALID_ACTIONS)[number];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;
  const admin = session!;

  const { action } = (await req.json()) as { action?: string };
  if (!action || !VALID_ACTIONS.includes(action as Action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Granting/revoking admin privileges is a super-admin-only power — a
  // regular admin managing other admins would defeat the whole tier system.
  const superAdminOnlyActions: Action[] = ["grant-admin", "grant-super-admin", "revoke-admin"];
  if (superAdminOnlyActions.includes(action as Action) && admin.adminLevel !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Only a super-admin can change admin privileges" }, { status: 403 });
  }

  // Never let an admin suspend or de-admin themselves through this endpoint —
  // that's how you lock yourself out by accident.
  if (target.id === admin.userId && (action === "suspend" || action === "revoke-admin")) {
    return NextResponse.json({ error: "You can't do that to your own account" }, { status: 400 });
  }

  switch (action as Action) {
    case "suspend": {
      await prisma.user.update({ where: { id: target.id }, data: { suspended: true } });
      await sessionManager.revokeAllForUser(target.id); // kick them out immediately, not just on next login
      break;
    }
    case "unsuspend": {
      await prisma.user.update({ where: { id: target.id }, data: { suspended: false } });
      break;
    }
    case "revoke-sessions": {
      await sessionManager.revokeAllForUser(target.id);
      break;
    }
    case "grant-admin": {
      await prisma.user.update({ where: { id: target.id }, data: { role: "ADMIN", adminLevel: "ADMIN" } });
      break;
    }
    case "grant-super-admin": {
      await prisma.user.update({ where: { id: target.id }, data: { role: "ADMIN", adminLevel: "SUPER_ADMIN" } });
      break;
    }
    case "revoke-admin": {
      // Don't allow removing the last super-admin — that would lock
      // everyone out of ever granting admin access again.
      if (target.adminLevel === "SUPER_ADMIN") {
        const otherSuperAdmins = await prisma.user.count({
          where: { adminLevel: "SUPER_ADMIN", id: { not: target.id } }
        });
        if (otherSuperAdmins === 0) {
          return NextResponse.json({ error: "Can't remove the last super-admin" }, { status: 400 });
        }
      }
      await prisma.user.update({ where: { id: target.id }, data: { role: "TENANT", adminLevel: null } });
      await sessionManager.revokeAllForUser(target.id);
      break;
    }
  }

  await adminAuditLogger.log(admin.userId, `user.${action}`, "User", target.id, `${target.name} <${target.email}>`);

  return NextResponse.json({ ok: true });
}
