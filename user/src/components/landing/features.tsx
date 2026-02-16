"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import {
  Globe,
  BarChart3,
  Wallet,
  Zap,
  ShieldCheck,
  Headphones,
  Music2,
  Share2,
  TrendingUp,
} from "lucide-react";



import { MusicPattern } from "../ui/music-pattern";

export function Features() {
  const items = [
    {
      title: "Global Distribution",
      description: "Get your music on Spotify, Apple Music, TikTok, and 150+ other stores worldwide.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 items-center justify-center border border-blue-100">
          <Globe className="w-10 h-10 text-blue-500" />
        </div>
      ),
      className: "md:col-span-2",
      icon: <Share2 className="h-4 w-4 text-slate-400" />,
    },
    {
      title: "Real-time Analytics",
      description: "Track your performance with detailed insights on streams, listeners, and earnings.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 items-center justify-center border border-purple-100">
           <BarChart3 className="w-10 h-10 text-purple-500" />
        </div>
      ),
      className: "md:col-span-1",
      icon: <TrendingUp className="h-4 w-4 text-slate-400" />,
    },
    {
      title: "100% Royalties",
      description: "Keep every cent you earn. We believe artists should be paid fairly for their work.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 items-center justify-center border border-green-100">
            <Wallet className="w-10 h-10 text-emerald-500" />
        </div>
      ),
      className: "md:col-span-1",
      icon: <Wallet className="h-4 w-4 text-slate-400" />,
    },
    {
      title: "Ultra-Fast Uploads",
      description: "Our streamlined process gets your music live faster than ever before.",
      header: (
        <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 items-center justify-center border border-amber-100">
            <Zap className="w-10 h-10 text-amber-500" />
        </div>
      ),
      className: "md:col-span-2",
      icon: <Zap className="h-4 w-4 text-slate-400" />,
    },
    {
       title: "Secure & Verified",
       description: "Your data and rights are protected with industry-leading security measures.",
       header: (
         <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 items-center justify-center border border-slate-100">
              <ShieldCheck className="w-10 h-10 text-slate-500" />
         </div>
       ),
       className: "md:col-span-1",
       icon: <ShieldCheck className="h-4 w-4 text-slate-400" />,
     },
  ];

  return (
    <section className="py-16 md:py-24 relative bg-slate-50 border-t border-slate-200 overflow-hidden">
      
      {/* Background Pattern - Image */}
      {/* Background Pattern - Premium Music */}
      <MusicPattern />
      
      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-slate-900"
          >
            Everything you need to <span className="text-blue-600">succeed.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            Powerful tools and global reach, designed for the modern independent artist.
          </motion.p>
        </div>
        
        <BentoGrid className="max-w-4xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
