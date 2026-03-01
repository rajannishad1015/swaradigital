"use client";

import Link from "next/link";
import { useState } from "react";

const footerSections = [
  { title: "Product", links: [{name:"Features",href:"#features"},{name:"Pricing",href:"#pricing"},{name:"Distributors",href:"#"},{name:"Success Stories",href:"#"}] },
  { title: "Company", links: [{name:"About Us",href:"#about"},{name:"Careers",href:"#"},{name:"Press",href:"#"},{name:"Blog",href:"#"}] },
  { title: "Legal",   links: [{name:"Terms & Conditions",href:"/terms"},{name:"Refund Policy",href:"/refund-policy"},{name:"Privacy Policy",href:"/privacy-policy"}] },
  { title: "Support", links: [{name:"Help Center",href:"#"},{name:"Contact",href:"mailto:support@swaradigital.com"},{name:"Status",href:"#"}] },
];

const socials = [
  { label: "Twitter / X", href: "#", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.745l7.73-8.835L1.254 2.25H8.08l4.259 5.622 5.905-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
  { label: "Instagram", href: "#", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" stroke="none"/>
    </svg>
  )},
  { label: "YouTube", href: "#", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.2 2.8 12 2.8 12 2.8s-4.2 0-6.8.1c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.2.7 11.4v2c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.6 22 12 22 12 22s4.2 0 6.8-.2c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2C23.3 9.2 23 7 23 7zM9.7 15.5V8.4l6.5 3.6-6.5 3.5z"/>
    </svg>
  )},
  { label: "Email", href: "mailto:support@swaradigital.com", icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )},
];

export function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer style={{ background: "var(--off-black)", borderTop: "1px solid var(--border)", padding: "80px 56px 36px" }} className="sl-footer">
      <style>{`
        .sl-footer { padding: 80px 56px 36px !important; }
        @media (max-width: 768px) {
          .sl-footer { padding: 56px 20px 28px !important; }
        }
      `}</style>

      {/* footer-grid: 5-col → 2-col → 1-col on mobile */}
      <div className="footer-grid">
        {/* Brand column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "16px", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "16px", fontFamily: "'Syne', sans-serif", color: "#EFEFEF" }}>
            <div style={{ width: "26px", height: "26px", background: "#C8F135", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(200,241,53,0.3)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#070707" stroke="none"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            SwaraDigital
          </div>
          <p style={{ fontSize: "13px", lineHeight: 1.8, color: "#777", maxWidth: "270px", marginBottom: "24px", fontFamily: "'Syne', sans-serif" }}>
            The future of music distribution is here. Join 170k+ independent artists and get your music heard everywhere.
          </p>
          {/* Newsletter */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex: "1 1 160px", minWidth: "0", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#EFEFEF", fontFamily: "'Syne', sans-serif", outline: "none" }}
              onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(200,241,53,0.3)"}
              onBlur={e  => (e.currentTarget as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.07)"}
            />
            <button
              style={{ background: "#C8F135", color: "#070707", border: "none", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "box-shadow 0.2s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 16px rgba(200,241,53,0.4)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"}
            >Subscribe</button>
          </div>
        </div>

        {/* Link columns */}
        {footerSections.map(section => (
          <div key={section.title}>
            <h5 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EFEFEF", marginBottom: "18px", fontFamily: "'Syne', sans-serif" }}>{section.title}</h5>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
              {section.links.map(link => (
                <li key={link.name}>
                  <Link href={link.href}
                    style={{ fontSize: "13px", color: "#777", textDecoration: "none", transition: "color 0.2s", fontFamily: "'Syne', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#EFEFEF"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#777"}
                  >{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* footer-bottom stacks on mobile */}
      <div className="footer-bottom">
        <p style={{ fontSize: "12px", color: "#444", fontFamily: "'Syne', sans-serif" }}>
          © {new Date().getFullYear()} SwaraDigital. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          {socials.map(s => (
            <Link key={s.label} href={s.href} aria-label={s.label}
              style={{ width: "34px", height: "34px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", color: "#777", textDecoration: "none", transition: "border-color 0.2s, background 0.2s, transform 0.2s, color 0.2s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(200,241,53,0.3)"; el.style.background = "rgba(200,241,53,0.06)"; el.style.transform = "translateY(-2px)"; el.style.color = "#C8F135"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.background = "rgba(255,255,255,0.04)"; el.style.transform = "translateY(0)"; el.style.color = "#777"; }}
            >{s.icon}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
