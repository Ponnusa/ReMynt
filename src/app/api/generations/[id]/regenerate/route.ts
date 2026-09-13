import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { getOrCreateAppUser } from "@/lib/users";
import { db } from "@/lib/db";
import { generations, users, creditTransactions } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { downloadImage } from "@/lib/storage";
import { runGeneration, withSignedUrls } from "@/lib/generation";

const CREDIT_COST_PER_GENERATION = 1;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId, email } = await getCurrentUser();

  const { id } = await params;
  const [current] = await db.select().from(generations).where(eq(generations.id, id));

  if (!current || current.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rootId = current.parentGenerationId ?? current.id;
  const [root] = await db.select().from(generations).where(eq(generations.id, rootId));
  if (!root) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  // Always regenerate from the original upload, not from a previous stylized result.
  const sourceImage = await downloadImage(root.sourceImageUrl);

  const generation = await runGeneration({
    userId,
    referenceStyleId: current.referenceStyleId,
    sourceImage,
    sourceMimeType: root.sourceMimeType,
    attemptNumber: current.attemptNumber + 1,
    parentGenerationId: rootId,
    creditCharged: true,
    options: current.options,
  });

  return NextResponse.json(await withSignedUrls(generation));
}
