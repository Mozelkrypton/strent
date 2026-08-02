import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";

// GET /api/buildings — the signed-in landlord's own buildings, with unit counts
export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords have buildings" }, { status: 403 });
  }

  const buildings = await prisma.building.findMany({
    where: { landlordId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { listings: true } } }
  });

  return NextResponse.json(
    buildings.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      latitude: b.latitude,
      longitude: b.longitude,
      description: b.description,
      unitCount: b._count.listings
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can create buildings" }, { status: 403 });
  }

  const { name, address, latitude, longitude, description } = await req.json();

  if (!name || !address) {
    return NextResponse.json({ error: "Name and address are required" }, { status: 400 });
  }

  const building = await prisma.building.create({
    data: {
      name,
      address,
      latitude,
      longitude,
      description: description || null,
      landlordId: session.userId
    }
  });

  return NextResponse.json(building, { status: 201 });
}
