import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "layer3studio — Premium Design & Engineering Studio",
  description:
    "Premium web products, SaaS UI, and full-stack builds by layer3studio. We design, build, and launch products that feel polished from day one.",
  openGraph: {
    title: "layer3studio — Premium Design & Engineering Studio",
    description: "Premium web products, SaaS UI, and full-stack builds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable}`}>
      <body>
        <div className="min-h-screen bg-radial-soft overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}