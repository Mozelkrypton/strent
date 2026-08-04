import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { bookingService } from "@/lib/bookings/bookingService";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can request a booking" }, { status: 403 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.status !== "AVAILABLE") {
    return NextResponse.json({ error: "This listing isn't available to book" }, { status: 409 });
  }

  const { moveInDate } = await req.json().catch(() => ({ moveInDate: undefined }));

  const result = await bookingService.requestBooking({
    listingId: listing.id,
    tenantId: session.userId,
    amount: listing.price,
    moveInDate: moveInDate ? new Date(moveInDate) : null
  });

  if ("error" in result) {
    return NextResponse.json({ error: "You already have an open request for this listing" }, { status: 409 });
  }

  return NextResponse.json(result.booking, { status: 201 });
}
