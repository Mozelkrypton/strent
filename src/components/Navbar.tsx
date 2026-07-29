import Link from "next/link";
import { cookies } from "next/headers";
import { sessionManager, SESSION_COOKIE } from "@/lib/security/sessionManager";
import SignOutButton from "./SignOutButton";

export default async function Navbar() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await sessionManager.validate(token) : null;

  return (
<<<<<<< HEAD
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="font-display text-2xl italic font-bold tracking-tight text-clay">
          strent
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink">
          <Link href="/" className="hover:text-clay">
            Browse
          </Link>
          <Link href="/dashboard/listings/new" className="hover:text-clay">
=======
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
>>>>>>> master
            List a house
          </Link>
          {session ? (
            <>
<<<<<<< HEAD
              <Link href="/profile/edit" className="hover:text-clay">
=======
              <Link href="/profile/edit" className="transition-colors hover:text-clay">
>>>>>>> master
                {session.user.name.split(" ")[0]}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
<<<<<<< HEAD
              className="border-2 border-ink bg-clay px-3 py-1.5 font-medium text-paper shadow-[2px_2px_0_0_#211D16] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
=======
              className="rounded-full bg-clay px-4 py-2 font-medium text-paper shadow-card transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-lift"
>>>>>>> master
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
