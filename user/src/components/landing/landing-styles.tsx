/**
 * LandingStyles — injects fonts + CSS variables + animations
 * ONLY for the landing page. Dashboard is not affected.
 */
export function LandingStyles() {
  return (
    <>
      {/* Google Fonts: Bebas Neue · Syne · JetBrains Mono */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <style>{`
        /* ── Design Tokens ──────────────────────────────────── */
        .swara-landing {
          --lime:      #C8F135;
          --lime-glow: rgba(200,241,53,0.15);
          --black:     #070707;
          --off-black: #0d0d0d;
          --card:      #101010;
          --card2:     #141414;
          --card3:     #181818;
          --white:     #EFEFEF;
          --muted:     #444;
          --muted2:    #777;
          --muted3:    #aaa;
          --border:    rgba(255,255,255,0.07);
          --border2:   rgba(200,241,53,0.18);
          --border3:   rgba(255,255,255,0.04);
          scroll-behavior: smooth;
        }
        .swara-landing ::-webkit-scrollbar       { width: 4px; }
        .swara-landing ::-webkit-scrollbar-track { background: var(--black); }
        .swara-landing ::-webkit-scrollbar-thumb { background: var(--muted); border-radius: 4px; }

        /* ── Keyframes ──────────────────────────────────────── */
        @keyframes breathe {
          0%,100% { transform: translateX(-50%) scale(1); opacity:.8; }
          50%      { transform: translateX(-50%) scale(1.08); opacity:1; }
        }
        @keyframes ringPulse {
          0%   { opacity:.6; transform:translate(-50%,-50%) scale(.9); }
          100% { opacity:0;  transform:translate(-50%,-50%) scale(1.05); }
        }
        @keyframes dotPulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.4; transform:scale(.8); }
        }
        @keyframes mqscroll {
          to { transform: translateX(-50%); }
        }
        @keyframes fillAnim {
          from { width:0%; }
          to   { width:78%; }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pingDot  {
          0%,100% { transform:scale(1);   opacity:1; }
          50%      { transform:scale(1.3); opacity:.7; }
        }
        @keyframes pingRing {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(2.5); opacity:0; }
        }
        @keyframes logoScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── Layout classes (desktop-first) ─────────────────── */
        /* Sections */
        .sl-section  { padding: 110px 56px; }
        .sl-hero-sec { padding: 120px 48px 80px; }
        .sl-stats-pad { padding: 56px; }
        .sl-trusted-pad { padding: 32px 0; }

        /* Navbar */
        .sl-nav-inner { padding: 0 56px; }

        /* Hero */
        .sl-ctas        { display:flex; gap:12px; align-items:center; justify-content:center; margin-top:48px; flex-wrap:wrap; }
        .sl-social-proof{ display:flex; align-items:center; justify-content:center; gap:16px; margin-top:60px; flex-wrap:wrap; }
        .sl-sp-divider  { width:1px; height:30px; background:rgba(255,255,255,0.07); flex-shrink:0; }

        /* Grids */
        .distro-wrap  { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        .stats-grid   { display:grid; grid-template-columns:repeat(4,1fr); text-align:center; max-width:1000px; margin:0 auto; }
        .feat-bento   { display:grid; grid-template-columns:1.15fr 0.92fr 0.92fr; grid-template-rows:auto auto; gap:12px; }
        .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .footer-grid  { display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; gap:40px; margin-bottom:60px; }
        .footer-bottom{ display:flex; justify-content:space-between; align-items:center; padding-top:28px; border-top:1px solid rgba(255,255,255,0.07); flex-wrap:wrap; gap:16px; }
        .feat-header  { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:72px; gap:40px; flex-wrap:wrap; }
        .upload-steps { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:24px; }

        /* Bento spans */
        .feat-r2 { grid-row: span 2; }
        .feat-c2 { grid-column: span 2; }

        /* ── Mobile: ≤ 768px ─────────────────────────────────── */
        @media (max-width: 768px) {
          /* Paddings */
          .sl-section   { padding: 64px 20px !important; }
          .sl-hero-sec  { padding: 100px 20px 56px !important; }
          .sl-stats-pad { padding: 40px 20px !important; }
          .sl-nav-inner { padding: 0 20px !important; }

          /* Hero CTAs — stack vertically */
          .sl-ctas { flex-direction: column !important; align-items: stretch !important; margin-top: 32px !important; }
          .sl-ctas a, .sl-ctas button { text-align: center !important; justify-content: center !important; }

          /* Hide divider in social proof */
          .sl-sp-divider { display: none !important; }
          .sl-social-proof { margin-top: 36px !important; gap: 12px !important; }

          /* Stats: 2 columns */
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 0 !important; }
          .stats-grid > div { padding: 20px 16px !important; }
          .stats-grid > div:nth-child(2)  { border-right: none !important; }
          .stats-grid > div:nth-child(n+3){ border-top: 1px solid rgba(255,255,255,0.07); }

          /* Distribution: single column */
          .distro-wrap { grid-template-columns: 1fr !important; gap: 40px !important; }

          /* Features header: stack */
          .feat-header { flex-direction: column !important; align-items: flex-start !important; margin-bottom: 40px !important; gap: 20px !important; }

          /* Features bento: single column */
          .feat-bento { grid-template-columns: 1fr !important; }
          .feat-bento > * { grid-column: auto !important; grid-row: auto !important; }
          .feat-r2 { grid-row: auto !important; }
          .feat-c2 { grid-column: auto !important; }

          /* Upload steps: single column */
          .upload-steps { grid-template-columns: 1fr !important; }

          /* Pricing: single column */
          .pricing-grid { grid-template-columns: 1fr !important; }

          /* Footer: 2-column, then single */
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
          .footer-bottom { flex-direction: column !important; align-items: flex-start !important; }
        }

        /* ── Extra small: ≤ 480px ───────────────────────────── */
        @media (max-width: 480px) {
          .footer-grid  { grid-template-columns: 1fr !important; }
          .stats-grid   { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </>
  );
}
