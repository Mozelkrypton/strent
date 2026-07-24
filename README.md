
# Strent

A house-seeking platform connecting tenants directly to landlords — listings with
photos and maps, in-app messaging to agree on payment and booking, no agent fees.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- Google Maps Embed API for listing location
- JWT cookie auth (roll your own — no third-party auth vendor)
- Built for M-Pesa (Daraja API) and Cloudinary, wired up as next steps below

## What's already built

- **Listings**: browse grid (`/`), detail page with photo gallery + map (`/listings/[id]`),
  landlord creation form (`/dashboard/listings/new`)
- **Auth**: register/login with hashed passwords + JWT session cookie, tenant vs landlord roles
- **Messaging**: `Conversation` + `Message` models, a poll-based `ChatPanel` component, and
  the API routes to back it (`/api/conversations`, `/api/messages`)
- **Photo upload**: drag-and-drop `ImageUploader` component that uploads straight from the
  browser to Cloudinary (signed by `/api/uploads/sign`, so files never pass through our
  server), wired into the "list a house" form
- **Database schema**: `User`, `Listing`, `ListingImage`, `Conversation`, `Message`, `Booking`
  — booking includes an `mpesaReceipt` field ready for the payment integration

## Setup

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL at minimum to run locally
npx prisma migrate dev --name init
npm run dev
```

You need a Postgres database — easiest options for a solo dev:

- Local: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16`
- Hosted free tier: Supabase, Railway, or Neon — copy the connection string into `DATABASE_URL`

Without `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` set, the map on a listing page shows a placeholder
instead of failing — get a key from Google Cloud Console with the "Maps Embed API" enabled.

## Next steps, roughly in build order

1. **Landlord verification** — before a listing is publicly visible, require an ID/proof-of-
   ownership upload and flip `User.verified` manually (or via a review queue) once checked.
   This is the single biggest trust lever for the platform — don't skip it.
2. **Booking + M-Pesa** — once a tenant and landlord agree in chat, either side triggers a
   `Booking` record; call the Daraja STK Push API to collect payment, and update
   `Booking.mpesaReceipt` from the callback webhook (`/api/payments/mpesa/callback`, not yet
   built).
3. **Real-time chat** — `ChatPanel` currently polls every 4s, which is fine for an MVP.
   Swap in Socket.io or Firebase Realtime DB once conversation volume makes polling feel slow.
4. **Search filters** — the `/api/listings` route already accepts `minPrice`, `maxPrice`,
   `bedrooms` query params; add a filter bar on the browse page next.
5. **Map-based search** — for browsing multiple pins at once (not just one listing's
   location), move from the Embed API to `@react-google-maps/api` with marker clustering.

## Security notes (worth doing before any real users touch this)

- Rotate `JWT_SECRET` out of `.env.example` before deploying — generate your own with
  `openssl rand -base64 32`.
- Rate-limit `/api/auth/login` and `/api/auth/register` to slow down credential stuffing.
- Validate `latitude`/`longitude` bounds server-side before saving a listing.
- Sanitize `Message.content` on render if you ever render it as HTML instead of plain text.
