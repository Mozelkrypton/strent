export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type BookingAction = "confirm" | "cancel" | "mark-paid";

const VALID_TRANSITIONS: Record<BookingAction, BookingStatus[]> = {
  confirm: ["PENDING"],
  cancel: ["PENDING", "CONFIRMED"],
  "mark-paid": ["CONFIRMED"]
};

const NEXT_STATUS: Record<BookingAction, BookingStatus> = {
  confirm: "CONFIRMED",
  cancel: "CANCELLED",
  "mark-paid": "COMPLETED"
};

export function canTransition(from: BookingStatus, action: BookingAction): boolean {
  return VALID_TRANSITIONS[action].includes(from);
}

export function nextStatus(action: BookingAction): BookingStatus {
  return NEXT_STATUS[action];
}
