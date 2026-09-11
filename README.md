# Remynt

Restyle a photo to match a reference look — while keeping the person's face
recognizably the same. Next.js on Vercel, Neon Postgres + Neon Auth (Managed
Better Auth), Gemini (`gemini-3-pro-image` / Nano Banana Pro), Cloudflare R2,
Stripe.

## Setup

1. `npm install`
2. Link this app to your Neon project (creates `.neon`, `.env.local`, and
   `neon.ts`): `npx neon@latest init --skip-template --project-id <your-project-id> --service auth --agent claude-code`
   — or copy `.env.example` to `.env.local` by hand and fill in `DATABASE_URL`
   and `NEON_AUTH_BASE_URL` from the Neon console.
3. Generate a cookie secret and add it as `NEON_AUTH_COOKIE_SECRET` in
   `.env.local` (32+ chars): `openssl rand -base64 32`
4. Fill in the rest of `.env.local`:
   - **`GEMINI_API_KEY`** — Gemini API key with access to `gemini-3-pro-image`
   - **R2 keys** — a Cloudflare R2 bucket + API token
   - **Stripe keys** — secret key and a webhook signing secret (create the webhook endpoint at `/api/webhooks/stripe` once deployed)
5. Push the schema to Neon: `npm run db:push`
6. Seed placeholder reference styles: `npm run db:seed`
7. `npm run dev` and open [http://localhost:3000](http://localhost:3000)

## Auth

Uses Neon Auth (Managed Better Auth), not the older Stack-Auth-based
integration — `neon-auth status` on this project reports provider
`better_auth`. Wiring:
- `src/lib/auth/server.ts` — server instance (`createNeonAuth`)
- `src/lib/auth/client.ts` — client instance (`createAuthClient`)
- `src/app/api/auth/[...path]/route.ts` — auth API handler
- `src/app/auth/[path]/page.tsx` — sign-in/sign-up UI (`AuthView`)
- `src/lib/users.ts` — `getOrCreateAppUser`, which upserts our own `users`
  row (holding `credit_balance`) the first time a Neon Auth session is seen —
  Neon Auth's own user table is separate and doesn't carry app-specific fields.

## What's stubbed vs. real

- DB schema, auth, upload/style/generate/result flow, and credit accounting
  are wired end to end. Regenerate always spends a credit (no free-regen logic
  for v1 — see below).
- `src/lib/db/seed.ts` reference styles use placeholder images/prompts — swap
  in real curated reference photos and tuned `prompt_template` copy before
  launch.
- Stripe webhook's `CREDITS_BY_PRICE_ID` map (`src/app/api/webhooks/stripe/route.ts`)
  is empty — fill it in once the actual Payment Links / credit packs exist.

## Face-match confidence (deferred, not built)

The original design called for scoring each result against the source photo
(AWS Rekognition `CompareFaces`) and granting one free regen when the face
didn't match well. Dropped for v1 to avoid a new AWS account before launch —
regenerate always costs a credit for now. The `generations` table still has
`confidence_score`, `attempt_number`, `parent_generation_id`, and
`free_regen_used` columns so this can be added later without a schema
redesign; see `git log` around the initial scaffold commit for the original
Rekognition-based implementation if picking this back up.

## Mobile / Play Store plan

The app is mobile-first and a valid installable PWA (`src/app/manifest.ts`,
plus icons at `/icon-192.png` and `/icon-512.png`, generated from
`pics/` via `node scripts/generate-icons.mjs`). The plan is to wrap it as a
**TWA (Trusted Web Activity)** via [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
or [PWABuilder](https://www.pwabuilder.com/) once it's live on a real domain —
that's a thin native shell that opens this deployed site, not a separate app
codebase to maintain.

Before generating the TWA:
1. Deploy to the real production domain.
2. Fill in `src/app/.well-known/assetlinks.json/route.ts` with the Android
   package name and the SHA256 signing fingerprint Bubblewrap/PWABuilder gives you.

## Not yet built (see product spec)

- Admin UI for managing reference styles (currently DB-only via `db:seed`/`db:studio`)
- Regenerate button currently always calls generation on the same style; UI
  doesn't yet surface "this didn't match well, try again free" messaging
  differently from a paid regenerate
