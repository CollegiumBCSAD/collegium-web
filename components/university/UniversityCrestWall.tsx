"use client";

import type { CSSProperties } from "react";
import { UniversityCrestWallProps } from "@/types";
import { getUniversityBranding } from "@/lib/universityBranding";

const OCTAGON = "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)";
const COLUMNS = 7;
const ROWS = 5;

// Hero backdrop built from the directory itself: a tilted wall of every
// listed school's crest in its own colors. Unlike game key art, it's unique
// to this page and changes with the programs actually competing.
export default function UniversityCrestWall({ universities }: UniversityCrestWallProps) {
  const crests = universities.map((u) => getUniversityBranding(u.name, u.domain));
  const tiles = Array.from({ length: COLUMNS * ROWS }, (_, i) => (crests.length ? crests[(i * 3) % crests.length] : null));

  return (
    <div
      aria-hidden
      className="absolute inset-y-0 right-0 w-full md:w-[62%] overflow-hidden [mask-image:linear-gradient(to_left,black_40%,transparent)]"
    >
      <div
        className="absolute -top-16 -right-10 grid gap-3 origin-center"
        style={{ gridTemplateColumns: `repeat(${COLUMNS}, 5.5rem)`, transform: "rotate(-12deg)" }}
      >
        {tiles.map((crest, i) => {
          const row = Math.floor(i / COLUMNS);
          // Stagger alternate rows and vary depth so the wall doesn't read as a flat grid.
          const style: CSSProperties = {
            clipPath: OCTAGON,
            transform: row % 2 ? "translateX(2.9rem)" : undefined,
            opacity: 0.35 + ((i * 37) % 50) / 100,
            background: crest
              ? `linear-gradient(145deg, ${crest.primary}, color-mix(in srgb, ${crest.primary} 35%, #0B0E17))`
              : "#141A2A",
          };
          return (
            <div key={i} className="relative w-[5.5rem] h-[5.5rem] flex items-center justify-center" style={style}>
              <span
                className="absolute inset-[3px] flex items-center justify-center bg-[#0B0E17]/55"
                style={{ clipPath: OCTAGON }}
              >
                <span className="font-display text-sm font-black tracking-tight text-white/85">{crest?.abbr ?? ""}</span>
              </span>
              {crest && <span className="absolute bottom-2 w-5 h-0.5" style={{ background: crest.secondary }} />}
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-transparent to-[#0B0E17]/70" />
    </div>
  );
}
