import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | SwaraDigital",
  description: "Read the Terms & Conditions for using the SwaraDigital music distribution platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By creating an account or using SwaraDigital's services, you confirm that you are at least 18 years old, have read and understood these Terms, and agree to be bound by them. If you do not agree to any part of these Terms, you must not use our services.`,
  },
  {
    title: "2. Services Provided",
    content: `SwaraDigital provides music distribution services allowing artists to distribute their music to digital streaming platforms and stores worldwide. We act as an intermediary between artists and digital service providers (DSPs). Our services include, but are not limited to, digital distribution, analytics, royalty collection, and artist support.`,
  },
  {
    title: "3. Account Registration",
    content: `You must provide accurate and complete information when creating your account. You are responsible for maintaining the security of your account credentials. SwaraDigital cannot and will not be held liable for any loss or damage from your failure to comply with this security obligation. You agree to notify SwaraDigital immediately of any unauthorized access to your account.`,
  },
  {
    title: "4. Content Ownership & Licensing",
    content: `You retain full copyright and ownership of all music and content you upload to SwaraDigital. By submitting content, you grant SwaraDigital a non-exclusive, worldwide, royalty-free license to distribute, reproduce, and make available your content on partner platforms solely for the purpose of providing our distribution services. You represent that you own or have all necessary rights to the content you distribute.`,
  },
  {
    title: "5. Royalties & Payments",
    content: `SwaraDigital distributes 100% of your earned royalties to you after deducting applicable platform fees from third-party stores. Royalties are collected from DSPs and transferred to your account upon receipt. Payment processing may take up to 60 days after a reporting period. SwaraDigital reserves the right to withhold payments if fraudulent activity is suspected.`,
  },
  {
    title: "6. Prohibited Content",
    content: `You must not upload content that infringes on any third-party copyright, trademark, or other intellectual property rights; contains explicit hate speech, violence, or discrimination; promotes illegal activities; is misleading or constitutes fraud. SwaraDigital reserves the right to remove any content and suspend any account that violates these guidelines without prior notice.`,
  },
  {
    title: "7. Termination",
    content: `Either party may terminate the agreement at any time. Upon termination, SwaraDigital will initiate takedowns from all platforms within 30–45 business days. Any outstanding royalties earned prior to termination will be paid to you after deducting applicable fees. SwaraDigital may immediately terminate your account for serious violations without notice.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `SwaraDigital shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use our services. Our total liability to you for any claim shall not exceed the fees paid by you to SwaraDigital in the 12 months preceding the claim.`,
  },
  {
    title: "9. Changes to Terms",
    content: `SwaraDigital reserves the right to modify these Terms at any time. We will notify you via email or in-app notification of significant changes. Continued use of our services after changes constitutes acceptance of the new Terms. It is your responsibility to review these Terms periodically.`,
  },
  {
    title: "10. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra, India.`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#070707", color: "#EFEFEF", fontFamily: "'Syne', sans-serif" }}>
      {/* Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .tnav-link { font-size:12px; color:#777; text-decoration:none; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:5px 12px; border-radius:100px; transition:color 0.2s,border-color 0.2s; }
        .tnav-link:hover { color:#C8F135; border-color:rgba(200,241,53,0.3); }
        .back-link { font-size:13px; color:#777; text-decoration:none; display:flex; align-items:center; gap:6px; transition:color 0.2s; }
        .back-link:hover { color:#C8F135; }
        [id^="section-"] { scroll-margin-top: 80px; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,7,0.9)", backdropFilter: "blur(16px)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "100%" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: "32px", height: "32px", background: "#C8F135", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px rgba(200,241,53,0.35)" }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <rect x="0"  y="7" width="2.5" height="8"  rx="1.2" fill="#070707"/>
              <rect x="4"  y="4" width="2.5" height="11" rx="1.2" fill="#070707"/>
              <rect x="8"  y="1" width="2.5" height="14" rx="1.2" fill="#070707"/>
              <rect x="12" y="5" width="2.5" height="10" rx="1.2" fill="#070707"/>
              <rect x="16" y="9" width="2.5" height="6"  rx="1.2" fill="#070707"/>
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#EFEFEF", letterSpacing: "0.04em" }}>Swara</span>
            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "8px", fontWeight: 600, color: "#C8F135", letterSpacing: "0.18em", textTransform: "uppercase" }}>Digital</span>
          </div>
        </Link>
        <Link href="/" style={{ fontSize: "13px", color: "#777", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back to Home
        </Link>
      </nav>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px 120px" }}>
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(200,241,53,0.07)", border: "1px solid rgba(200,241,53,0.18)", padding: "5px 14px", borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.14em", color: "#C8F135", textTransform: "uppercase", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", background: "#C8F135", borderRadius: "50%" }} />
            Legal
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,8vw,96px)", lineHeight: 0.9, letterSpacing: "0.01em", marginBottom: "20px" }}>
            Terms &<br /><span style={{ color: "#C8F135" }}>Conditions.</span>
          </h1>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Effective: January 1, 2025</span>
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Last updated: March 1, 2025</span>
          </div>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.8, marginTop: "20px", borderLeft: "2px solid rgba(200,241,53,0.4)", paddingLeft: "20px" }}>
            Please read these Terms & Conditions carefully before using SwaraDigital's music distribution platform. These terms govern your use of our services.
          </p>
        </div>

        {/* Quick links */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px 28px", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", color: "#555", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>Quick Navigation</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {sections.map((s, i) => (
              <a key={i} href={`#section-${i + 1}`} className="tnav-link">
                {s.title.split(". ")[0]}.
              </a>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
          {sections.map((s, i) => (
            <div key={i} id={`section-${i + 1}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "40px" }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700, color: "#EFEFEF", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#C8F135", minWidth: "28px" }}>{String(i + 1).padStart(2, "0")}.</span>
                {s.title.split(". ").slice(1).join(". ")}
              </h2>
              <p style={{ fontSize: "14.5px", color: "#666", lineHeight: 1.9 }}>{s.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: "64px", padding: "28px", background: "rgba(200,241,53,0.04)", border: "1px solid rgba(200,241,53,0.12)", borderRadius: "14px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.7 }}>
            Questions about our terms? Contact us at{" "}
            <a href="mailto:legal@swaradigital.com" style={{ color: "#C8F135", textDecoration: "none" }}>legal@swaradigital.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
