"use client";

import React, { useMemo } from 'react';

export const MusicPattern = () => {
  // Generate random data for sound waves to look organic but structured
  const waves = useMemo(() => {
    const newWaves: number[][] = [];
    for (let i = 0; i < 5; i++) {
       const wave: number[] = [];
       // Create a smooth sine wave
       for (let x = 0; x <= 100; x++) {
          // A mix of sine waves for complexity
          const y = Math.sin(x * 0.1 + i) * 10 + Math.sin(x * 0.05) * 5; 
          wave.push(y);
       }
       newWaves.push(wave);
    }
    return newWaves;
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden opacity-[0.15]">
      <svg width="100%" height="100%" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
           <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" style={{ stopColor: '#cbd5e1', stopOpacity: 0 }} />
             <stop offset="50%" style={{ stopColor: '#94a3b8', stopOpacity: 0.8 }} />
             <stop offset="100%" style={{ stopColor: '#cbd5e1', stopOpacity: 0 }} />
           </linearGradient>
         </defs>
         
         {/* Render multiple overlapping waves */}
         {/* We'll use hardcoded paths for reliability and animation simplicity */}
         
         {/* Wave 1 - Slow flowing */}
         <path 
           d="M0 50 Q 25 30, 50 50 T 100 50 T 150 50 T 200 50" 
           fill="none" 
           stroke="url(#wave-gradient)" 
           strokeWidth="0.5"
           vectorEffect="non-scaling-stroke"
           transform="scale(1, 4)"
           className="animate-pulse"
         >
           <animateTransform 
             attributeName="transform" 
             type="translate" 
             from="-100 0" 
             to="0 0" 
             dur="20s" 
             repeatCount="indefinite" 
           />
         </path>

          {/* Abstract Sheet Music Lines - Thin, Elegant, Minimal */}
          <pattern id="music-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
             <line x1="0" y1="20" x2="100" y2="20" stroke="#e2e8f0" strokeWidth="1" />
             <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="1" />
             <line x1="0" y1="30" x2="100" y2="30" stroke="#e2e8f0" strokeWidth="1" />
             <line x1="0" y1="35" x2="100" y2="35" stroke="#e2e8f0" strokeWidth="1" />
             <line x1="0" y1="40" x2="100" y2="40" stroke="#e2e8f0" strokeWidth="1" />
             
             {/* Random minimalist notes */}
             <circle cx="30" cy="30" r="2" fill="#94a3b8" />
             <line x1="30" y1="30" x2="30" y2="10" stroke="#94a3b8" strokeWidth="1" />
             
             <circle cx="70" cy="35" r="2" fill="#94a3b8" />
             <line x1="70" y1="35" x2="70" y2="15" stroke="#94a3b8" strokeWidth="1" />
             <line x1="70" y1="15" x2="80" y2="20" stroke="#94a3b8" strokeWidth="1" />

          </pattern>
          
          <rect width="100%" height="100%" fill="url(#music-grid)" />
      </svg>
      
      {/* Overlay some larger, faint sound waves */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
};
