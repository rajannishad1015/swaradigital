import React from 'react';

export const IndianPattern = () => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
      <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
            <stop offset="50%" style={{ stopColor: '#FFAA00', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#FFD700', stopOpacity: 0.8 }} />
          </linearGradient>
          
          <pattern id="jaali-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
             {/* Main geometric frame */}
            <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" />
            
            {/* Inner detailed motifs */}
            <circle cx="40" cy="40" r="10" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="4" fill="url(#gold-gradient)" opacity="0.4" />
            
            {/* Connecting lines */}
            <path d="M40 10 L40 30 M40 50 L40 70 M10 40 L30 40 M50 40 L70 40" stroke="url(#gold-gradient)" strokeWidth="0.5" opacity="0.5" />
            
            {/* Corner decorations */}
            <circle cx="0" cy="0" r="8" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" opacity="0.3" />
            <circle cx="80" cy="0" r="8" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" opacity="0.3" />
            <circle cx="0" cy="80" r="8" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" opacity="0.3" />
            <circle cx="80" cy="80" r="8" fill="none" stroke="url(#gold-gradient)" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#jaali-pattern)" />
        
        {/* Radial fade mask to make it subtle at edges */}
        <mask id="fade-mask">
          <radialGradient id="fade-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <rect width="100%" height="100%" fill="url(#fade-grad)" />
        </mask>
      </svg>
    </div>
  );
};

export const FloatingMandala = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`absolute ${className} pointer-events-none`}>
      <svg width="400" height="400" viewBox="0 0 400 400" className="animate-slow-spin opacity-[0.08] will-change-transform">
        <defs>
          <linearGradient id="mandala-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF9933', stopOpacity: 0.6 }} />
            <stop offset="50%" style={{ stopColor: '#FFD700', stopOpacity: 0.4 }} />
            <stop offset="100%" style={{ stopColor: '#138808', stopOpacity: 0.6 }} />
          </linearGradient>
        </defs>
        
        {/* Outer circle */}
        <circle cx="200" cy="200" r="180" fill="none" stroke="url(#mandala-gradient)" strokeWidth="1" opacity="0.3"/>
        <circle cx="200" cy="200" r="160" fill="none" stroke="url(#mandala-gradient)" strokeWidth="1" opacity="0.4"/>
        <circle cx="200" cy="200" r="140" fill="none" stroke="url(#mandala-gradient)" strokeWidth="1" opacity="0.5"/>
        
        {/* Petals - 12 petals */}
        <g transform="translate(200, 200)">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 360) / 12;
            return (
              <g key={i} transform={`rotate(${angle})`}>
                <ellipse cx="0" cy="-140" rx="25" ry="50" fill="url(#mandala-gradient)" opacity="0.3"/>
                <ellipse cx="0" cy="-120" rx="15" ry="30" fill="url(#mandala-gradient)" opacity="0.4"/>
              </g>
            );
          })}
        </g>
        
        {/* Inner decorative circles */}
        {[80, 60, 40].map((radius, i) => (
          <circle 
            key={`inner-${i}`}
            cx="200" 
            cy="200" 
            r={radius} 
            fill="none" 
            stroke="url(#mandala-gradient)" 
            strokeWidth="0.5" 
            opacity={0.5 - i * 0.1}
          />
        ))}
        
        {/* Center flower */}
        <g transform="translate(200, 200)">
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8;
            return (
              <circle
                key={`center-${i}`}
                cx={15 * Math.cos((angle * Math.PI) / 180)}
                cy={15 * Math.sin((angle * Math.PI) / 180)}
                r="4"
                fill="url(#mandala-gradient)"
                opacity="0.6"
              />
            );
          })}
          <circle cx="0" cy="0" r="8" fill="url(#mandala-gradient)" opacity="0.5"/>
        </g>
      </svg>
    </div>
  );
};
