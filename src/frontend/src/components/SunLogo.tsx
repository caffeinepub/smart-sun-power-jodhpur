import React from "react";

interface SunLogoProps {
  size?: number;
  className?: string;
}

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function SunLogo({ size = 40, className = "" }: SunLogoProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Pulse ring */}
      <div
        className="absolute inset-0 rounded-full animate-sun-pulse-ring"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.18 62 / 25%) 0%, transparent 70%)",
        }}
      />
      {/* SVG Sun */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="animate-sun-glow relative z-10"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Smart Sun Power logo"
        role="img"
      >
        <title>Smart Sun Power Logo</title>
        {/* Sun rays (rotating slowly) */}
        <g
          className="animate-sun-rotate"
          style={{ transformOrigin: "50px 50px" }}
        >
          {RAY_ANGLES.map((deg) => {
            const angle = (deg * Math.PI) / 180;
            const x1 = 50 + 30 * Math.cos(angle);
            const y1 = 50 + 30 * Math.sin(angle);
            const x2 = 50 + 44 * Math.cos(angle);
            const y2 = 50 + 44 * Math.sin(angle);
            return (
              <line
                key={deg}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="oklch(0.8 0.2 68)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.9"
              />
            );
          })}
        </g>
        {/* Core circle */}
        <circle cx="50" cy="50" r="22" fill="url(#sunGrad)" />
        {/* Outer glow ring */}
        <circle
          cx="50"
          cy="50"
          r="26"
          fill="none"
          stroke="oklch(0.78 0.18 65)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <defs>
          <radialGradient id="sunGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="oklch(0.92 0.22 80)" />
            <stop offset="50%" stopColor="oklch(0.78 0.2 65)" />
            <stop offset="100%" stopColor="oklch(0.62 0.16 52)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
