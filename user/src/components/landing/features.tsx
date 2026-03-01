"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

function useIntersection(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function WorldMapDots() {
  const dots = [{l:12,t:38},{l:22,t:28},{l:33,t:45},{l:46,t:24},{l:54,t:58},{l:62,t:32},{l:70,t:50},{l:78,t:36},{l:86,t:22},{l:91,t:62},{l:17,t:68},{l:38,t:72},{l:56,t:75}];
  return (
    <div style={{ margin:"28px 0 0",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"14px",padding:"18px",position:"relative",overflow:"hidden",height:"180px" }}>
      {/* label */}
      <div style={{ position:"relative",zIndex:1,fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:"0.1em",color:"#777",textTransform:"uppercase",marginBottom:"10px" }}>Live Delivery Network</div>
      {/* dots layer — behind everything */}
      <div style={{ position:"absolute",inset:0,zIndex:0 }}>
        {dots.map((p,i) => (
          <div key={i} style={{ position:"absolute",left:`${p.l}%`,top:`${p.t}%`,width:"7px",height:"7px",borderRadius:"50%",background:"#C8F135",animation:"pingDot 3s ease-in-out infinite",animationDelay:`${(i*0.38)%3}s` }}>
            <div style={{ position:"absolute",inset:"-4px",borderRadius:"50%",border:"1px solid rgba(200,241,53,0.4)",animation:"pingRing 3s ease-in-out infinite",animationDelay:`${(i*0.38)%3}s` }} />
          </div>
        ))}
      </div>
      {/* stat boxes — always on top */}
      <div style={{ position:"absolute",bottom:"14px",left:"14px",right:"14px",display:"flex",gap:"10px",zIndex:2 }}>
        {[{n:"150",s:"+",l:"Platforms"},{n:"200",s:"+",l:"Countries"}].map(stat => (
          <div key={stat.l} style={{ flex:1,background:"var(--card3)",border:"1px solid var(--border)",borderRadius:"10px",padding:"12px 14px",backdropFilter:"blur(4px)" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"32px",lineHeight:1,color:"#EFEFEF" }}>{stat.n}<span style={{ color:"#C8F135" }}>{stat.s}</span></div>
            <div style={{ fontSize:"10px",color:"#777",fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.05em",marginTop:"3px" }}>{stat.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsWidget() {
  const [count, setCount] = useState(0);
  const { ref, visible } = useIntersection(0.5);
  useEffect(() => {
    if (!visible) return;
    const start = Date.now(), dur = 2000, target = 2400000;
    const tick = () => { const p = Math.min((Date.now()-start)/dur,1); const ease = 1-Math.pow(1-p,3); setCount(Math.floor(ease*target)); if(p<1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }, [visible]);
  const fmt = count>=1e6?(count/1e6).toFixed(1)+'M':count>=1e3?(count/1e3).toFixed(0)+'K':count;
  const xs=[0,28,56,84,112,140,168,200], ys=[43,36,28,20,26,13,6,1];
  const line = xs.map((x,i)=>(i===0?'M':'L')+x+','+ys[i]).join(' ');
  return (
    <div ref={ref} style={{ marginTop:"24px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"14px",padding:"18px" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",flexWrap:"wrap",gap:"8px" }}>
        <div style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:"0.1em",color:"#777",textTransform:"uppercase" }}>Monthly Streams</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"28px",lineHeight:1,color:"#C8F135",display:"flex",alignItems:"center",gap:"6px" }}>
          {fmt} <span style={{ fontFamily:"'Syne',sans-serif",fontSize:"10px",fontWeight:700,background:"rgba(200,241,53,0.12)",border:"1px solid rgba(200,241,53,0.18)",color:"#C8F135",padding:"2px 7px",borderRadius:"5px" }}>↑ 34%</span>
        </div>
      </div>
      <svg style={{ width:"100%",height:"48px" }} viewBox="0 0 200 48" preserveAspectRatio="none">
        <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C8F135" stopOpacity="0.14"/><stop offset="100%" stopColor="#C8F135" stopOpacity="0"/></linearGradient></defs>
        <path d={line+' L200,48 L0,48 Z'} fill="url(#sg)" stroke="none" />
        <path d={line} fill="none" stroke="#C8F135" strokeWidth="1.5" />
      </svg>
      <div style={{ marginTop:"12px" }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:"11px",color:"#777",marginBottom:"6px" }}><span>Listener Growth</span><span style={{ color:"#C8F135" }}>+17k this week</span></div>
        <div style={{ height:"3px",background:"rgba(255,255,255,0.06)",borderRadius:"4px",overflow:"hidden" }}>
          <div style={{ height:"100%",background:"linear-gradient(90deg,#C8F135,#a8f040)",borderRadius:"4px",animation:"fillAnim 2s 0.5s ease both" }} />
        </div>
      </div>
    </div>
  );
}

function GoingLiveWidget() {
  // 5 bars that animate with staggered delays — like signal strength
  const bars = [
    { h: "30%",  delay: "0s"    },
    { h: "55%",  delay: "0.15s" },
    { h: "80%",  delay: "0.3s"  },
    { h: "55%",  delay: "0.45s" },
    { h: "30%",  delay: "0.6s"  },
  ];
  return (
    <div style={{ background:"var(--card3)",border:"1px solid var(--border)",borderRadius:"14px",padding:"24px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:"14px", minHeight: "120px" }}>
      {/* Upload SVG icon */}
      <div style={{ width:"40px",height:"40px",borderRadius:"12px",background:"rgba(200,241,53,0.08)",border:"1px solid rgba(200,241,53,0.18)",display:"flex",alignItems:"center",justifyContent:"center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="17 8 12 3 7 8"/>
          <line x1="12" y1="3" x2="12" y2="15"/>
        </svg>
      </div>

      {/* Signal bars */}
      <div style={{ display:"flex",alignItems:"flex-end",gap:"5px",height:"36px" }}>
        {bars.map((b, i) => (
          <div key={i} style={{
            width:"8px", height:"100%",
            display:"flex", alignItems:"flex-end",
          }}>
            <div style={{
              width:"100%", height: b.h,
              background:"#C8F135", borderRadius:"3px",
              animation:"signalPulse 1.4s ease-in-out infinite",
              animationDelay: b.delay,
              opacity: 0.85,
            }} />
          </div>
        ))}
      </div>

      {/* Live badge */}
      <div style={{ display:"flex",alignItems:"center",gap:"6px" }}>
        <div style={{ width:"7px",height:"7px",background:"#C8F135",borderRadius:"50%",animation:"dotPulse 1.5s ease-in-out infinite",flexShrink:0 }} />
        <span style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.12em",color:"#C8F135",textTransform:"uppercase" }}>Going Live</span>
      </div>

      <style>{`
        @keyframes signalPulse {
          0%,100% { opacity: 0.25; transform: scaleY(0.6); }
          50%      { opacity: 1;    transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}


function FeatCard({ children, style, span }: { children: React.ReactNode; style?: React.CSSProperties; span?: string }) {
  const { ref, visible } = useIntersection(0.1);
  const [cx,setCx] = useState("50%"), [cy,setCy] = useState("50%"), [hovered,setHovered] = useState(false);
  return (
    <div ref={ref}
      className={span==="c2"?"feat-c2":span==="r2"?"feat-r2":undefined}
      style={{ background:"var(--card)",border:"1px solid var(--border)",borderRadius:"20px",padding:"36px 32px",position:"relative",overflow:"hidden",transition:"border-color 0.35s,transform 0.35s,box-shadow 0.35s,opacity 0.65s",opacity:visible?1:0,transform:visible?"translateY(0)":"translateY(28px)",...style }}
      onMouseMove={e=>{const r=(e.currentTarget as HTMLDivElement).getBoundingClientRect();setCx(`${e.clientX-r.left}px`);setCy(`${e.clientY-r.top}px`);}}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    >
      <div style={{ position:"absolute",inset:0,borderRadius:"20px",zIndex:0,pointerEvents:"none",background:`radial-gradient(400px circle at ${cx} ${cy}, rgba(200,241,53,0.05), transparent 60%)`,opacity:hovered?1:0,transition:"opacity 0.35s" }} />
      <div style={{ position:"relative",zIndex:1 }}>{children}</div>
    </div>
  );
}

function IconBox({ color, children }: { color:string; children:React.ReactNode }) {
  const c: Record<string,{bg:string;border:string}> = { lime:{bg:"rgba(200,241,53,0.08)",border:"rgba(200,241,53,0.15)"},sky:{bg:"rgba(56,189,248,0.08)",border:"rgba(56,189,248,0.15)"},amber:{bg:"rgba(251,191,36,0.08)",border:"rgba(251,191,36,0.15)"},violet:{bg:"rgba(167,139,250,0.08)",border:"rgba(167,139,250,0.15)"},rose:{bg:"rgba(251,113,133,0.08)",border:"rgba(251,113,133,0.15)"} };
  const s = c[color]||c.lime;
  return <div style={{ width:"50px",height:"50px",borderRadius:"13px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",marginBottom:"22px",border:`1px solid ${s.border}`,background:s.bg }}>{children}</div>;
}

export function Features() {
  return (
    <section id="features" className="sl-section" style={{ background:"var(--off-black)",position:"relative",overflow:"hidden" }}>
      {/* Dot grid */}
      <div style={{ position:"absolute",inset:0,zIndex:0,backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",backgroundSize:"28px 28px",maskImage:"radial-gradient(ellipse 100% 60% at 50% 0%, black 30%, transparent 80%)",WebkitMaskImage:"radial-gradient(ellipse 100% 60% at 50% 0%, black 30%, transparent 80%)" }} />

      <div style={{ maxWidth:"1200px",margin:"0 auto",position:"relative",zIndex:1 }}>
        {/* Header — feat-header stacks on mobile */}
        <div className="feat-header">
          <div>
            <div style={{ display:"inline-flex",alignItems:"center",gap:"7px",background:"rgba(200,241,53,0.07)",border:"1px solid rgba(200,241,53,0.18)",padding:"5px 14px",borderRadius:"100px",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:"0.14em",color:"#C8F135",textTransform:"uppercase",marginBottom:"20px" }}>
              <span style={{ width:"6px",height:"6px",borderRadius:"50%",background:"#C8F135",animation:"dotPulse 2s ease-in-out infinite" }} />
              Why Swara Digital
            </div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(42px,6vw,86px)",lineHeight:0.9,letterSpacing:"0.01em",color:"#EFEFEF" }}>
              Everything you need<br />to <span style={{ color:"#C8F135" }}>succeed.</span>
            </h2>
          </div>
          <div style={{ maxWidth:"300px" }}>
            <p style={{ fontSize:"15px",lineHeight:1.75,color:"#aaa",marginBottom:"20px",fontFamily:"'Syne',sans-serif" }}>
              Powerful tools and global reach, designed for the modern independent artist.
            </p>
            <Link href="#pricing" style={{ display:"inline-flex",alignItems:"center",gap:"8px",background:"transparent",border:"1px solid rgba(200,241,53,0.18)",color:"#C8F135",fontSize:"13px",fontWeight:600,padding:"10px 20px",borderRadius:"8px",textDecoration:"none",transition:"background 0.2s",fontFamily:"'Syne',sans-serif" }}
              onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(200,241,53,0.08)"}
              onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background="transparent"}
            >Explore all features →</Link>
          </div>
        </div>

        {/* Bento — feat-bento CSS class handles columns on mobile */}
        <div className="feat-bento">
          <FeatCard span="r2">
            <IconBox color="lime">
              {/* Globe */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8F135" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/>
              </svg>
            </IconBox>
            <h3 style={{ fontSize:"19px",fontWeight:700,letterSpacing:"-0.025em",marginBottom:"10px",lineHeight:1.2,color:"#EFEFEF",fontFamily:"'Syne',sans-serif" }}>Global Distribution</h3>
            <p style={{ fontSize:"14px",lineHeight:1.75,color:"#aaa",fontFamily:"'Syne',sans-serif" }}>Get your music on Spotify, Apple Music, TikTok, and 150+ other stores worldwide. One upload, everywhere.</p>
            <WorldMapDots />
          </FeatCard>

          <FeatCard>
            <IconBox color="sky">
              {/* Bar chart */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9"/>
                <rect x="10" y="7" width="4" height="14"/>
                <rect x="17" y="3" width="4" height="18"/>
              </svg>
            </IconBox>
            <h3 style={{ fontSize:"19px",fontWeight:700,letterSpacing:"-0.025em",marginBottom:"10px",lineHeight:1.2,color:"#EFEFEF",fontFamily:"'Syne',sans-serif" }}>Real-time Analytics</h3>
            <p style={{ fontSize:"14px",lineHeight:1.75,color:"#aaa",fontFamily:"'Syne',sans-serif" }}>Detailed insights on streams, listeners, and earnings — all live.</p>
            <AnalyticsWidget />
          </FeatCard>

          <FeatCard>
            <IconBox color="amber">
              {/* Coins / royalties */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="6"/>
                <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
                <path d="M7 6h1v4"/>
                <path d="m16.71 13.88.7.71-2.82 2.82"/>
              </svg>
            </IconBox>
            <h3 style={{ fontSize:"19px",fontWeight:700,letterSpacing:"-0.025em",marginBottom:"10px",lineHeight:1.2,color:"#EFEFEF",fontFamily:"'Syne',sans-serif" }}>100% Royalties</h3>
            <p style={{ fontSize:"14px",lineHeight:1.75,color:"#aaa",fontFamily:"'Syne',sans-serif" }}>Keep every cent you earn. We believe artists should be paid fairly.</p>
            <div style={{ marginTop:"22px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"14px",padding:"18px" }}>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px" }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif",fontSize:"52px",lineHeight:1,color:"#C8F135",letterSpacing:"0.01em" }}>100%</div>
                <div style={{ width:"66px",height:"66px",borderRadius:"50%",background:"conic-gradient(#C8F135 0% 100%, rgba(255,255,255,0.05) 100%)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(200,241,53,0.2)",flexShrink:0 }}>
                  <div style={{ width:"46px",height:"46px",borderRadius:"50%",background:"var(--card2)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Bebas Neue'",fontSize:"16px",color:"#C8F135" }}>100%</div>
                </div>
              </div>
              <div style={{ height:"1px",background:"var(--border)",margin:"12px 0" }} />
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#777",marginBottom:"8px",fontFamily:"'Syne',sans-serif" }}><span>Platform cut</span><span style={{ color:"#f87171",fontWeight:600 }}>$0.00</span></div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#777",fontFamily:"'Syne',sans-serif" }}><span>Your earnings</span><span style={{ color:"#EFEFEF",fontWeight:600 }}>Everything</span></div>
            </div>
          </FeatCard>

          <FeatCard span="c2">
            <IconBox color="violet">
              {/* Zap / lightning */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </IconBox>
            <h3 style={{ fontSize:"19px",fontWeight:700,letterSpacing:"-0.025em",marginBottom:"10px",lineHeight:1.2,color:"#EFEFEF",fontFamily:"'Syne',sans-serif" }}>Ultra-Fast Uploads</h3>
            <p style={{ fontSize:"14px",lineHeight:1.75,color:"#aaa",fontFamily:"'Syne',sans-serif" }}>Our streamlined process gets your music live faster than ever.</p>
            {/* upload-steps CSS class handles 2-col → 1-col on mobile */}
            <div className="upload-steps">
              <div style={{ display:"flex",flexDirection:"column",gap:"9px" }}>
                {[{label:"Upload your track & artwork",done:true},{label:"Set release date & metadata",done:true},{label:"Review & confirm details",done:false,num:"3"},{label:"Go live on all platforms",done:false,num:"4"}].map((step,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:"12px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"10px",padding:"11px 14px",fontSize:"13px",color:"#aaa",fontFamily:"'Syne',sans-serif",transition:"border-color 0.25s,background 0.25s" }}
                    onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,241,53,0.18)";(e.currentTarget as HTMLDivElement).style.background="rgba(200,241,53,0.02)";}}
                    onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.07)";(e.currentTarget as HTMLDivElement).style.background="var(--card2)";}}
                  >
                    <span style={{ width:"24px",height:"24px",flexShrink:0,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:700,border:"1px solid",background:step.done?"rgba(200,241,53,0.1)":"rgba(255,255,255,0.03)",borderColor:step.done?"rgba(200,241,53,0.3)":"rgba(255,255,255,0.07)",color:step.done?"#C8F135":"#777" }}>
                      {step.done?"✓":step.num}
                    </span>
                    {step.label}
                  </div>
                ))}
              </div>
              <GoingLiveWidget />
            </div>
          </FeatCard>

          <FeatCard>
            <IconBox color="rose">
              {/* Shield */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </IconBox>
            <h3 style={{ fontSize:"19px",fontWeight:700,letterSpacing:"-0.025em",marginBottom:"10px",lineHeight:1.2,color:"#EFEFEF",fontFamily:"'Syne',sans-serif" }}>Secure &amp; Verified</h3>
            <p style={{ fontSize:"14px",lineHeight:1.75,color:"#aaa",fontFamily:"'Syne',sans-serif" }}>Your data and rights are protected with industry-leading measures.</p>
            <div style={{ marginTop:"24px",display:"flex",flexDirection:"column",gap:"9px" }}>
              {[
                { icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#22c55e" stroke="none"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ), title:"Spotify Verified", sub:"Official artist badge" },
                { icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e879f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                ), title:"Apple Music Artist", sub:"Verified profile" },
                { icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                ), title:"Rights Protected", sub:"ISRC & copyright" },
              ].map(badge => (
                <div key={badge.title} style={{ display:"flex",alignItems:"center",gap:"12px",background:"var(--card2)",border:"1px solid var(--border)",borderRadius:"12px",padding:"12px 16px",transition:"border-color 0.25s,transform 0.25s" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(200,241,53,0.2)";(e.currentTarget as HTMLDivElement).style.transform="translateX(4px)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="rgba(255,255,255,0.07)";(e.currentTarget as HTMLDivElement).style.transform="translateX(0)";}}
                >
                  <span style={{ fontSize:"18px",flexShrink:0 }}>{badge.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"13px",fontWeight:600,color:"#EFEFEF",fontFamily:"'Syne',sans-serif" }}>{badge.title}</div>
                    <div style={{ fontSize:"11px",color:"#777",marginTop:"1px",fontFamily:"'Syne',sans-serif" }}>{badge.sub}</div>
                  </div>
                  <div style={{ marginLeft:"auto",width:"20px",height:"20px",borderRadius:"50%",background:"rgba(200,241,53,0.1)",border:"1px solid rgba(200,241,53,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",color:"#C8F135",fontWeight:700,flexShrink:0 }}>✓</div>
                </div>
              ))}
            </div>
          </FeatCard>
        </div>
      </div>
    </section>
  );
}
