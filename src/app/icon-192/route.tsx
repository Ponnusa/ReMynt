import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

// Placeholder app icon — swap for real branding before shipping.
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8734a",
          fontSize: 110,
          fontWeight: 700,
          color: "#fff8f0",
          fontFamily: "sans-serif",
        }}
      >
        R
      </div>
    ),
    { ...size }
  );
}
