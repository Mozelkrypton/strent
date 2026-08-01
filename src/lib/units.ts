export const UNIT_TYPES = [
  { key: "BEDSITTER", label: "Bedsitter", bedrooms: 0 },
  { key: "ONE_BEDROOM", label: "1 bedroom", bedrooms: 1 },
  { key: "TWO_BEDROOM", label: "2 bedroom", bedrooms: 2 },
  { key: "THREE_BEDROOM", label: "3 bedroom", bedrooms: 3 },
  { key: "FOUR_BEDROOM", label: "4 bedroom", bedrooms: 4 },
  { key: "FIVE_BEDROOM", label: "5 bedroom", bedrooms: 5 },
  { key: "SIX_BEDROOM", label: "6 bedroom", bedrooms: 6 }
] as const;

export type UnitTypeKey = (typeof UNIT_TYPES)[number]["key"];

export function isValidUnitType(value: unknown): value is UnitTypeKey {
  return typeof value === "string" && UNIT_TYPES.some((u) => u.key === value);
}

/** The bedroom count a unit type implies — kept so existing bedroom-based
 * filters/sort continue to work without changes. */
export function bedroomsForUnitType(unitType: UnitTypeKey): number {
  return UNIT_TYPES.find((u) => u.key === unitType)!.bedrooms;
}

export function unitTypeLabel(unitType: UnitTypeKey | null | undefined): string {
  if (!unitType) return "";
  return UNIT_TYPES.find((u) => u.key === unitType)?.label ?? "";
}
