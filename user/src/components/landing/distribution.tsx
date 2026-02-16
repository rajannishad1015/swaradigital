"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { FloatingMandala, IndianPattern } from "@/components/ui/indian-patterns";

const stores = [
  { name: "Spotify", src: "/assets/logos/66af509c1da979ff4ba09e63_spotify.webp", width: 40, height: 40 },
  { name: "Apple Music", src: "/assets/logos/66af509cd3076ed98e01769c_apple.webp", width: 40, height: 40 },
  { name: "YouTube Music", src: "/assets/logos/66af509cdba6c4f6a06ce615_youtube.webp", width: 40, height: 40 },
  { name: "Instagram", src: "/assets/logos/66af509c7661e5c27bada11d_instagram.webp", width: 40, height: 40 },
  { name: "Amazon Music", src: "/assets/logos/66af509ce30b267f537d7e28_amazon.webp", width: 40, height: 40 },
  { name: "TikTok", src: "/assets/logos/66af509cc72f69324545af72_tiktok.webp", width: 40, height: 40 },
];

export function Distribution() {
  return (
    <section className="pt-10 pb-20 lg:pt-16 lg:pb-24 relative overflow-hidden bg-slate-50">
      
      {/* Dynamic Animated Aurora Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[30vw] h-[30vw] bg-purple-200/40 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[10%] w-[35vw] h-[35vw] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply"
        />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[0%] left-[20%] w-[40vw] h-[40vw] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"
        />
      </div>

      {/* Grid Overlay for structure */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Marquee Strip - Independent Not Alone */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[120%] -rotate-1 z-0 pointer-events-none select-none opacity-80 mix-blend-multiply">
        <div className="bg-[#ccff00] overflow-hidden py-4 border-y-4 border-black shadow-sm transform scale-110">
             <motion.div 
               className="flex whitespace-nowrap"
               animate={{ x: "-50%" }}
               transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
             >
                {Array(20).fill("INDEPENDENT NOT ALONE").map((text, i) => (
                   <span key={i} className="text-3xl md:text-5xl lg:text-7xl font-black text-black mx-4 md:mx-8 uppercase italic tracking-tighter">
                      {text}
                   </span>
                ))}
             </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Copy */}
          <div className="space-y-10">
             {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 shadow-sm text-indigo-900 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              Global Distribution
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight font-display"
            >
              One upload. <br/>
              <span className="text-indigo-600">Everywhere.</span>
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-6 text-xl text-slate-600 max-w-lg leading-relaxed"
            >
              <p>
                Manage your entire music catalog from one beautiful dashboard. We push your tracks to <span className="text-slate-900 font-semibold">Spotify, Apple Music, Instagram</span> and 150+ others instantly.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> 100% Royalties
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Monthly Payouts
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Content ID
                 </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="pt-4"
            >
              <Link href="/signup">
                <Button className="h-14 px-8 bg-slate-900 text-white hover:bg-slate-800 font-semibold text-lg rounded-full transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  Start Distributing <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Platform Grid Visualization */}
          <div className="relative perspective-1000 lg:h-[600px] flex items-center justify-center">
            <PlatformGrid />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformGrid() {
  return (
    <div className="relative w-full max-w-lg flex flex-col items-center justify-center gap-6 z-20">
       
       {/* Row 1: Spotify, Apple, TikTok (Brand Colors) */}
       <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <PlatformCard icon="/assets/logos/spotify-logo-icon.webp" name="Spotify" variant="black" />
          <PlatformCard icon="/assets/logos/apple-music-logo-icon.webp" name="Apple Music" variant="red" />
          <PlatformCard icon="/assets/logos/tiktok-logo-icon.webp" name="TikTok" variant="black" />
       </div>

       {/* Row 2: Pandora, Amazon, Instagram, YouTube */}
       <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <PlatformCard icon="/assets/logos/pandora.png" name="Pandora" variant="white-pandora" /> 
          <PlatformCard icon="/assets/logos/amazon-music-logo-icon.webp" name="Amazon Music" variant="blue-purple" />
          <PlatformCard icon="/assets/logos/instagram_new.png" name="Instagram" variant="orange-purple" />
          <PlatformCard icon="/assets/logos/youtube_new.png" name="YouTube Music" variant="white-youtube" />
       </div>

       {/* Row 3: Tidal, iHeartRadio, Deezer */}
       <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          <PlatformCard icon="/assets/logos/tidal.png" name="Tidal" variant="black" />
          <PlatformCard icon="/assets/logos/iheartradio.png" name="iHeartRadio" variant="red-heart" />
          <PlatformCard icon="/assets/logos/deezer_new.png" name="Deezer" variant="black" />
       </div>

       {/* "+ more" text */}
       <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-4 text-center"
       >
         <span className="text-xl font-bold text-slate-400 font-display tracking-tight hover:text-indigo-600 transition-colors cursor-default">+ more</span>
       </motion.div>
       
    </div>
  );
}

function PlatformCard({ icon, name, variant = "white" }: { icon: string, name: string, variant?: string }) {
    
    return (
        <motion.div 
            whileHover={{ y: -5, scale: 1.1 }}
            className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center relative group"
        >
            <div className="relative w-full h-full flex items-center justify-center p-2">
                <Image 
                    src={icon} 
                    alt={name} 
                    fill 
                    className="object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-md" 
                />
            </div>
        </motion.div>
    );
}

