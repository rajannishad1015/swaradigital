"use client";

import Link from "next/link";
import { useRef } from "react";

export function Hero() {
  const orbRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="sl-hero-sec"
      style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", position: "relative", overflow: "hidden",
        background: "var(--black)",
      }}
    >
      {/* Noise */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.025,
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        backgroundSize: "200px 200px",
      }} />

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(200,241,53,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(200,241,53,0.035) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
        WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, black 20%, transparent 100%)",
      }} />

      {/* Orb */}
      <div ref={orbRef} style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "500px", zIndex: 0,
        background: "radial-gradient(ellipse at center, rgba(200,241,53,0.06) 0%, rgba(200,241,53,0.02) 40%, transparent 70%)",
        animation: "breathe 6s ease-in-out infinite",
      }} />

      {/* Sound rings */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 0, pointerEvents: "none" }}>
        {[{size:300,delay:"0s"},{size:500,delay:"1s"},{size:700,delay:"2s"},{size:900,delay:"3s"}].map((ring,i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", border: "1px solid rgba(200,241,53,0.06)", width: ring.size, height: ring.size, top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "ringPulse 4s ease-out infinite", animationDelay: ring.delay }} />
        ))}
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "900px", margin: "0 auto" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid rgba(200,241,53,0.18)", background: "rgba(200,241,53,0.06)", padding: "6px 16px 6px 8px", borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "0.08em", color: "#C8F135", textTransform: "uppercase", marginBottom: "40px", backdropFilter: "blur(8px)", animation: "fadeUp 0.7s ease both" }}>
          <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(200,241,53,0.15)", border: "1px solid rgba(200,241,53,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "7px", height: "7px", background: "#C8F135", borderRadius: "50%", animation: "dotPulse 2s infinite" }} />
          </div>
          Global Reach, Local Control
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(72px, 12vw, 172px)", lineHeight: 0.88, letterSpacing: "0.015em", animation: "fadeUp 0.8s 0.1s ease both", margin: 0 }}>
          <span style={{ display: "block", color: "#EFEFEF" }}>Get Discovered.</span>
          <span style={{ display: "block", color: "rgba(240,240,240,0.28)" }}>Monetise.</span>
          <span style={{ display: "block", color: "transparent", WebkitTextStroke: "1.5px #C8F135", textShadow: "0 0 60px rgba(200,241,53,0.3)" }}>Grow.</span>
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: "clamp(14px, 2vw, 16px)", lineHeight: 1.75, color: "#777", maxWidth: "500px", margin: "32px auto 0", animation: "fadeUp 0.8s 0.2s ease both", fontFamily: "'Syne', sans-serif" }}>
          The all-in-one music distribution platform. Release on Spotify, Apple Music, and 100+
          stores while keeping <strong style={{ color: "#EFEFEF", fontWeight: 600 }}>100% of your earnings</strong>
        </p>

        {/* CTAs — sl-ctas handles stacking on mobile */}
        <div className="sl-ctas" style={{ animation: "fadeUp 0.8s 0.3s ease both" }}>
          <Link href="/signup"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#C8F135", color: "#070707", fontSize: "14px", fontWeight: 700, padding: "13px 30px", borderRadius: "8px", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.25s", fontFamily: "'Syne', sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 30px rgba(200,241,53,0.35)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
          >Start for Free →</Link>
          <Link href="#features"
            style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.04)", color: "#EFEFEF", fontSize: "14px", fontWeight: 500, padding: "13px 26px", borderRadius: "8px", textDecoration: "none", border: "1px solid rgba(255,255,255,0.07)", transition: "background 0.2s, transform 0.2s", fontFamily: "'Syne', sans-serif" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}
          >
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", flexShrink: 0 }}>▶</span>
            View Demo
          </Link>
        </div>

        {/* Social proof — sl-social-proof handles stacking on mobile */}
        <div className="sl-social-proof" style={{ animation: "fadeUp 0.8s 0.4s ease both" }}>
          <div style={{ display: "flex" }}>
            {[{letter:"A",bg:"#7C6FF7"},{letter:"K",bg:"#F76F6F"},{letter:"R",bg:"#4BBF87"},{letter:"S",bg:"#F7A84B"}].map((av,i) => (
              <div key={i} style={{ width:"34px",height:"34px",borderRadius:"50%",border:"2.5px solid #070707",background:av.bg,fontSize:"12px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",marginLeft:i===0?0:"-10px",fontFamily:"'Syne',sans-serif" }}>{av.letter}</div>
            ))}
            <div style={{ width:"34px",height:"34px",borderRadius:"50%",marginLeft:"-10px",background:"#C8F135",color:"#070707",fontSize:"9px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",border:"2.5px solid #070707",fontFamily:"'Syne',sans-serif" }}>17k</div>
          </div>

          <div className="sl-sp-divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div style={{ color: "#C8F135", fontSize: "11px", letterSpacing: "2px" }}>★★★★★</div>
            <div style={{ fontSize: "13px", color: "#777", fontFamily: "'Syne', sans-serif" }}>
              Joined by <b style={{ color: "#EFEFEF" }}>170k+</b> artists
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
