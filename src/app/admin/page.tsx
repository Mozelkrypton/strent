import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [tenantCount, landlordCount, adminCount, listingCount, pendingVerifications, suspendedCount] =
    await Promise.all([
      prisma.user.count({ where: { role: "TENANT" } }),
      prisma.user.count({ where: { role: "LANDLORD" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.listing.count(),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { suspended: true } })
    ]);

  const cards = [
    { label: "Tenants", value: tenantCount },
    { label: "Landlords", value: landlordCount },
    { label: "Admins", value: adminCount },
    { label: "Listings", value: listingCount },
    { label: "Pending verifications", value: pendingVerifications, href: "/admin/verifications" },
    { label: "Suspended accounts", value: suspendedCount, href: "/admin/users" }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-2xl bg-surface p-5 shadow-card">
          <p className="text-sm text-mute">{c.label}</p>
          <p className="mt-1 font-display text-3xl font-bold text-ink">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
