import type { Metadata } from "next";
import { Inter, Sacramento, DM_Serif_Display, Playfair_Display } from "next/font/google";
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
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif"
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sanctuary-gift.vercel.app"),
  title: "Sanctuary | Create Your Digital Sanctuary",
  description: "The ultimate digital sanctuary for all of life's special moments. Birthdays, anniversaries, weddings, and more.",
  openGraph: {
    title: "Sanctuary",
    description: "The ultimate digital gift for your loved ones.",
    url: "https://sanctuary-gift.vercel.app",
    siteName: "Sanctuary",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sanctuary Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sanctuary",
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
      <body className={`${inter.variable} ${sacramento.variable} ${dmSerif.variable} ${playfair.variable} font-s-body`}>
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
