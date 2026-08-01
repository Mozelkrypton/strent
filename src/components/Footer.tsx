import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink/5 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-extrabold text-white">
                S
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-ink">strent</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-mute">
              Every house here has an owner behind it, not an agent&apos;s markup.
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">House hunting</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              <li>
                <Link href="/" className="transition-colors hover:text-primary">Browse listings</Link>
              </li>
              <li>
                <Link href="/?view=map" className="transition-colors hover:text-primary">Search by map</Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-primary">List a house</Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-ink/60">Support</p>
            <ul className="mt-3 space-y-2 text-sm text-ink">
              <li>
                <Link href="/how-it-works" className="transition-colors hover:text-primary">How it works</Link>
              </li>
              <li>
                <Link href="/help" className="transition-colors hover:text-primary">Help & safety</Link>
              </li>
              <li>
                <Link href="/profile/edit" className="transition-colors hover:text-primary">Account settings</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-ink/5 pt-6 text-xs text-mute">
          © {new Date().getFullYear()} Strent. Built in Nairobi.
        </div>
      </div>
    </footer>
  );
}
