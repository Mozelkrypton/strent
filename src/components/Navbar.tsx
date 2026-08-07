import Link from "next/link";
import { cookies } from "next/headers";
import { sessionManager, SESSION_COOKIE } from "@/lib/security/sessionManager";
import { getUnreadMessageCount } from "@/lib/messaging/conversationAccess";
import SignOutButton from "./SignOutButton";
import MoreMenu from "./MoreMenu";

export default async function Navbar() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = token ? await sessionManager.validate(token) : null;
  const unreadCount = session ? await getUnreadMessageCount(session.user.id, session.user.role) : 0;
  const role = session?.user.role;

  return (
    <header className="sticky top-0 z-30 border-b border-ink/5 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary font-display text-sm font-extrabold text-white">
            S
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-ink">strent</span>
        </Link>

        {/* Full nav lives at lg+ only — below that, the hamburger is the single
            source of truth, not a duplicate of what's shown here. */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink lg:flex">
          <Link href="/" className="transition-colors hover:text-primary">
            Browse
          </Link>
          {role !== "TENANT" && role !== "ADMIN" && (
            <Link href="/dashboard" className="transition-colors hover:text-primary">
              List a house
            </Link>
          )}
          <Link href="/how-it-works" className="transition-colors hover:text-primary">
            How it works
          </Link>
          <Link href="/help" className="transition-colors hover:text-primary">
            Help & safety
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-4 text-sm font-medium text-ink lg:flex">
            {session ? (
              <>
                {role === "ADMIN" && (
                  <Link href="/admin" className="transition-colors hover:text-primary">
                    Admin
                  </Link>
                )}
                {role !== "ADMIN" && (
                  <Link href="/messages" className="relative transition-colors hover:text-primary">
                    Messages
                    {unreadCount > 0 && (
                      <span className="absolute -right-3 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )}
                {role === "TENANT" && (
                  <>
                    <Link href="/cart" className="transition-colors hover:text-primary">
                      Saved
                    </Link>
                    <Link href="/bookings" className="transition-colors hover:text-primary">
                      Bookings
                    </Link>
                  </>
                )}
                {role === "LANDLORD" && (
                  <Link href="/dashboard/bookings" className="transition-colors hover:text-primary">
                    Bookings
                  </Link>
                )}
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
          </div>

          {/* Mobile/tablet only — the inline nav above already covers lg+,
              so this isn't a duplicate, it's the only nav below that breakpoint. */}
          <div className="lg:hidden">
            <MoreMenu
              signedIn={!!session}
              firstName={session?.user.name.split(" ")[0]}
              isTenant={role === "TENANT"}
              isLandlord={role === "LANDLORD"}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
