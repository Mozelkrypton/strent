"use client";

import { useEffect, useState } from "react";
import StarRating from "@/components/StarRating";
import Button from "@/components/Button";
import { RATING_CATEGORIES, type CategoryRatings } from "@/lib/reviews/categories";
import type { ListingRatings, ReviewDto } from "@/types";

const EMPTY_RATINGS: CategoryRatings = { location: 0, value: 0, condition: 0, utilities: 0, landlord: 0 };

export default function ReviewsSection({ listingId, ratings }: { listingId: string; ratings: ListingRatings }) {
  const [reviews, setReviews] = useState<ReviewDto[] | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [form, setForm] = useState<CategoryRatings>(EMPTY_RATINGS);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/listings/${listingId}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews);
        if (data.ownReview) {
          setForm(data.ownReview);
          setComment(data.ownReview.comment ?? "");
        }
      });

    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => setCanReview(profile?.role === "TENANT"));
  }, [listingId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (Object.values(form).some((v) => v < 1)) {
      setError("Please rate every category before submitting");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings: form, comment })
      });
      const data = await res.json();
      if (res.ok) {
        setSaved(true);
        const listRes = await fetch(`/api/listings/${listingId}/reviews`);
        setReviews((await listRes.json()).reviews);
      } else {
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-10 border-t border-ink/5 pt-8">
      <h2 className="font-display text-lg font-bold text-ink">Ratings & reviews</h2>

      {ratings.count > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {RATING_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-2.5 shadow-sm">
              <span className="text-sm text-ink">{c.label}</span>
              <div className="flex items-center gap-2">
                <StarRating value={ratings[c.key] ?? 0} size="sm" />
                <span className="w-8 text-right font-mono text-sm text-mute">
                  {ratings[c.key]?.toFixed(1) ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-mute">No reviews yet — be the first tenant to rate this house.</p>
      )}

      {canReview && (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl bg-surface p-5 shadow-card">
          <p className="font-display text-base font-semibold text-ink">
            {reviews?.length !== undefined ? "Rate this house" : "Loading…"}
          </p>
          {RATING_CATEGORIES.map((c) => (
            <div key={c.key} className="flex items-center justify-between">
              <span className="text-sm text-ink">{c.label}</span>
              <StarRating value={form[c.key]} onChange={(v) => setForm((f) => ({ ...f, [c.key]: v }))} size="md" />
            </div>
          ))}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Anything else other tenants should know? (optional)"
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-150 ease-smooth focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          {saved && !error && <p className="text-sm text-primary-dark">Thanks — your review is live.</p>}
          <Button disabled={saving}>{saving ? "Saving…" : "Submit review"}</Button>
        </form>
      )}

      {reviews && reviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{r.tenantName}</p>
                <StarRating
                  value={(r.ratingLocation + r.ratingValue + r.ratingCondition + r.ratingUtilities + r.ratingLandlord) / 5}
                  size="sm"
                />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink/80">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
