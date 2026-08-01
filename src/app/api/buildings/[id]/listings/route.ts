import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { isValidUnitType, bedroomsForUnitType } from "@/lib/units";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const building = await prisma.building.findUnique({ where: { id: params.id } });
  if (!building) return NextResponse.json({ error: "Building not found" }, { status: 404 });
  if (building.landlordId !== session.userId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "Not your building" }, { status: 403 });
  }

  const { title, description, price, unitType, bathrooms, imageUrls } = await req.json();

  if (!title || !description || !price || !isValidUnitType(unitType)) {
    return NextResponse.json(
      { error: "Title, description, price, and a valid unit type are required" },
      { status: 400 }
    );
  }

  const unit = await prisma.listing.create({
    data: {
      title,
      description,
      price,
      unitType,
      bedrooms: bedroomsForUnitType(unitType),
      bathrooms: bathrooms ?? 1,
      // Inherited from the building — one map pin covers every unit inside it.
      address: building.address,
      latitude: building.latitude,
      longitude: building.longitude,
      landlordId: session.userId,
      buildingId: building.id,
      images: {
        create: (imageUrls as string[] | undefined)?.map((url) => ({ url })) ?? []
      }
    }
  });

  return NextResponse.json(unit, { status: 201 });
}
