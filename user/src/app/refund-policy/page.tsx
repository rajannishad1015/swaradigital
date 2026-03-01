import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | SwaraDigital",
  description: "Learn about SwaraDigital's refund and cancellation policy for our music distribution services.",
};

const faqs = [
  {
    q: "Can I get a refund if I haven't used the service?",
    a: "Yes. If you have not uploaded any releases or used any distribution features within 7 days of your subscription start date, you are eligible for a full refund by contacting our support team.",
  },
  {
    q: "What if a DSP rejects my release?",
    a: "If a platform rejects your release due to a platform-side issue (not a content violation on your end), we will work to resolve it or offer you a credit toward your next distribution.",
  },
  {
    q: "Are annual plans refundable after the 7-day window?",
    a: "After the 7-day eligibility window, annual plans are non-refundable. However, you may continue using the service until the end of your billing period.",
  },
  {
    q: "How long do refunds take to process?",
    a: "Approved refunds are typically processed within 5–10 business days and returned to your original payment method. Processing time may vary depending on your bank or payment provider.",
  },
];

export default function RefundPolicyPage() {
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

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 32px 120px" }}>
        {/* Header */}
        <div style={{ marginBottom: "64px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", background: "rgba(200,241,53,0.07)", border: "1px solid rgba(200,241,53,0.18)", padding: "5px 14px", borderRadius: "100px", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.14em", color: "#C8F135", textTransform: "uppercase", marginBottom: "24px" }}>
            <span style={{ width: "6px", height: "6px", background: "#C8F135", borderRadius: "50%" }} />
            Legal
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(52px,8vw,96px)", lineHeight: 0.9, letterSpacing: "0.01em", marginBottom: "20px" }}>
            Refund<br /><span style={{ color: "#C8F135" }}>Policy.</span>
          </h1>
          <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Effective: January 1, 2025</span>
            <span style={{ fontSize: "13px", color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Last updated: March 1, 2025</span>
          </div>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.8, marginTop: "20px", borderLeft: "2px solid rgba(200,241,53,0.4)", paddingLeft: "20px" }}>
            We want you to be completely satisfied with SwaraDigital. This policy outlines when and how refunds are available for our distribution subscriptions.
          </p>
        </div>

        {/* Policy cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "56px" }}>
          {[
            { icon: "🕐", title: "7-Day Refund Window", body: "All paid plans come with a 7-day satisfaction guarantee from the date of purchase. If you are not happy, reach out within this window for a full refund — no questions asked.", lime: true },
            { icon: "🚫", title: "Non-Refundable Situations", body: "Refunds are not available after 7 days of purchase; for accounts suspended or terminated due to Terms of Service violations; for partially used annual plans beyond the refund window; or for fees charged by third-party payment processors." },
            { icon: "₹", title: "Pro-Rata for Plan Upgrades", body: "When upgrading from a lower to a higher plan, we apply a pro-rata credit for the remaining period of your current plan toward the new plan cost." },
            { icon: "📦", title: "Content Already Distributed", body: "If your music has been successfully distributed to DSPs and is live, the service has been rendered. Refunds in this case are at the discretion of SwaraDigital's support team." },
          ].map((item, i) => (
            <div key={i} style={{ background: item.lime ? "rgba(200,241,53,0.04)" : "rgba(255,255,255,0.02)", border: `1px solid ${item.lime ? "rgba(200,241,53,0.15)" : "rgba(255,255,255,0.06)"}`, borderRadius: "16px", padding: "24px 28px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "22px", flexShrink: 0, width: "40px", height: "40px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#EFEFEF", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How to request */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "0.02em", color: "#EFEFEF", marginBottom: "24px" }}>
            How to Request a <span style={{ color: "#C8F135" }}>Refund</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              "Email us at support@swaradigital.com with subject line: \"Refund Request – [Your Account Email]\"",
              "Include your account email address, order/transaction ID, and reason for refund",
              "Our support team will review your request within 2 business days",
              "If approved, the refund will be processed to your original payment method within 5–10 business days",
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "16px 20px" }}>
                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(200,241,53,0.1)", border: "1px solid rgba(200,241,53,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", fontWeight: 700, color: "#C8F135" }}>{i + 1}</span>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.7 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: "56px" }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", letterSpacing: "0.02em", color: "#EFEFEF", marginBottom: "24px" }}>
            Common <span style={{ color: "#C8F135" }}>Questions</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#EFEFEF", marginBottom: "10px", display: "flex", gap: "10px" }}>
                  <span style={{ color: "#C8F135", fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>Q.</span>
                  {faq.q}
                </h3>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: 1.8, paddingLeft: "24px" }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{ padding: "28px", background: "rgba(200,241,53,0.04)", border: "1px solid rgba(200,241,53,0.12)", borderRadius: "14px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.7 }}>
            Need help with a refund? Contact our support team at{" "}
            <a href="mailto:support@swaradigital.com" style={{ color: "#C8F135", textDecoration: "none" }}>support@swaradigital.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
