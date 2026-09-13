import "server-only";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// TEMPORARY: shared account used while Neon Auth's session proxy is broken
// in production (get-session throws "Invalid URL" — see currentUser.ts).
// Remove once sign-in works and callers go back to requiring a real session.
export const GUEST_USER_ID = "guest";
export const GUEST_USER_EMAIL = "guest@remynt.local";

// TEMPORARY: every new account (guest or real) starts with free credits so
// people can actually try the app before Stripe/credit packs exist. Real
// signed-in users previously started at 0 and immediately hit "Insufficient
// credits" on their first Generate. Revisit once purchasing is wired up.
const NEW_USER_FREE_CREDITS = 10;

/**
 * Neon Auth manages its own user/session tables; this upserts the
 * corresponding row in our own `users` table (which holds credit_balance)
 * the first time a signed-in user is seen.
 */
export async function getOrCreateAppUser(id: string, email: string) {
  const [existing] = await db.select().from(users).where(eq(users.id, id));
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({ id, email, creditBalance: NEW_USER_FREE_CREDITS })
    .returning();
  return created;
}
