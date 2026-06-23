import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Bricolage_Grotesque,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "23media — Márkák, amik megmozgatnak.",
  description:
    "A 23media egy teljes körű kreatívstúdió, amely olyan márkákat, weboldalakat, tartalmakat és növekedési kampányokat épít, amik megmozgatják a kultúrát és a fontos mutatókat.",
  metadataBase: new URL("https://23media.studio"),
  openGraph: {
    title: "23media — Márkák, amik megmozgatnak.",
    description:
      "Teljes körű kreatívstúdió. Márka · Web · Tartalom · Hirdetés · Közösségi média.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hu"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${instrument.variable} antialiased`}
    >
      <body className="bg-ink text-bone">{children}</body>
    </html>
  );
}
