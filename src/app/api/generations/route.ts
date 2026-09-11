import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import { db } from "@/lib/db";
import { users, creditTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { runGeneration, withSignedUrls } from "@/lib/generation";

const CREDIT_COST_PER_GENERATION = 1;

export async function POST(request: Request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("sourceImage");
  const referenceStyleId = formData.get("referenceStyleId");

  if (!(file instanceof File) || typeof referenceStyleId !== "string") {
    return NextResponse.json({ error: "Missing sourceImage or referenceStyleId" }, { status: 400 });
  }

  const [appUser] = await db.select().from(users).where(eq(users.id, user.id));
  if (!appUser || appUser.creditBalance < CREDIT_COST_PER_GENERATION) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} - ${CREDIT_COST_PER_GENERATION}` })
      .where(eq(users.id, user.id));

    await tx.insert(creditTransactions).values({
      userId: user.id,
      amount: -CREDIT_COST_PER_GENERATION,
      type: "spend",
    });
  });

  const sourceImage = Buffer.from(await file.arrayBuffer());

  const generation = await runGeneration({
    userId: user.id,
    referenceStyleId,
    sourceImage,
    sourceMimeType: file.type,
    creditCharged: true,
  });

  return NextResponse.json(await withSignedUrls(generation));
}
