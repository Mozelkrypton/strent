import Link from "next/link";
import { cookies } from "next/headers";
import { sessionManager, SESSION_COOKIE } from "@/lib/security/sessionManager";
import SignOutButton from "./SignOutButton";

export default async function Navbar() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await sessionManager.validate(token) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-2xl italic font-bold tracking-tight text-clay transition-transform duration-200 ease-smooth hover:-translate-y-0.5">
          strent
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink">
          <Link href="/" className="transition-colors hover:text-clay">
            Browse
          </Link>
          <Link href="/dashboard/listings/new" className="transition-colors hover:text-clay">
            List a house
          </Link>
          {session ? (
            <>
              <Link href="/profile/edit" className="transition-colors hover:text-clay">
                {session.user.name.split(" ")[0]}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-clay px-4 py-2 font-medium text-paper shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-lift"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
