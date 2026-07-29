type VerifiedBadgeProps = {
  className?: string;
  label?: string;
};

// Distinct from Stamp (the "TO LET" signboard motif): this one is a data-driven
// trust signal, only ever shown when listing.landlordVerified is actually true.
export default function VerifiedBadge({ className = "", label = "Verified landlord" }: VerifiedBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary-dark shadow-sm ring-1 ring-primary/10 ${className}`}
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path
          fillRule="evenodd"
          d="M10 1.5a1 1 0 01.6.2l1.7 1.28 2.13-.14a1 1 0 01.98.6l.82 1.96 1.96.82a1 1 0 01.6.98l-.14 2.13 1.28 1.7a1 1 0 010 1.2l-1.28 1.7.14 2.13a1 1 0 01-.6.98l-1.96.82-.82 1.96a1 1 0 01-.98.6l-2.13-.14-1.7 1.28a1 1 0 01-1.2 0l-1.7-1.28-2.13.14a1 1 0 01-.98-.6l-.82-1.96-1.96-.82a1 1 0 01-.6-.98l.14-2.13-1.28-1.7a1 1 0 010-1.2l1.28-1.7-.14-2.13a1 1 0 01.6-.98l1.96-.82.82-1.96a1 1 0 01.98-.6l2.13.14 1.7-1.28a1 1 0 01.6-.2zm3.7 6.2a.75.75 0 00-1.1-1L9 10.3 7.4 8.7a.75.75 0 00-1.1 1.06l2.15 2.15a.75.75 0 001.06 0l4.2-4.2z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </span>
  );
}
