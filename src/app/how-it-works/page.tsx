export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">How Strent works</h1>
      <p className="mt-3 max-w-xl text-lg text-mute">
        No agents, no markup — just tenants and landlords talking directly.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <section className="rounded-3xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">If you&apos;re looking for a house</h2>
          <ol className="mt-4 space-y-3 text-sm text-ink/80">
            <li>1. Browse listings by grid or map, and filter by price or bedrooms.</li>
            <li>2. Create a free account to message a landlord directly.</li>
            <li>3. Ask about viewing, price, or availability in the chat.</li>
            <li>4. Agree on a booking with the landlord you&apos;re talking to.</li>
          </ol>
        </section>

        <section className="rounded-3xl bg-surface p-6 shadow-card">
          <h2 className="font-display text-lg font-bold text-ink">If you have a house to list</h2>
          <ol className="mt-4 space-y-3 text-sm text-ink/80">
            <li>1. Create a landlord account and add your listing with photos.</li>
            <li>2. Pin the exact location on the map so tenants can find it.</li>
            <li>3. Reply to tenant messages straight from your dashboard.</li>
            <li>4. Verified landlords carry a badge tenants can see and trust.</li>
          </ol>
        </section>
      </div>

      <section className="mt-6 rounded-3xl bg-primary-light p-6">
        <h2 className="font-display text-lg font-bold text-primary-dark">Why the Verified badge matters</h2>
        <p className="mt-2 text-sm text-ink/80">
          A verified landlord has confirmed their identity and ownership or authority to let out the property.
          It&apos;s not a guarantee, but it&apos;s a real check — look for the badge, and be cautious with listings
          that don&apos;t have it yet.
        </p>
      </section>
    </div>
  );
}
