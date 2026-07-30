export const RATING_CATEGORIES = [
  { key: "location", field: "ratingLocation", label: "Location & security", short: "Location" },
  { key: "value", field: "ratingValue", label: "Value for money", short: "Value" },
  { key: "condition", field: "ratingCondition", label: "House condition", short: "Condition" },
  { key: "utilities", field: "ratingUtilities", label: "Water & power reliability", short: "Utilities" },
  { key: "landlord", field: "ratingLandlord", label: "Landlord responsiveness", short: "Landlord" }
] as const;

export type RatingCategoryKey = (typeof RATING_CATEGORIES)[number]["key"];

export type CategoryRatings = Record<RatingCategoryKey, number>;

/** What a tenant can sort/filter the browse grid by — "overall" plus each category. */
export const SORT_OPTIONS = [
  { key: "overall", label: "Top rated overall" },
  ...RATING_CATEGORIES.map((c) => ({ key: c.key, label: `Best: ${c.short}` }))
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["key"];

export function isValidRating(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 1 && n <= 5;
}

/** Plain average of the five category scores — what "overall" means for a single review. */
export function computeOverall(ratings: CategoryRatings): number {
  const values = RATING_CATEGORIES.map((c) => ratings[c.key]);
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
