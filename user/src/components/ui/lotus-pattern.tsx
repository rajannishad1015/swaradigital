"use client";

import React from 'react';

export const LotusPattern = () => {
  // A single majestic lotus petal path
  const petalPath = "M0 0 C5 -15 20 -20 25 -35 C30 -20 45 -15 50 0 C45 15 30 20 25 35 C20 20 5 15 0 0";
  
  // Sitar silhouette - refined and elegant
  // Body (Gourd) + Neck + Pegs
  const sitarPath = `
    M15 45 C5 45 0 35 0 25 C0 15 10 10 15 10 C20 8 28 12 30 25 C30 35 25 45 15 45 Z 
    M13 10 L13 -30 L17 -30 L17 10 
    M11 -25 L9 -25 M11 -15 L9 -15 M11 -5 L9 -5 
    M19 -28 L21 -28 M19 -18 L21 -18 M19 -8 L21 -8
  `;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden opacity-[0.08]" 
         style={{ mixBlendMode: 'multiply' }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="generative-luxury-pattern"
            x="0"
            y="0"
            width="160"
            height="160"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            {/* COMPLEX MANDALA (Rotated Petals) at (80,80) */}
            <g transform="translate(80, 80) scale(0.6)">
               {/* 8 Petals rotated around center */}
               {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                 <g key={i} transform={`rotate(${angle}) translate(0, -10)`}>
                   <path d={petalPath} fill="none" stroke="#94a3b8" strokeWidth="1.5" className="text-slate-400" />
                   {/* Inner detail line */}
                   <path d="M25 -30 L25 30" stroke="#cbd5e1" strokeWidth="0.5" />
                 </g>
               ))}
               {/* Center Gold Dot */}
               <circle cx="0" cy="0" r="4" fill="#d97706" className="text-amber-600/80" />
               <circle cx="0" cy="0" r="8" fill="none" stroke="#d97706" strokeWidth="0.5" className="text-amber-600/50" />
            </g>

            {/* SITAR ICONS in corners (0,0) and (160,160) effectively */}
            {/* We place them at (0,0), (0, 160), (160, 0), (160, 160) to tile correctly */}
            {/* Actually, let's place them in the empty spaces: (0,0), (0,160), etc are the corners. 
                Midpoints are (80,0), (0,80), (160,80), (80,160). 
                The Mandala is at (80,80).
                Let's put Sitars at (0,0) and (160,160) which are the same in tiling?
                No, standard grid:
                (0,0): Sitar
                (80,80): Mandala
                (160,160): Sitar implied by (0,0)
             */}
            
            <g transform="translate(0, 0) scale(0.7) rotate(45)">
               <path d={sitarPath} fill="white" stroke="#64748b" strokeWidth="1.2" />
            </g>
            <g transform="translate(160, 0) scale(0.7) rotate(45)">
               <path d={sitarPath} fill="white" stroke="#64748b" strokeWidth="1.2" />
            </g>
             <g transform="translate(0, 160) scale(0.7) rotate(45)">
               <path d={sitarPath} fill="white" stroke="#64748b" strokeWidth="1.2" />
            </g>
            <g transform="translate(160, 160) scale(0.7) rotate(45)">
               <path d={sitarPath} fill="white" stroke="#64748b" strokeWidth="1.2" />
            </g>

          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#generative-luxury-pattern)" />
      </svg>
    </div>
  );
};
