import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { unitTypeLabel } from "@/lib/units";

async function loadOwnedBuilding(id: string, userId: string, role: string) {
  const building = await prisma.building.findUnique({ where: { id } });
  if (!building) return { building: null, allowed: false };
  const allowed = building.landlordId === userId || role === "ADMIN";
  return { building, allowed };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { building, allowed } = await loadOwnedBuilding(params.id, session.userId, session.role);
  if (!building) return NextResponse.json({ error: "Building not found" }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Not your building" }, { status: 403 });

  const listings = await prisma.listing.findMany({
    where: { buildingId: params.id },
    include: { images: { take: 1 } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    id: building.id,
    name: building.name,
    address: building.address,
    latitude: building.latitude,
    longitude: building.longitude,
    description: building.description,
    units: listings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      unitType: l.unitType,
      unitTypeLabel: unitTypeLabel(l.unitType),
      bathrooms: l.bathrooms,
      status: l.status,
      coverImageUrl: l.images[0]?.url ?? null
    }))
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { building, allowed } = await loadOwnedBuilding(params.id, session.userId, session.role);
  if (!building) return NextResponse.json({ error: "Building not found" }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Not your building" }, { status: 403 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const field of ["name", "address", "latitude", "longitude", "description"] as const) {
    if (field in body) data[field] = body[field];
  }

  const updated = await prisma.building.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { building, allowed } = await loadOwnedBuilding(params.id, session.userId, session.role);
  if (!building) return NextResponse.json({ error: "Building not found" }, { status: 404 });
  if (!allowed) return NextResponse.json({ error: "Not your building" }, { status: 403 });

  // Cascades to every unit (Listing) in this building via the schema's onDelete: Cascade.
  await prisma.building.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
