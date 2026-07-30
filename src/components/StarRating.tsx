"use client";

import { useState } from "react";

type StarRatingProps = {
  value: number; // 0-5, can be fractional in display mode
  onChange?: (value: number) => void; // presence makes it interactive
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASS = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export default function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const displayValue = hovered ?? value;

  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, displayValue - (n - 1)));
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => interactive && setHovered(n)}
            className={`relative ${SIZE_CLASS[size]} ${interactive ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
          >
            <svg viewBox="0 0 20 20" className={`${SIZE_CLASS[size]} text-mute/25`} fill="currentColor">
              <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
            </svg>
            {fill > 0 && (
              <svg
                viewBox="0 0 20 20"
                className={`absolute inset-0 ${SIZE_CLASS[size]} text-accent`}
                fill="currentColor"
                style={{ clipPath: `inset(0 ${100 - fill * 100}% 0 0)` }}
              >
                <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5z" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
