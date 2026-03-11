import type { Metadata } from "next";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { PlatformLogos } from "@/components/landing/platform-logos";
import { Distribution } from "@/components/landing/distribution";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { LandingStyles } from "@/components/landing/landing-styles";

export const metadata: Metadata = {
  title: "SwaraDigital — Music Distribution Platform | Keep 100% Royalties",
  description:
    "Distribute your music to Spotify, Apple Music, TikTok and 150+ platforms worldwide. Keep 100% of your royalties. Join 170k+ independent artists on SwaraDigital.",
  alternates: {
    canonical: "https://www.swaradigital.com",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SwaraDigital",
  url: "https://www.swaradigital.com",
  description:
    "Music distribution platform that lets independent artists distribute to 150+ stores while keeping 100% of royalties.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.swaradigital.com/search?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "SwaraDigital",
  url: "https://www.swaradigital.com",
  logo: "https://www.swaradigital.com/logo.png",
  description:
    "SwaraDigital is an independent music distribution platform empowering artists across India and the world.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@swaradigital.com",
    contactType: "customer support",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://twitter.com/swaradigital",
    "https://instagram.com/swaradigital",
    "https://github.com/swaradigital",
  ],
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SwaraDigital",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web",
  url: "https://www.swaradigital.com",
  description:
    "All-in-one music distribution platform. Release on Spotify, Apple Music, and 100+ stores while keeping 100% of your earnings.",
  offers: {
    "@type": "Offer",
    price: "19.99",
    priceCurrency: "USD",
    priceValidUntil: "2026-12-31",
    seller: {
      "@type": "Organization",
      name: "SwaraDigital",
    },
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "170000",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does SwaraDigital cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SwaraDigital's Pro Artist plan starts at $19.99/year with unlimited distribution and 100% royalties. Enterprise / Label plans are available with custom pricing.",
      },
    },
    {
      "@type": "Question",
      name: "Do I keep 100% of my royalties with SwaraDigital?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. SwaraDigital does not take any cut from your royalties. You keep 100% of your earnings from all streaming platforms.",
      },
    },
    {
      "@type": "Question",
      name: "Which platforms does SwaraDigital distribute to?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SwaraDigital distributes your music to 150+ platforms including Spotify, Apple Music, YouTube Music, TikTok, Amazon Music, Instagram, Pandora, Tidal, iHeartRadio, and Deezer.",
      },
    },
    {
      "@type": "Question",
      name: "How long does it take for music to go live on streaming platforms?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SwaraDigital's ultra-fast upload process gets your music live on major streaming platforms faster than traditional distributors. Most releases appear within 24–72 hours.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <LandingStyles />
      <main className="swara-landing" style={{ minHeight: "100vh", background: "#070707" }}>
        <Navbar />
        <Hero />
        <PlatformLogos />
        <Distribution />
        <Features />
        <Pricing />
        <Footer />
      </main>
    </>
  );
}
