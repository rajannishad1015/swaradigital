import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SwaraDigital",
  description: "Learn how SwaraDigital collects, uses, and protects your personal data.",
};

const sections = [
  {
    title: "Information We Collect",
    items: [
      { label: "Account Data", detail: "Name, email address, artist name, profile picture, and password (hashed) provided during registration." },
      { label: "Financial Data", detail: "Bank account details, IFSC code, PAN number, UPI ID, and PayPal email for royalty payouts. We do not store full payment card information." },
      { label: "Content Data", detail: "Music files, artwork, metadata (album name, release date, ISRC codes) that you upload for distribution." },
      { label: "Usage Data", detail: "Pages visited, features used, device type, browser, IP address, and interaction logs to improve our platform." },
      { label: "Communication Data", detail: "Emails and support messages you send us." },
    ],
  },
  {
    title: "How We Use Your Data",
    items: [
      { label: "Service Delivery", detail: "To distribute your music to streaming platforms, process royalty payments, and manage your account." },
      { label: "Analytics & Reporting", detail: "To provide you with real-time stream counts, revenue reports, and listener insights." },
      { label: "Security", detail: "To detect fraud, protect your account, and comply with legal obligations." },
      { label: "Communication", detail: "To send you service updates, royalty statements, and important notifications. Marketing emails are opt-in only." },
    ],
  },
  {
    title: "Sharing Your Information",
    items: [
      { label: "Digital Streaming Platforms", detail: "Your music metadata and content is shared with DSPs (Spotify, Apple Music, etc.) as required for distribution." },
      { label: "Payment Processors", detail: "Financial details are shared with payment service providers solely for payout processing." },
      { label: "Legal Requirements", detail: "We may disclose information when required by law or to protect the rights and safety of our users and platform." },
      { label: "No Selling of Data", detail: "We never sell, rent, or trade your personal information to third parties for marketing purposes." },
    ],
  },
  {
    title: "Data Security",
    items: [
      { label: "Encryption", detail: "All data is transmitted over HTTPS with TLS encryption. Financial data is stored encrypted at rest." },
      { label: "Access Controls", detail: "Only authorized personnel with a legitimate need access your personal data, under strict confidentiality obligations." },
      { label: "Infrastructure", detail: "Our platform is built on Supabase and hosted on enterprise-grade cloud infrastructure with regular security audits." },
    ],
  },
  {
    title: "Your Rights",
    items: [
      { label: "Access & Portability", detail: "You can request a copy of all personal data we hold about you at any time." },
      { label: "Correction", detail: "You can update your profile information directly from your dashboard settings." },
      { label: "Deletion", detail: "You may request deletion of your account and associated data. Some data may be retained for legal compliance periods." },
      { label: "Opt-out", detail: "You may opt out of marketing emails at any time using the unsubscribe link in any email we send." },
    ],
  },
  {
    title: "Cookies & Tracking",
    items: [
      { label: "Essential Cookies", detail: "Required for authentication and core platform functionality. Cannot be disabled." },
      { label: "Analytics Cookies", detail: "Help us understand how users interact with our platform. You may opt out via your browser settings." },
      { label: "No Ad Tracking", detail: "We do not use third-party advertising trackers or sell your browsing data to ad networks." },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#070707", color: "#EFEFEF", fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,7,0.9)", backdropFilter: "blur(16px)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "32px", height: "32px", background: "#C8F135", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#070707" stroke="none"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "17px", color: "#EFEFEF" }}>SwaraDigital</span>
        </Link>
        <Link href="/" style={{ fontSize: "13px", color: "#777", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back to Home
        </Link>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "80px 32px 120px" }}>
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(200,241,53,0.07)", border: "1px solid rgba(200,241,53,0.18)", padding: "5px 14px", borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.14em", color: "#C8F135", textTransform: "uppercase", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", background: "#C8F135", borderRadius: "50%" }} />
            Legal
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,8vw,96px)", lineHeight: 0.9, letterSpacing: "0.01em", marginBottom: "20px" }}>
            Privacy<br /><span style={{ color: "#C8F135" }}>Policy.</span>
          </h1>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Effective: January 1, 2025</span>
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Last updated: March 1, 2025</span>
          </div>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.8, marginTop: "20px", borderLeft: "2px solid rgba(200,241,53,0.4)", paddingLeft: "20px" }}>
            At SwaraDigital, your privacy matters. This policy explains what data we collect, why we collect it, and how we keep it safe. We believe in full transparency.
          </p>
        </div>

        {/* At a glance */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "64px" }}>
          {[
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>, label: "100% Secure", sub: "Encrypted at rest & in transit" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>, label: "No Data Selling", sub: "We never sell your information" },
            { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label: "You're in Control", sub: "Access, edit, or delete anytime" },
          ].map((card, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", background: "rgba(200,241,53,0.08)", border: "1px solid rgba(200,241,53,0.18)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{card.icon}</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#EFEFEF" }}>{card.label}</div>
              <div style={{ fontSize: "12px", color: "#555" }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {sections.map((section, si) => (
            <div key={si}>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "34px", letterSpacing: "0.02em", color: "#EFEFEF", marginBottom: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ display: "inline-block", width: "4px", height: "28px", background: "#C8F135", borderRadius: "2px" }} />
                {section.title}
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {section.items.map((item, ii) => (
                  <div key={ii} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px 20px", alignItems: "start" }}>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#C8F135", letterSpacing: "0.05em", paddingTop: "2px" }}>{item.label}</div>
                    <div style={{ fontSize: "13.5px", color: "#666", lineHeight: 1.75 }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div style={{ marginTop: "64px", padding: "32px", background: "rgba(200,241,53,0.04)", border: "1px solid rgba(200,241,53,0.12)", borderRadius: "16px" }}>
          <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#EFEFEF", marginBottom: "12px" }}>Questions or Concerns?</h3>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7, marginBottom: "16px" }}>
            If you have any questions about this Privacy Policy or want to exercise your data rights, please reach out to our dedicated privacy team.
          </p>
          <a href="mailto:privacy@swaradigital.com" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#C8F135", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
            privacy@swaradigital.com
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
