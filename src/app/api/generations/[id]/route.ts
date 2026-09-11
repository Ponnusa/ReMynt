import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/currentUser";
import { db } from "@/lib/db";
import { generations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withSignedUrls } from "@/lib/generation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await getCurrentUser();

  const { id } = await params;
  const [generation] = await db.select().from(generations).where(eq(generations.id, id));

  if (!generation || generation.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(await withSignedUrls(generation));
}
