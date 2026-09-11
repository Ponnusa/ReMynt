import { NextResponse } from "next/server";
import { SAMPLE_PHOTOS } from "@/lib/samplePhotos";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const photo = SAMPLE_PHOTOS.find((p) => p.id === id);
  if (!photo) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Proxied server-side (rather than fetched directly by the browser) so the
  // client doesn't depend on the R2 public domain's CORS headers.
  const upstream = await fetch(photo.url);
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
