type StampProps = {
  text?: string;
  className?: string;
};

// The signature motif: a hand-painted "TO LET" signboard, the way vacancies actually
// get advertised on gates and walls across Nairobi estates. Refined into something
// that reads as premium rather than crude — soft shadow, gentle tilt, clean type —
// while keeping the local specificity that makes it more than decoration.
export default function Stamp({ text = "TO LET", className = "" }: StampProps) {
  return (
    <span
      className={`inline-flex -rotate-2 items-center rounded-lg bg-accent px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-ink shadow-card ${className}`}
    >
      {text}
    </span>
  );
}
