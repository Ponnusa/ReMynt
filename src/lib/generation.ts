import "server-only";
import { db } from "@/lib/db";
import { generations, referenceStyles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { uploadImage, getSignedImageUrl } from "@/lib/storage";
import { generateStyledImage } from "@/lib/gemini";

type RunGenerationArgs = {
  userId: string;
  referenceStyleId: string;
  sourceImage: Buffer;
  sourceMimeType: string;
  attemptNumber?: number;
  parentGenerationId?: string;
  creditCharged: boolean;
};

/**
 * Runs one generation attempt end to end: upload source, call Gemini, upload
 * result, persist the row. Shared by both the initial generate call and the
 * regenerate call — they only differ in attempt/parent bookkeeping.
 */
export async function runGeneration({
  userId,
  referenceStyleId,
  sourceImage,
  sourceMimeType,
  attemptNumber = 1,
  parentGenerationId,
  creditCharged,
}: RunGenerationArgs) {
  const [style] = await db
    .select()
    .from(referenceStyles)
    .where(eq(referenceStyles.id, referenceStyleId));

  if (!style) throw new Error("Reference style not found");

  const sourceKey = await uploadImage(sourceImage, sourceMimeType, "sources");

  const [row] = await db
    .insert(generations)
    .values({
      userId,
      referenceStyleId,
      sourceImageUrl: sourceKey,
      sourceMimeType,
      status: "processing",
      attemptNumber,
      parentGenerationId,
      creditCharged,
    })
    .returning();

  try {
    const resultBuffer = await generateStyledImage(
      sourceImage,
      sourceMimeType,
      style.promptTemplate
    );
    const resultKey = await uploadImage(resultBuffer, "image/png", "results");

    const [updated] = await db
      .update(generations)
      .set({
        status: "complete",
        resultImageUrl: resultKey,
      })
      .where(eq(generations.id, row.id))
      .returning();

    return updated;
  } catch (err) {
    await db
      .update(generations)
      .set({ status: "failed" })
      .where(eq(generations.id, row.id));
    throw err;
  }
}

export async function withSignedUrls<T extends { sourceImageUrl: string; resultImageUrl: string | null }>(
  generation: T
) {
  return {
    ...generation,
    sourceImageUrl: await getSignedImageUrl(generation.sourceImageUrl),
    resultImageUrl: generation.resultImageUrl
      ? await getSignedImageUrl(generation.resultImageUrl)
      : null,
  };
}
