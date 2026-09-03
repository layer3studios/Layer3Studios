import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { company, seo } from "@/brand";

/**
 * Three faces, three jobs:
 *   Instrument Serif — the report. Display only, used large and sparingly.
 *   Inter Tight      — prose.
 *   JetBrains Mono   — anything a machine produced: paths, severities, counts.
 */

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-face",
  display: "swap",
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  appleWebApp: {
    capable: true,
    // Black-translucent lets the page run under the status bar and the
    // island, which is what makes the safe-area handling matter.
    statusBarStyle: "black-translucent",
    title: company.name,
  },
  openGraph: {
    title: seo.title,
    description: seo.description,
    siteName: company.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  /**
   * Draws the page edge to edge, underneath the notch, Dynamic Island and home
   * indicator. Required for env(safe-area-inset-*) to report anything — the
   * insets are then paid back in globals.css.
   */
  viewportFit: "cover",
  /** Zoom stays enabled. Locking it out is an accessibility failure. */
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="grain">{children}</body>
    </html>
  );
}
