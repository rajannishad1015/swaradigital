"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, BarChart3, Wallet, Globe as GlobeIcon, Radio } from "lucide-react";
import Link from "next/link";
import { IndianPattern, FloatingMandala } from "@/components/ui/indian-patterns";
import Beams from "@/components/ui/beams";


export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A0A]">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <Beams className="absolute inset-0 h-full w-full pointer-events-none opacity-20" />
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Indian Patterns (Subtle) */}
        <div className="absolute inset-0 opacity-[0.15]">
            <IndianPattern />
        </div>
        <FloatingMandala className="top-[-10%] right-[-10%] opacity-[0.05] w-[600px] h-[600px] animate-slow-spin" />
        <FloatingMandala className="bottom-[-10%] left-[-10%] opacity-[0.05] w-[500px] h-[500px] animate-slow-spin-reverse" />

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-[#00FF88]/5 to-transparent rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-[#00FF88]/5 to-transparent rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 md:px-12 relative z-10 pt-24 pb-16 md:pt-40 md:pb-24">
        <div className="flex flex-col items-center text-center gap-10 max-w-4xl mx-auto">
          
          {/* Content */}
          <div className="space-y-8 relative z-20 flex flex-col items-center">
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 backdrop-blur-sm w-fit px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="h-2 w-2 rounded-full bg-[#00FF88] shadow-[0_0_10px_#00FF88]" />
              <span className="text-gray-300 text-xs font-bold tracking-[0.2em] uppercase">
                Global Reach, Local Control
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black italic text-white leading-[0.95] tracking-tighter">
                Get Discovered. <br/>
                <span className="text-white/40">Monetise.</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF88] via-[#00FFAA] to-[#00FFFF] animate-gradient-x bg-[length:200%_auto]">Grow.</span>
                </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-2xl text-gray-400 max-w-2xl leading-relaxed font-light"
            >
              The all-in-one music distribution platform. Release on Spotify, Apple Music, and 100+ stores while keeping <span className="text-white font-medium">100% of your earnings</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 pt-6"
            >
              <Link href="/signup">
                <Button className="h-16 px-10 bg-[#00FF88] hover:bg-[#00E078] text-black font-bold text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_#00FF88] border-none group relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative flex items-center gap-2">Start for Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </Button>
              </Link>
              
              <Link href="#features">
                <Button variant="outline" className="h-16 px-10 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white font-semibold text-lg rounded-full transition-all duration-300 flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Play className="w-3 h-3 fill-current" />
                  </div>
                  View Demo
                </Button>
              </Link>
            </motion.div>

            {/* Trusted By */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-12 border-t border-white/5 mt-12 w-full flex justify-center"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 group cursor-default">
                  <div className="flex items-center -space-x-5 transition-spacing duration-300 group-hover:-space-x-4">
                     {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-12 w-12 rounded-full border-[3px] border-[#0A0A0A] bg-gradient-to-br shadow-lg ${
                            i === 1 ? 'from-purple-500 to-indigo-600' :
                            i === 2 ? 'from-blue-500 to-cyan-500' :
                            i === 3 ? 'from-emerald-400 to-cyan-600' :
                            'from-orange-500 to-amber-600'
                        } flex items-center justify-center text-[10px] text-white font-bold relative z-${10-i} hover:z-20 hover:scale-110 transition-all duration-200`}>
                            {i === 4 ? '170k' : ''}
                        </div>
                     ))}
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                     <div className="flex gap-1 text-[#FFD700]">
                        {[1,2,3,4,5].map(s => (
                            <svg key={s} className="w-4 h-4 fill-current drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                        ))}
                     </div>
                     <p className="text-sm text-gray-400 font-medium">Joined by <span className="text-white font-bold">170k+</span> artists</p>
                  </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
