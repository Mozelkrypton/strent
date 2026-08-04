import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/security/currentUser";
import { bookingService, type BookingAction } from "@/lib/bookings/bookingService";

const LANDLORD_ACTIONS: BookingAction[] = ["confirm", "cancel", "mark-paid"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { action } = (await req.json()) as { action?: string };

  let result;
  if (session.role === "LANDLORD" && LANDLORD_ACTIONS.includes(action as BookingAction)) {
    result = await bookingService.applyLandlordAction(params.id, session.userId, action as BookingAction);
  } else if (session.role === "TENANT" && action === "cancel") {
    result = await bookingService.cancelOwnBooking(params.id, session.userId);
  } else {
    return NextResponse.json({ error: "Unknown or unavailable action" }, { status: 400 });
  }

  if ("error" in result) {
    const status = result.error === "not-found" ? 404 : result.error === "forbidden" ? 403 : 409;
    const message =
      result.error === "not-found"
        ? "Booking not found"
        : result.error === "forbidden"
          ? "This isn't your booking to change"
          : `Can't do that from status ${"from" in result ? result.from : "current"}`;
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json(result.booking);
}
