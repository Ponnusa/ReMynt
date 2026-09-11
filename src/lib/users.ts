import "server-only";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    .values({ id, email, creditBalance: 0 })
    .returning();
  return created;
}
