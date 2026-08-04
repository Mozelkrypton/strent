import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/security/currentUser";
import { bookingService } from "@/lib/bookings/bookingService";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords see incoming booking requests" }, { status: 403 });
  }

  const bookings = await bookingService.listForLandlord(session.userId);

  return NextResponse.json(
    bookings.map((b) => ({
      id: b.id,
      status: b.status,
      amount: b.amount,
      moveInDate: b.moveInDate,
      createdAt: b.createdAt,
      listing: b.listing,
      tenant: b.tenant
    }))
  );
}
