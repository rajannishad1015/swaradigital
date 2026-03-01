"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Pricing",  href: "#pricing" },
    { name: "Workflow", href: "#workflow" },
  ];

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: "62px",
        background: scrolled ? "rgba(7,7,7,0.95)" : "rgba(7,7,7,0.8)",
        backdropFilter: "blur(24px) saturate(1.5)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        transition: "background 0.3s",
      }}
    >
      {/* Inner wrapper uses sl-nav-inner for responsive padding */}
      <div
        className="sl-nav-inner"
        style={{
          height: "100%", display: "flex",
          alignItems: "center", justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: "9px",
            fontSize: "16px", fontWeight: 800, letterSpacing: "-0.03em",
            color: "#EFEFEF", textDecoration: "none",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          <div style={{
            width: "28px", height: "28px", background: "#C8F135",
            borderRadius: "7px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "13px", flexShrink: 0,
            boxShadow: "0 0 16px rgba(200,241,53,0.35)",
          }}>♪</div>
          SwaraDigital
        </Link>

        {/* Center links — desktop */}
        <ul className="hidden md:flex" style={{ gap: "32px", listStyle: "none", margin: 0, padding: 0 }}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                href={link.href}
                style={{ fontSize: "13px", fontWeight: 500, color: "#777", textDecoration: "none", transition: "color 0.2s", fontFamily: "'Syne', sans-serif" }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#EFEFEF"}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#777"}
              >{link.name}</Link>
            </li>
          ))}
        </ul>

        {/* Right — desktop */}
        <div className="hidden md:flex" style={{ gap: "10px", alignItems: "center" }}>
          <Link href="/login"
            style={{ fontSize: "13px", fontWeight: 500, color: "#777", textDecoration: "none", padding: "7px 14px", transition: "color 0.2s", fontFamily: "'Syne', sans-serif" }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#EFEFEF"}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#777"}
          >LOGIN</Link>
          <Link href="/signup"
            style={{ fontSize: "13px", fontWeight: 700, color: "#070707", background: "#C8F135", padding: "9px 20px", borderRadius: "7px", textDecoration: "none", transition: "box-shadow 0.25s, transform 0.2s", fontFamily: "'Syne', sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 20px rgba(200,241,53,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
          >JOIN NOW</Link>
        </div>

        {/* Hamburger — mobile */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "8px 10px", cursor: "pointer", color: "#EFEFEF", fontSize: "18px", lineHeight: 1 }}
        >{menuOpen ? "✕" : "☰"}</button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ position: "absolute", top: "62px", left: 0, right: 0, background: "rgba(7,7,7,0.98)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "24px 20px", zIndex: 199 }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ fontSize: "18px", fontWeight: 600, color: "#EFEFEF", textDecoration: "none", fontFamily: "'Syne', sans-serif" }}
                >{link.name}</Link>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "10px", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ display: "block", flex: 1, textAlign: "center", padding: "10px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", color: "#EFEFEF", textDecoration: "none", fontSize: "14px", fontWeight: 600, fontFamily: "'Syne', sans-serif" }}
            >Login</Link>
            <Link href="/signup" onClick={() => setMenuOpen(false)}
              style={{ display: "block", flex: 1, textAlign: "center", padding: "10px", background: "#C8F135", borderRadius: "8px", color: "#070707", textDecoration: "none", fontSize: "14px", fontWeight: 700, fontFamily: "'Syne', sans-serif" }}
            >Join Now</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
