"use client";

import Image from "next/image";

const platforms = [
  { name: "Spotify",       logo: "/assets/logos/66af509c1da979ff4ba09e63_spotify.webp" },
  { name: "Apple Music",   logo: "/assets/logos/66af509cd3076ed98e01769c_apple.webp" },
  { name: "YouTube Music", logo: "/assets/logos/66af509cdba6c4f6a06ce615_youtube.webp" },
  { name: "JioSaavn",      logo: "/assets/logos/66af509ce30b267f537d7dbc_jio.webp" },
  { name: "Amazon Music",  logo: "/assets/logos/66af509ce30b267f537d7e28_amazon.webp" },
  { name: "Deezer",        logo: "/assets/logos/66af509c531437b23665284c_deezer.webp" },
  { name: "Instagram",     logo: "/assets/logos/66af509c7661e5c27bada11d_instagram.webp" },
  { name: "Anghami",       logo: "/assets/logos/66af509ceb7eaac4d19cd557_anghami.webp" },
];

const doubled = [...platforms, ...platforms];

const stats = [
  { n: "150", suffix: "+",   label: "Platforms" },
  { n: "170", suffix: "K+",  label: "Artists" },
  { n: "100", suffix: "%",   label: "Royalties Kept" },
  { n: "24",  suffix: "hr",  label: "Avg. Delivery" },
];

export function PlatformLogos() {
  return (
    <>
      {/* Trusted Delivery Strip */}
      <div className="sl-trusted-pad" style={{ background: "var(--off-black)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", overflow: "hidden" }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", textAlign: "center", marginBottom: "28px", padding: "0 20px" }}>
          Trusted Delivery to 150+ Networks
        </p>

        {/* Scrolling logo row */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100px", zIndex: 10, background: "linear-gradient(to right, var(--off-black), transparent)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100px", zIndex: 10, background: "linear-gradient(to left, var(--off-black), transparent)", pointerEvents: "none" }} />

          <div style={{ display: "flex", gap: "60px", width: "max-content", alignItems: "center", animation: "logoScroll 35s linear infinite", padding: "0 60px" }}>
            {doubled.map((p, i) => (
              <div key={`${p.name}-${i}`} style={{ position: "relative", height: "36px", minWidth: "110px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Image
                  src={p.logo} alt={p.name} width={120} height={36}
                  style={{ objectFit: "contain", height: "32px", width: "auto", maxWidth: "120px", opacity: 0.6, filter: "brightness(0) invert(1)", transition: "opacity 0.3s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.opacity = "1"}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.opacity = "0.6"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="sl-stats-pad" style={{ background: "var(--off-black)", borderBottom: "1px solid var(--border)" }}>
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={s.label} style={{ padding: "0 32px", borderRight: i < stats.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(36px,5vw,56px)", lineHeight: 1, color: "#EFEFEF" }}>
                {s.n}<span style={{ color: "#C8F135" }}>{s.suffix}</span>
              </div>
              <div style={{ fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#777", marginTop: "6px", fontFamily: "'JetBrains Mono', monospace" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
