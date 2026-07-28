type StampProps = {
  text?: string;
  className?: string;
};

// The signature motif: a hand-painted "TO LET" signboard, the way vacancies actually
// get advertised on gates and walls across Nairobi estates. Used on listing cards and
// in the hero — standing in for the real signboards this platform replaces.
export default function Stamp({ text = "TO LET", className = "" }: StampProps) {
  return (
    <span
      className={`inline-flex -rotate-3 items-center border-2 border-ink bg-mustard px-2.5 py-1 font-display text-xs font-bold uppercase tracking-wide text-ink shadow-[2px_2px_0_0_#211D16] ${className}`}
    >
      {text}
    </span>
  );
}
