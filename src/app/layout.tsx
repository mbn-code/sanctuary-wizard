import type { Metadata } from "next";
import { Inter, Sacramento } from "next/font/google";
import "./globals.css";
import MagicCursor from "@/components/MagicCursor";
import CookieBanner from "@/components/CookieBanner";
import { SanctuaryProvider } from "@/utils/SanctuaryContext";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sacramento = Sacramento({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-sacramento" 
});

export const metadata: Metadata = {
  metadataBase: new URL("https://magicgift.vercel.app"),
  title: "Magic Gift | The Digital Sanctuary Wizard",
  description: "Create a personalized interactive sanctuary for any life event. Birthdays, Anniversaries, Weddings, and more. The ultimate digital surprise.",
  openGraph: {
    title: "Magic Gift | Digital Sanctuary Wizard",
    description: "Build a timed countdown of memories, music, and secret messages for your loved ones.",
    url: "https://magicgift.vercel.app",
    siteName: "Magic Gift",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Magic Gift Sanctuary Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Gift ✨",
    description: "Create a digital sanctuary for your loved ones. Photos, music, and secret notes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sacramento.variable} font-sans`}>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <SanctuaryProvider>
          <MagicCursor />
          <CookieBanner />
          {children}
          <Analytics />
          <SpeedInsights />
        </SanctuaryProvider>
      </body>
    </html>
  );
}
