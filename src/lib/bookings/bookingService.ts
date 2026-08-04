import { prisma } from "@/lib/prisma";
import { canTransition, nextStatus, type BookingAction, type BookingStatus } from "./stateMachine";

export type { BookingAction };

/**
 * State machine: PENDING -> CONFIRMED -> COMPLETED, with CANCELLED reachable
 * from PENDING or CONFIRMED. "mark-paid" is a manual landlord action for now
 * (sets status to COMPLETED) — the seam where a real M-Pesa Daraja STK Push
 * callback slots in later without changing anything else in this class or
 * its callers. When that lands, it'll set `mpesaReceipt` and call the same
 * underlying completion path instead of the manual one.
 */
export class BookingService {
  async requestBooking(params: { listingId: string; tenantId: string; amount: number; moveInDate?: Date | null }) {
    const existing = await prisma.booking.findFirst({
      where: {
        listingId: params.listingId,
        tenantId: params.tenantId,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });
    if (existing) return { error: "already-requested" as const };

    const booking = await prisma.booking.create({
      data: {
        listingId: params.listingId,
        tenantId: params.tenantId,
        amount: params.amount,
        moveInDate: params.moveInDate ?? null
      }
    });
    return { booking };
  }

  /** Ownership-checked transition — only the landlord who owns the listing can confirm/cancel/mark-paid. */
  async applyLandlordAction(bookingId: string, landlordId: string, action: BookingAction) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { listing: true } });
    if (!booking) return { error: "not-found" as const };
    if (booking.listing.landlordId !== landlordId) return { error: "forbidden" as const };

    if (!canTransition(booking.status as BookingStatus, action)) {
      return { error: "invalid-transition" as const, from: booking.status };
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: nextStatus(action) }
    });
    return { booking: updated };
  }

  /** Tenants can cancel their own still-pending request. */
  async cancelOwnBooking(bookingId: string, tenantId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return { error: "not-found" as const };
    if (booking.tenantId !== tenantId) return { error: "forbidden" as const };
    if (booking.status !== "PENDING") return { error: "invalid-transition" as const, from: booking.status };

    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
    return { booking: updated };
  }

  async listForTenant(tenantId: string) {
    return prisma.booking.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { listing: { include: { images: { take: 1 } } } }
    });
  }

  async listForLandlord(landlordId: string) {
    return prisma.booking.findMany({
      where: { listing: { landlordId } },
      orderBy: { createdAt: "desc" },
      include: {
        listing: { select: { id: true, title: true } },
        tenant: { select: { id: true, name: true, email: true, phone: true } }
      }
    });
  }
}

export const bookingService = new BookingService();
