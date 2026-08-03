import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/security/serverSession";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN" || !session.user.adminLevel) redirect("/");

  if (!session.user.twoFactorEnabled) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-xl font-bold text-ink">Two-factor authentication required</h1>
        <p className="mt-3 text-sm text-mute">
          Admin tools require 2FA on your account before you can access them — a privileged account without it
          isn&apos;t secure enough to call admin.
        </p>
        <Link
          href="/profile/edit"
          className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lift"
        >
          Set up 2FA
        </Link>
      </div>
    );
  }

  const isSuperAdmin = session.user.adminLevel === "SUPER_ADMIN";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">Admin</h1>
        <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
          {isSuperAdmin ? "Super-admin" : "Admin"}
        </span>
      </div>
      <nav className="mt-6 flex flex-wrap gap-2 border-b border-ink/5 pb-4 text-sm font-medium">
        <Link href="/admin" className="rounded-full px-3 py-1.5 text-ink transition-colors hover:bg-mute/5">
          Dashboard
        </Link>
        <Link href="/admin/users" className="rounded-full px-3 py-1.5 text-ink transition-colors hover:bg-mute/5">
          Users
        </Link>
        <Link
          href="/admin/verifications"
          className="rounded-full px-3 py-1.5 text-ink transition-colors hover:bg-mute/5"
        >
          Verifications
        </Link>
        <Link href="/admin/listings" className="rounded-full px-3 py-1.5 text-ink transition-colors hover:bg-mute/5">
          Listings
        </Link>
        <Link
          href="/admin/audit-log"
          className="rounded-full px-3 py-1.5 text-ink transition-colors hover:bg-mute/5"
        >
          Audit log
        </Link>
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
