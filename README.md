# Remynt

Restyle a photo to match a reference look — while keeping the person's face
recognizably the same. Next.js on Vercel, Neon Postgres + Neon Auth, Gemini
(`gemini-3-pro-image` / Nano Banana Pro), Cloudflare R2, Stripe.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in:
   - **`DATABASE_URL`** — from your Neon project
   - **Neon Auth keys** — enable Neon Auth on the Neon project, copy the three keys it generates
   - **`GEMINI_API_KEY`** — Gemini API key with access to `gemini-3-pro-image`
   - **AWS keys** — an IAM user scoped to `rekognition:CompareFaces` only
   - **R2 keys** — a Cloudflare R2 bucket + API token
   - **Stripe keys** — secret key and a webhook signing secret (create the webhook endpoint at `/api/webhooks/stripe` once deployed)
3. Push the schema to Neon: `npm run db:push`
4. Seed placeholder reference styles: `npm run db:seed`
5. `npm run dev` and open [http://localhost:3000](http://localhost:3000)

## What's stubbed vs. real

- DB schema, auth, upload/style/generate/result flow, credit accounting, and
  the face-match-confidence + one-time-free-regen logic are wired end to end.
- `src/lib/db/seed.ts` reference styles use placeholder images/prompts — swap
  in real curated reference photos and tuned `prompt_template` copy before
  launch.
- Stripe webhook's `CREDITS_BY_PRICE_ID` map (`src/app/api/webhooks/stripe/route.ts`)
  is empty — fill it in once the actual Payment Links / credit packs exist.
- `FREE_REGEN_CONFIDENCE_THRESHOLD` (`src/lib/faceMatch.ts`) is a starting
  guess (78/100) — needs calibrating against real generations.

## Mobile / Play Store plan

The app is mobile-first and a valid installable PWA (`src/app/manifest.ts`,
plus generated icons at `/icon-192` and `/icon-512`). The plan is to wrap it
as a **TWA (Trusted Web Activity)** via [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
or [PWABuilder](https://www.pwabuilder.com/) once it's live on a real domain —
that's a thin native shell that opens this deployed site, not a separate app
codebase to maintain.

Before generating the TWA:
1. Deploy to the real production domain.
2. Fill in `src/app/.well-known/assetlinks.json/route.ts` with the Android
   package name and the SHA256 signing fingerprint Bubblewrap/PWABuilder gives you.
3. Swap the placeholder "R" icons in `src/app/icon-192/route.tsx` and
   `icon-512/route.tsx` for real branding.

## Not yet built (see product spec)

- Admin UI for managing reference styles (currently DB-only via `db:seed`/`db:studio`)
- Regenerate button currently always calls generation on the same style; UI
  doesn't yet surface "this didn't match well, try again free" messaging
  differently from a paid regenerate
