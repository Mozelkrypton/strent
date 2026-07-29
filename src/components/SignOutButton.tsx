"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
<<<<<<< HEAD
    <button onClick={handleSignOut} className="hover:text-clay">
=======
    <button onClick={handleSignOut} className="transition-colors hover:text-clay">
>>>>>>> master
      Sign out
    </button>
  );
}
