import type { MetadataRoute } from "next";

// Powers both browser "install" prompts and the future Play Store TWA shell —
// the TWA just opens this app in a Chrome tab styled per this manifest.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Remynt",
    short_name: "Remynt",
    description:
      "Restyle your photo to match a reference look — while staying recognizably you.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#c026d3",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
