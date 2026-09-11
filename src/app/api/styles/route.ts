import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { referenceStyles } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const styles = await db
    .select()
    .from(referenceStyles)
    .where(eq(referenceStyles.active, true))
    .orderBy(asc(referenceStyles.sortOrder));

  return NextResponse.json(styles);
}
