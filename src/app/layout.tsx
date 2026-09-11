import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NeonAuthUIProvider } from "@neondatabase/auth-ui";
import { authClient } from "@/lib/auth/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "Remynt",
  description: "Restyle your photo to match a reference look — while staying recognizably you.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Remynt",
  },
  openGraph: {
    title: "Remynt",
    description: "Restyle your photo to match a reference look — while staying recognizably you.",
    images: ["/logo-wordmark.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NeonAuthUIProvider authClient={authClient} emailOTP>
          {children}
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}
