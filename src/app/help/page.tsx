export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Help & safety</h1>
      <p className="mt-3 max-w-xl text-lg text-mute">
        A few habits that keep house hunting safe, whichever side of the deal you&apos;re on.
      </p>

      <div className="mt-10 space-y-4">
        <section className="rounded-3xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">Before you pay anything</h2>
          <p className="mt-2 text-sm text-ink/80">
            Insist on viewing the house in person before sending a deposit. A landlord who refuses a viewing,
            or who is always &quot;traveling&quot; and can only take payment upfront, is the single biggest warning sign
            in rental scams everywhere — not just here.
          </p>
        </section>

        <section className="rounded-3xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">Keep the conversation on the platform</h2>
          <p className="mt-2 text-sm text-ink/80">
            Messaging through Strent keeps a record of what was agreed — price, dates, condition of the house.
            If a conversation moves entirely to WhatsApp or a phone call before you&apos;ve even met, there&apos;s no
            record left if something goes wrong.
          </p>
        </section>

        <section className="rounded-3xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">Look for the Verified badge</h2>
          <p className="mt-2 text-sm text-ink/80">
            It means the landlord has confirmed their identity and their right to let out the property.
            It&apos;s a real check, not just a checkmark — but still verify the house itself in person.
          </p>
        </section>

        <section className="rounded-3xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">Account and password safety</h2>
          <p className="mt-2 text-sm text-ink/80">
            Turn on two-factor authentication in your{" "}
            <a href="/profile/edit" className="text-primary hover:underline">profile settings</a>, and use a
            password you don&apos;t reuse elsewhere. If you ever suspect your account was accessed by someone
            else, you can see and sign out every device from the same settings page.
          </p>
        </section>
      </div>
    </div>
  );
}
