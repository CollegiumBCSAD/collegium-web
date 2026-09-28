"use client";

import { useId } from "react";
import { UniversityShieldProps } from "@/types";

const SHIELD = "M24 2 L44 8 V26 C44 39 35 48 24 54 C13 48 4 39 4 26 V8 Z";

// Collegiate crest: a heraldic shield filled with the school's gradient, a
// lit top edge, and a chevron band under the monogram.
export default function UniversityShield({ abbr, primary, secondary, className = "w-12 h-14" }: UniversityShieldProps) {
  const id = useId().replace(/:/g, "");
  const fontSize = abbr.length >= 5 ? 8.5 : abbr.length === 4 ? 10 : 12.5;

  return (
    <svg viewBox="0 0 48 56" className={`${className} drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)]`} aria-hidden>
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={`color-mix(in srgb, ${primary} 70%, #1E2433)`} />
          <stop offset="100%" stopColor={`color-mix(in srgb, ${primary} 25%, #0A0D15)`} />
        </linearGradient>
        <linearGradient id={`edge-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
          <stop offset="100%" stopColor={`color-mix(in srgb, ${secondary} 60%, transparent)`} />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <path d={SHIELD} />
        </clipPath>
      </defs>

      <path d={SHIELD} fill={`url(#fill-${id})`} />
      <g clipPath={`url(#clip-${id})`}>
        {/* glossy top half */}
        <path d="M0 0 H48 V20 C32 26 16 26 0 20 Z" fill="rgba(255,255,255,0.07)" />
        {/* chevron band in the secondary color */}
        <path d="M4 38 L24 30 L44 38 V42 L24 34 L4 42 Z" fill={`color-mix(in srgb, ${secondary} 55%, transparent)`} />
      </g>
      <path d={SHIELD} fill="none" stroke={`url(#edge-${id})`} strokeWidth="1.5" />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={fontSize}
        className="font-display"
        fontWeight={900}
        fill="#fff"
        letterSpacing="-0.3"
      >
        {abbr}
      </text>
    </svg>
  );
}
