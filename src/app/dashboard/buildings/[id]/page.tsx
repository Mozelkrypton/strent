import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/security/serverSession";
import { unitTypeLabel } from "@/lib/units";

export default async function BuildingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) redirect("/login");

  const building = await prisma.building.findUnique({ where: { id: params.id } });
  if (!building) notFound();
  if (building.landlordId !== session.user.id && session.user.role !== "ADMIN") redirect("/dashboard");

  const units = await prisma.listing.findMany({
    where: { buildingId: params.id },
    include: { images: { take: 1 } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-mute hover:text-primary">
        ← All properties
      </Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{building.name}</h1>
          <p className="mt-1 text-sm text-mute">{building.address}</p>
        </div>
        <Link
          href={`/dashboard/buildings/${building.id}/units/new`}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lift"
        >
          Add a unit
        </Link>
      </div>
      {building.description && <p className="mt-3 text-sm text-ink/80">{building.description}</p>}

      {units.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-mute/30 bg-surface p-12 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">No units yet</p>
          <p className="mt-1 text-mute">Add your first unit — bedsitter, 1 bedroom, or however it&apos;s split up.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {units.map((unit) => (
            <Link
              key={unit.id}
              href={`/listings/${unit.id}`}
              className="flex gap-3 rounded-2xl bg-surface p-3 shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mute/10">
                {unit.images[0] && (
                  <Image src={unit.images[0].url} alt={unit.title} fill sizes="80px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-ink">{unit.title}</p>
                <p className="text-xs text-mute">{unitTypeLabel(unit.unitType) || `${unit.bedrooms} bed`}</p>
                <p className="mt-1 font-mono text-sm font-bold text-ink">KES {unit.price.toLocaleString()}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    unit.status === "AVAILABLE" ? "bg-primary-light text-primary-dark" : "bg-mute/10 text-mute"
                  }`}
                >
                  {unit.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
