import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
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
  const { data: session } = await auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const [current] = await db.select().from(generations).where(eq(generations.id, id));

  if (!current || current.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rootId = current.parentGenerationId ?? current.id;
  const [root] = await db.select().from(generations).where(eq(generations.id, rootId));
  if (!root) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const appUser = await getOrCreateAppUser(session.user.id, session.user.email);
  if (appUser.creditBalance < CREDIT_COST_PER_GENERATION) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(users)
      .set({ creditBalance: sql`${users.creditBalance} - ${CREDIT_COST_PER_GENERATION}` })
      .where(eq(users.id, session.user.id));

    await tx.insert(creditTransactions).values({
      userId: session.user.id,
      amount: -CREDIT_COST_PER_GENERATION,
      type: "spend",
    });
  });

  // Always regenerate from the original upload, not from a previous stylized result.
  const sourceImage = await downloadImage(root.sourceImageUrl);

  const generation = await runGeneration({
    userId: session.user.id,
    referenceStyleId: current.referenceStyleId,
    sourceImage,
    sourceMimeType: root.sourceMimeType,
    attemptNumber: current.attemptNumber + 1,
    parentGenerationId: rootId,
    creditCharged: true,
  });

  return NextResponse.json(await withSignedUrls(generation));
}
