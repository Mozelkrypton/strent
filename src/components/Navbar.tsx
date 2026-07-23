import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-brand-600">
          strent
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-600">
          <Link href="/">Browse</Link>
          <Link href="/dashboard/listings/new">List a house</Link>
          <Link href="/login" className="rounded-md bg-brand-500 px-3 py-1.5 text-white">
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
