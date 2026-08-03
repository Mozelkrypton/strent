import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1 },
      landlord: { select: { id: true, name: true, email: true } }
    }
  });

  return NextResponse.json(
    listings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      status: l.status,
      address: l.address,
      coverImageUrl: l.images[0]?.url ?? null,
      landlord: l.landlord,
      createdAt: l.createdAt
    }))
  );
}
