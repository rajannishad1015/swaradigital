"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

// ── Data ───────────────────────────────────────────────────────────
const tiers = [
  {
    id: "free",
    tag: "Starter",
    name: "Free",
    description: "Try Swara Digital with no commitment.",
    price: "0",
    period: "/forever",
    color: "#777",
    features: [
      { text: "1 release per year",      ok: true  },
      { text: "Spotify & Apple Music",    ok: true  },
      { text: "Basic analytics",          ok: true  },
      { text: "100% royalties",           ok: true  },
      { text: "YouTube Content ID",       ok: false },
      { text: "Priority Support",         ok: false },
    ],
    cta: "Start Free",
    ctaHref: "/signup",
    highlight: false,
    glow: false,
  },
  {
    id: "pro",
    tag: "Most Popular",
    name: "Pro Artist",
    description: "Everything you need to grow as an independent artist.",
    price: "19.99",
    period: "/year",
    color: "#C8F135",
    features: [
      { text: "Unlimited releases",            ok: true },
      { text: "150+ streaming platforms",      ok: true },
      { text: "Real-time analytics",           ok: true },
      { text: "100% royalties",                ok: true },
      { text: "YouTube Content ID",            ok: true },
      { text: "Priority 24hr Support",         ok: true },
    ],
    cta: "Get Pro Artist",
    ctaHref: "/signup?plan=pro",
    highlight: true,
    glow: true,
  },
  {
    id: "label",
    tag: "Enterprise",
    name: "Label Plan",
    description: "Scale your label with advanced tools and dedicated support.",
    price: "Custom",
    period: "",
    color: "#a78bfa",
    features: [
      { text: "Everything in Pro",             ok: true },
      { text: "Unlimited artists",             ok: true },
      { text: "Splits & batch payments",       ok: true },
      { text: "Multi-user dashboard",          ok: true },
      { text: "Dedicated account manager",     ok: true },
      { text: "White-label options",           ok: true },
    ],
    cta: "Contact Us",
    ctaHref: "mailto:support@swaradigital.com",
    highlight: false,
    glow: false,
  },
];

// guarantee badge row
const guarantees = [
  { icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>
      </svg>
    ), label: "100% Royalties" },
  { icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ), label: "No hidden fees" },
  { icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
      </svg>
    ), label: "Cancel anytime" },
  { icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ), label: "24hr delivery" },
];

// ── Card ───────────────────────────────────────────────────────────
function PricingCard({ tier }: { tier: typeof tiers[0] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [cx, setCx] = useState("50%");
  const [cy, setCy] = useState("50%");
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={e => {
        const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
        setCx(`${e.clientX - r.left}px`);
        setCy(`${e.clientY - r.top}px`);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: tier.highlight ? "var(--card2)" : "var(--card)",
        border: tier.highlight
          ? `1px solid rgba(200,241,53,0.4)`
          : `1px solid rgba(255,255,255,0.07)`,
        borderRadius: "24px",
        padding: "40px 36px 36px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s",
        transform: visible ? "translateY(0)" : "translateY(32px)",
        opacity: visible ? 1 : 0,
        boxShadow: tier.highlight
          ? "0 0 0 1px rgba(200,241,53,0.06), 0 24px 60px rgba(0,0,0,0.5)"
          : "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      {/* Mouse-follow glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", borderRadius: "24px",
        background: `radial-gradient(380px circle at ${cx} ${cy}, ${tier.highlight ? "rgba(200,241,53,0.06)" : "rgba(255,255,255,0.03)"}, transparent 65%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.35s",
      }} />

      {/* Lime glow orb for highlighted card */}
      {tier.highlight && (
        <div style={{
          position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px",
          borderRadius: "50%", background: "radial-gradient(circle, rgba(200,241,53,0.12), transparent 70%)",
          zIndex: 0, pointerEvents: "none",
        }} />
      )}

      <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Tag pill */}
        <div style={{ marginBottom: "24px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: tier.highlight ? "rgba(200,241,53,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${tier.highlight ? "rgba(200,241,53,0.2)" : "rgba(255,255,255,0.07)"}`,
            padding: "4px 12px", borderRadius: "100px",
            fontFamily: "'JetBrains Mono', monospace", fontSize: "10px",
            letterSpacing: "0.1em", textTransform: "uppercase" as const,
            color: tier.color,
          }}>
            {tier.highlight && (
              <span style={{ width: "6px", height: "6px", background: "#C8F135", borderRadius: "50%", animation: "dotPulse 2s infinite" }} />
            )}
            {tier.tag}
          </span>
        </div>

        {/* Name & description */}
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px", letterSpacing: "0.02em", color: "#EFEFEF", lineHeight: 1, marginBottom: "8px" }}>
          {tier.name}
        </h3>
        <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.6, marginBottom: "28px", fontFamily: "'Syne', sans-serif" }}>
          {tier.description}
        </p>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "28px" }}>
          {tier.price !== "Custom" && (
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "22px", fontWeight: 700, color: "#555", alignSelf: "flex-start", marginTop: "10px" }}>$</span>
          )}
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: tier.price === "Custom" ? "48px" : "72px",
            lineHeight: 1, color: tier.highlight ? "#EFEFEF" : tier.color,
          }}>
            {tier.price}
          </span>
          {tier.period && (
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "13px", color: "#555", paddingBottom: "8px" }}>
              {tier.period}
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: tier.highlight ? "rgba(200,241,53,0.12)" : "rgba(255,255,255,0.06)", marginBottom: "24px" }} />

        {/* Feature list */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
          {tier.features.map(f => (
            <li key={f.text} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13.5px", color: f.ok ? "#aaa" : "#333", fontFamily: "'Syne', sans-serif" }}>
              {f.ok ? (
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(200,241,53,0.1)", border: "1px solid rgba(200,241,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2 6 5 9 10 3"/>
                  </svg>
                </span>
              ) : (
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round">
                    <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
                  </svg>
                </span>
              )}
              {f.text}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={tier.ctaHref}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "14px 20px", borderRadius: "12px", textDecoration: "none",
            fontSize: "14px", fontWeight: 700, fontFamily: "'Syne', sans-serif",
            transition: "transform 0.22s, box-shadow 0.22s, background 0.22s",
            background: tier.highlight ? "#C8F135" : "rgba(255,255,255,0.04)",
            color: tier.highlight ? "#070707" : "#EFEFEF",
            border: tier.highlight ? "none" : "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform = "translateY(-2px)";
            el.style.boxShadow = tier.highlight ? "0 8px 28px rgba(200,241,53,0.35)" : "0 8px 24px rgba(0,0,0,0.4)";
            if (!tier.highlight) el.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
            if (!tier.highlight) el.style.background = "rgba(255,255,255,0.04)";
          }}
        >
          {tier.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// ── Section ────────────────────────────────────────────────────────
export function Pricing() {
  return (
    <section id="pricing" className="sl-section" style={{ background: "var(--black)", position: "relative", overflow: "hidden" }}>

      {/* Background radial */}
      <div style={{ position: "absolute", top: "0", left: "50%", transform: "translateX(-50%)", width: "800px", height: "400px", borderRadius: "50%", background: "radial-gradient(ellipse at center, rgba(200,241,53,0.04), transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ maxWidth: "1160px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(200,241,53,0.07)", border: "1px solid rgba(200,241,53,0.18)", padding: "5px 16px", borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.14em", color: "#C8F135", textTransform: "uppercase", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", background: "#C8F135", borderRadius: "50%", animation: "dotPulse 2s ease-in-out infinite" }} />
            Pricing Plans
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px,6vw,96px)", lineHeight: 0.88, letterSpacing: "0.01em", color: "#EFEFEF", marginBottom: "16px" }}>
            Simple,<br />
            <span style={{ color: "#C8F135" }}>Transparent</span> Pricing.
          </h2>
          <p style={{ color: "#555", fontSize: "15px", fontFamily: "'Syne', sans-serif", maxWidth: "440px", margin: "0 auto", lineHeight: 1.7 }}>
            No hidden fees. No royalty cuts. Keep every rupee you earn.
          </p>
        </div>

        {/* Cards — pricing-grid CSS class → 1-col on mobile */}
        <div className="pricing-grid" style={{ maxWidth: "960px", margin: "0 auto" }}>
          {tiers.map(tier => <PricingCard key={tier.id} tier={tier} />)}
        </div>

        {/* Guarantee strip */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "32px", marginTop: "56px", padding: "28px 32px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          {guarantees.map(g => (
            <div key={g.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {g.icon}
              <span style={{ fontSize: "13px", color: "#777", fontFamily: "'Syne', sans-serif" }}>{g.label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
