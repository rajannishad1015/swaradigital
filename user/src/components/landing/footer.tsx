"use client";

import Link from "next/link";
import { Music2, Twitter, Instagram, Github, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export function Footer() {
  const sections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
        { name: "Distributors", href: "#" },
        { name: "Success Stories", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
        { name: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Terms & Conditions", href: "/terms" },
        { name: "Refund Policy", href: "/refund-policy" },
        { name: "Privacy Policy", href: "#" },
      ],
    },
    {
       title: "Support",
       links: [
         { name: "Help Center", href: "#" },
         { name: "Contact", href: "mailto:support@musicflow.com" },
         { name: "Status", href: "#" },
       ],
     },
  ];

  return (
    <footer className="relative w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden rounded-md font-sans border-t border-slate-800">
      
      <div className="container relative z-20 mx-auto px-4 md:px-6 pt-20 pb-12 w-full">
         
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-12 md:mb-20 items-start">
             <div>
                <Link href="/" className="flex items-center gap-2 mb-6 group w-fit">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                        <Music2 className="text-slate-950 w-5 h-5" />
                    </div>
                    <span className="font-bold text-2xl tracking-tighter text-white">
                        MusicFlow
                    </span>
                 </Link>
                 <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mb-6 md:mb-8">
                     The future of music distribution is here. Join the revolution and get your music heard on every major platform worldwide.
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-3">
                     <div className="relative">
                        <Input 
                            placeholder="Enter your email" 
                            className="w-full sm:w-64 bg-slate-900/50 border-slate-800 text-white focus:ring-2 focus:ring-slate-700 focus:border-transparent h-10" 
                        />
                     </div>
                     <Button className="bg-white text-slate-950 hover:bg-slate-200 h-10 px-6 font-medium">
                        Subscribe
                     </Button>
                 </div>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-4">
                 {sections.map((section, i) => (
                     <div key={i} className="flex flex-col gap-4">
                         <h4 className="font-semibold text-white text-sm uppercase tracking-wider">{section.title}</h4>
                         <ul className="space-y-3">
                             {section.links.map((link, j) => (
                                 <li key={j}>
                                     <Link href={link.href} className="text-slate-400 hover:text-white text-sm transition-colors">
                                         {link.name}
                                     </Link>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 ))}
             </div>
         </div>

         <div className="flex flex-col-reverse md:flex-row justify-between items-center pt-8 border-t border-slate-800/50 gap-4">
             <p className="text-slate-500 text-sm">
                 © {new Date().getFullYear()} SwaraDigital. All rights reserved.
             </p>
             <div className="flex gap-4">
                 <Link href="#" aria-label="Follow SwaraDigital on Twitter" className="text-slate-500 hover:text-white transition-colors">
                     <Twitter className="w-5 h-5" />
                 </Link>
                 <Link href="#" aria-label="Follow SwaraDigital on Instagram" className="text-slate-500 hover:text-white transition-colors">
                     <Instagram className="w-5 h-5" />
                 </Link>
                 <Link href="#" aria-label="SwaraDigital on GitHub" className="text-slate-500 hover:text-white transition-colors">
                     <Github className="w-5 h-5" />
                 </Link>
                 <Link href="mailto:support@musicflow.com" aria-label="Email SwaraDigital Support" className="text-slate-500 hover:text-white transition-colors">
                     <Mail className="w-5 h-5" />
                 </Link>
             </div>
         </div>

      </div>

    </footer>
  );
}
