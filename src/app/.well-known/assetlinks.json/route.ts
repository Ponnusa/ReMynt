import { NextResponse } from "next/server";

// Digital Asset Links file required for the Play Store TWA shell to open this
// site without a browser address bar. Fill in `package_name` and
// `sha256_cert_fingerprints` once the Android app is generated (via Bubblewrap
// or PWABuilder) and signed — the fingerprint comes from that signing key.
export function GET() {
  return NextResponse.json([]);
}
