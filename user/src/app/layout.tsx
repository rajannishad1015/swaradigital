import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.swaradigital.com"),
  title: {
    default: "SwaraDigital — Music Distribution Platform | Keep 100% Royalties",
    template: "%s | SwaraDigital",
  },
  description:
    "Distribute your music to Spotify, Apple Music, TikTok and 150+ platforms. Keep 100% of your royalties. Join 170k+ independent artists on SwaraDigital — the #1 music distribution platform.",
  keywords: [
    "music distribution",
    "music distribution platform India",
    "distribute music online",
    "independent artist distribution",
    "100% royalties music",
    "music distribution app",
    "upload music to Spotify",
    "upload music to Apple Music",
    "SwaraDigital",
    "SwaraDigital",
    "digital music distribution",
    "royalty free distribution",
  ],
  authors: [{ name: "SwaraDigital" }],
  creator: "SwaraDigital",
  publisher: "SwaraDigital",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.swaradigital.com",
    siteName: "SwaraDigital",
    title: "SwaraDigital — Music Distribution Platform | Keep 100% Royalties",
    description:
      "Distribute your music to Spotify, Apple Music, TikTok and 150+ platforms. Keep 100% of your royalties. Join 170k+ independent artists.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "SwaraDigital — Music Distribution Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwaraDigital — Music Distribution Platform | Keep 100% Royalties",
    description:
      "Distribute your music to Spotify, Apple Music, TikTok and 150+ platforms. Keep 100% of your royalties.",
    images: ["/logo.png"],
    creator: "@swaradigital",
  },
  alternates: {
    canonical: "https://www.swaradigital.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
