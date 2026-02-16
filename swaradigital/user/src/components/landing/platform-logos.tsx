"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Define the platform logos with paths and dimensions
// Users will upload custom images to public/assets/logos/
const platforms: { name: string; logo: string; width: number; height: number }[] = [
  { name: "Spotify", logo: "/assets/logos/66af509c1da979ff4ba09e63_spotify.webp", width: 100, height: 35 },
  { name: "Apple Music", logo: "/assets/logos/66af509cd3076ed98e01769c_apple.webp", width: 100, height: 35 },
  { name: "YouTube Music", logo: "/assets/logos/66af509cdba6c4f6a06ce615_youtube.webp", width: 100, height: 35 },
  { name: "JioSaavn", logo: "/assets/logos/66af509ce30b267f537d7dbc_jio.webp", width: 100, height: 35 },
  { name: "Amazon Music", logo: "/assets/logos/66af509ce30b267f537d7e28_amazon.webp", width: 100, height: 35 },
  { name: "Deezer", logo: "/assets/logos/66af509c531437b23665284c_deezer.webp", width: 100, height: 35 },
  { name: "Instagram", logo: "/assets/logos/66af509c7661e5c27bada11d_instagram.webp", width: 100, height: 35 },
  { name: "Anghami", logo: "/assets/logos/66af509ceb7eaac4d19cd557_anghami.webp", width: 100, height: 35 },
];

export function PlatformLogos() {
  return (
    <div className="py-8 bg-black border-y border-white/10 relative z-20 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-[10px] font-bold text-white/40 uppercase tracking-[0.3em]">
          Trusted Delivery To 150+ Networks
        </p>
      </div>
      
      <div className="flex relative overflow-hidden mask-gradient-x">
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-black via-black/90 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-black via-black/90 to-transparent pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-12 md:gap-24 items-center whitespace-nowrap min-w-max px-4 md:px-12"
        >
          {/* Double the array for seamless loop */}
          {[...platforms, ...platforms].map((platform, i) => (
            <div
              key={`${platform.name}-${i}`}
              className="relative flex items-center justify-center px-4"
            >
              <div className="relative h-10 w-auto min-w-[100px] flex items-center justify-center">
                 {/* Fallback to text if image fails to load (user needs to upload) */}
                 <Image
                    src={platform.logo}
                    alt={platform.name}
                    width={120}
                    height={40}
                    className="object-contain h-8 w-auto max-w-[120px] opacity-80 hover:opacity-100 transition-opacity duration-300"
                    onError={(e) => {
                      // If image fails, hide it and show text fallback logic (conceptually)
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('fallback-text');
                    }}
                 />
                 <span className="hidden fallback-text:block text-white/50 font-bold text-xl uppercase tracking-widest absolute inset-0 flex items-center justify-center">{platform.name}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
