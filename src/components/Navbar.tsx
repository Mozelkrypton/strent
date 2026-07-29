import Link from "next/link";
import { cookies } from "next/headers";
import { sessionManager, SESSION_COOKIE } from "@/lib/security/sessionManager";
import SignOutButton from "./SignOutButton";

export default async function Navbar() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await sessionManager.validate(token) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-extrabold text-white">
            S
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">strent</span>
        </Link>
        <nav className="flex items-center gap-7 text-sm font-medium text-ink">
          <Link href="/" className="transition-colors hover:text-primary">
            Browse
          </Link>
          <Link href="/dashboard/listings/new" className="transition-colors hover:text-primary">
            List a house
          </Link>
          {session ? (
            <>
              <Link href="/profile/edit" className="transition-colors hover:text-primary">
                {session.user.name.split(" ")[0]}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lift"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
