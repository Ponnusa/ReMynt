import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getOrCreateAppUser } from "@/lib/users";
import { db } from "@/lib/db";
import { users, creditTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { runGeneration, withSignedUrls } from "@/lib/generation";

const CREDIT_COST_PER_GENERATION = 1;

export async function POST(request: Request) {
  const { id: userId, email } = await getCurrentUser();

  const formData = await request.formData();
  const file = formData.get("sourceImage");
  const referenceStyleId = formData.get("referenceStyleId");

  if (!(file instanceof File) || typeof referenceStyleId !== "string") {
    return NextResponse.json({ error: "Missing sourceImage or referenceStyleId" }, { status: 400 });
  }

  const appUser = await getOrCreateAppUser(userId, email);
  if (appUser.creditBalance < CREDIT_COST_PER_GENERATION) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} - ${CREDIT_COST_PER_GENERATION}` })
      .where(eq(users.id, userId));

    await tx.insert(creditTransactions).values({
      userId,
      amount: -CREDIT_COST_PER_GENERATION,
      type: "spend",
    });
  });

  const sourceImage = Buffer.from(await file.arrayBuffer());

  const generation = await runGeneration({
    userId,
    referenceStyleId,
    sourceImage,
    sourceMimeType: file.type,
    creditCharged: true,
  });

  return NextResponse.json(await withSignedUrls(generation));
}
