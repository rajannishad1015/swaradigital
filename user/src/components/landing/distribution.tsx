"use client";

import Image from "next/image";
import Link from "next/link";

const platforms = [
  { name: "Spotify",      logo: "/assets/logos/spotify-logo-icon.webp" },
  { name: "Apple Music",  logo: "/assets/logos/apple-music-logo-icon.webp" },
  { name: "TikTok",       logo: "/assets/logos/tiktok-logo-icon.webp" },
  { name: "Pandora",      logo: "/assets/logos/pandora.png" },
  { name: "Amazon Music", logo: "/assets/logos/amazon-music-logo-icon.webp" },
  { name: "Instagram",    logo: "/assets/logos/instagram_new.png" },
  { name: "YouTube",      logo: "/assets/logos/youtube_new.png" },
  { name: "iHeart",       logo: "/assets/logos/iheartradio.png" },
];

export function Distribution() {
  return (
    <>
      <section className="sl-section" style={{ background: "var(--black)" }}>
        <div style={{ maxWidth: "1160px", margin: "0 auto" }}>
          {/* distro-wrap CSS class handles 2-col → 1-col */}
          <div className="distro-wrap">
            {/* Left */}
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(200,241,53,0.07)", border: "1px solid rgba(200,241,53,0.18)", padding: "5px 14px", borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#C8F135", marginBottom: "24px" }}>
                <span style={{ width: "5px", height: "5px", background: "#C8F135", borderRadius: "50%" }} />
                Global Distribution
              </div>

              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,6vw,90px)", lineHeight: 0.9, letterSpacing: "0.01em", marginBottom: "22px", color: "#EFEFEF" }}>
                One upload.<br /><span style={{ color: "#C8F135" }}>Everywhere.</span>
              </h2>

              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "#777", marginBottom: "30px", maxWidth: "400px", fontFamily: "'Syne', sans-serif" }}>
                Manage your entire music catalog from one beautiful dashboard. We push your tracks to{" "}
                <b style={{ color: "#EFEFEF", fontWeight: 600 }}>Spotify, Apple Music, Instagram</b> and 150+ others instantly.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "36px" }}>
                {["✓ 100% Royalties", "✓ Monthly Payouts", "✓ Content ID"].map((tag) => (
                  <span key={tag} style={{ padding: "7px 14px", borderRadius: "7px", background: "rgba(200,241,53,0.06)", border: "1px solid rgba(200,241,53,0.18)", fontSize: "12px", fontWeight: 600, color: "#C8F135", fontFamily: "'Syne', sans-serif" }}>
                    {tag}
                  </span>
                ))}
              </div>

              <Link href="/signup"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#C8F135", color: "#070707", fontSize: "14px", fontWeight: 700, padding: "12px 26px", borderRadius: "8px", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.25s", fontFamily: "'Syne', sans-serif" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(200,241,53,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
              >Start Distributing →</Link>
            </div>

            {/* Right: 3×3 platform grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {platforms.map((p) => (
                <div key={p.name}
                  style={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: "14px", padding: "22px 14px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s", cursor: "default" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(200,241,53,0.25)"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 12px 32px rgba(0,0,0,0.5)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
                >
                  <div style={{ width: "52px", height: "52px", position: "relative" }}>
                    <Image src={p.logo} alt={p.name} fill sizes="52px" style={{ objectFit: "contain" }} />
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#777", fontFamily: "'Syne', sans-serif", textAlign: "center" }}>{p.name}</span>
                </div>
              ))}
              {/* +142 more */}
              <div style={{ background: "rgba(200,241,53,0.04)", border: "1px dashed rgba(200,241,53,0.2)", borderRadius: "14px", padding: "22px 14px 16px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px" }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", color: "#C8F135", lineHeight: 1 }}>+142</span>
                <span style={{ fontSize: "10px", color: "#C8F135", fontWeight: 600 }}>more stores</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div style={{ background: "#C8F135", overflow: "hidden", padding: "16px 0" }}>
        <div style={{ display: "flex", width: "max-content", animation: "mqscroll 28s linear infinite" }}>
          {Array(12).fill(null).map((_, i) => (
            <div key={i} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(18px,3vw,26px)", letterSpacing: "0.06em", color: "#070707", padding: "0 36px", display: "flex", alignItems: "center", gap: "36px", whiteSpace: "nowrap" }}>
              INDEPENDENT NOT ALONE <span style={{ fontSize: "8px", color: "rgba(0,0,0,0.25)" }}>◆</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
