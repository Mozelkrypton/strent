import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/security/serverSession";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.user.role !== "LANDLORD") redirect("/");

  const buildings = await prisma.building.findMany({
    where: { landlordId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true } } }
  });

  const standaloneCount = await prisma.listing.count({
    where: { landlordId: session.user.id, buildingId: null }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Your properties</h1>
          <p className="mt-1 text-sm text-mute">Manage buildings with multiple units or list a standalone house.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/bookings"
            className="rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-sm ring-1 ring-ink/10 transition-colors hover:bg-mute/5"
          >
            Booking requests
          </Link>
          <Link
            href="/dashboard/listings/new"
            className="rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-sm ring-1 ring-ink/10 transition-colors hover:bg-mute/5"
          >
            List a standalone house
          </Link>
          <Link
            href="/dashboard/buildings/new"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lift"
          >
            Add a building
          </Link>
        </div>
      </div>

      {buildings.length === 0 && standaloneCount === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-mute/30 bg-surface p-12 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">Nothing listed yet</p>
          <p className="mt-1 text-mute">
            Add a building if you manage several units or list a single house if that&apos;s all you have.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {buildings.length > 0 && (
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">Buildings</h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {buildings.map((b) => (
                  <Link
                    key={b.id}
                    href={`/dashboard/buildings/${b.id}`}
                    className="block rounded-2xl bg-surface p-5 shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
                  >
                    <p className="font-display text-base font-semibold text-ink">{b.name}</p>
                    <p className="mt-1 text-sm text-mute">{b.address}</p>
                    <p className="mt-2 text-sm font-medium text-primary">
                      {b._count.listings} unit{b._count.listings === 1 ? "" : "s"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {standaloneCount > 0 && (
            <div>
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">Standalone houses</h2>
              <p className="mt-2 text-sm text-mute">
                {standaloneCount} house{standaloneCount === 1 ? "" : "s"} not part of a building —{" "}
                <Link href="/dashboard/listings/new" className="text-primary hover:underline">
                  add another
                </Link>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
