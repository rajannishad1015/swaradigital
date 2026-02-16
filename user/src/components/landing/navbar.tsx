"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing", href: "#pricing" },
    { name: "Workflow", href: "#workflow" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 flex justify-center pt-2 md:pt-6 px-2 md:px-4 pointer-events-none transition-all duration-500">
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`pointer-events-auto relative flex items-center justify-between px-4 md:px-8 py-2 md:py-3 rounded-full border transition-all duration-500 ${
          isScrolled
            ? "bg-black/60 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] w-full max-w-5xl border-white/10"
            : "bg-white/[0.02] backdrop-blur-md w-full max-w-7xl border-white/5"
        }`}
      >
        {/* Glass Reflection Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-20 pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group relative z-10">
          <div className="relative w-8 h-8 md:w-9 md:h-9 transition-transform duration-500 group-hover:rotate-12">
             <Image 
               src="/logo.png" 
               alt="Swara Digital Logo" 
               fill
               className="object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
               priority
             />
          </div>
          <span className="font-bold text-lg tracking-wider text-white hidden sm:block">
            Swara<span className="text-[#00FF88] font-light">Digital</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative px-5 py-2 rounded-full text-xs font-medium text-white/70 hover:text-white transition-colors duration-300 group overflow-hidden"
              >
                <span className="relative z-10">{link.name}</span>
                <span className="absolute inset-0 bg-white/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 ease-out origin-center" />
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <Link href="/login" className="group">
              <span className="text-xs font-bold text-white/80 hover:text-[#00FF88] transition-colors relative">
                LOGIN
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#00FF88] transition-all duration-300 group-hover:w-full" />
              </span>
            </Link>
            <Link href="/signup">
              <Button 
                size="sm" 
                className="h-10 px-6 bg-[#00FF88] text-black hover:bg-[#00E078] hover:scale-105 rounded-full text-xs font-bold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.5)]"
              >
                JOIN NOW
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors z-50 relative"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 right-0 p-6 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:hidden shadow-2xl z-40 overflow-hidden flex flex-col gap-6"
              style={{ minHeight: "400px" }}
            >
              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#00FF88]/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

              <div className="flex items-center justify-between pointer-events-none opacity-0">
                  {/* Placeholder for layout balance behind absolute close button */}
                  <div className="w-10 h-10" />
              </div>
              
              <div className="flex flex-col gap-2 mt-8 z-10">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-3xl font-bold text-white/50 hover:text-white transition-colors tracking-tight flex items-center gap-4 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-4 z-10">
                 <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />
                 <div className="grid grid-cols-2 gap-4">
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full h-12 rounded-xl bg-[#00FF88] hover:bg-[#00E078] text-black font-bold shadow-[0_0_20px_rgba(0,255,136,0.2)]">
                      Join Now
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
