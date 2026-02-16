import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { PlatformLogos } from "@/components/landing/platform-logos";
import { Distribution } from "@/components/landing/distribution";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <PlatformLogos />
      <Distribution />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
