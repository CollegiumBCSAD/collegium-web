"use client";

import { UniversityMemberStripProps } from "@/types";
import { getUniversityBranding, mutedBranding } from "@/lib/universityBranding";

// Conference flag: one continuous banded bar with a stripe per member school,
// alphabetical and equal width so no program gets more billing. Hovering a
// stripe widens it to reveal the school and a quick stat line; clicking jumps
// to its card.
export default function UniversityMemberStrip({ universities }: UniversityMemberStripProps) {
  const members = Array.from(new Map(universities.map((u) => [u.id, u])).values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  if (members.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">
          Member institutions <span className="text-white">· {members.length}</span>
        </span>
        <span className="hidden sm:block text-[10px] font-mono uppercase tracking-widest text-slate-600">Hover to reveal · click to jump</span>
      </div>

      <div className="flex h-28 overflow-hidden rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_48px_-24px_rgba(0,0,0,0.95)]">
        {members.map((u, i) => {
          const brand = getUniversityBranding(u.name, u.domain);
          const muted = mutedBranding(brand);
          return (
            <a
              key={u.id}
              href={`#uni-${u.id}`}
              aria-label={`Jump to ${u.name}`}
              className="group relative flex-1 min-w-0 overflow-hidden border-r border-black/40 last:border-r-0 transition-[flex-grow] duration-500 ease-out hover:flex-[4] focus-visible:flex-[4] focus-visible:outline-none"
              style={{
                background: `linear-gradient(165deg, color-mix(in srgb, ${muted.primary} 40%, #0B0F18), color-mix(in srgb, ${muted.primary} 12%, #07090F))`,
              }}
            >
              {/* woven texture, sheen and secondary-color hem */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-40"
                style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px)" }}
              />
              <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.09] to-transparent" />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-1" style={{ background: muted.secondary }} />
              <span className="absolute left-2.5 top-2 text-[9px] font-mono tabular-nums text-white/30">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="absolute inset-0 flex items-center justify-center gap-3 px-3">
                <span className="shrink-0 font-display text-base font-black tracking-tight text-white/85 transition-transform duration-500 group-hover:scale-110">
                  {brand.abbr}
                </span>
                {/* revealed on hover as the stripe widens */}
                <span className="hidden min-w-0 border-l border-white/15 pl-3 text-left group-hover:block group-focus-visible:block animate-fade-in">
                  <span className="block font-display text-sm font-black uppercase leading-tight text-white truncate">{u.name}</span>
                  <span className="block mt-0.5 text-[10px] font-mono text-white/60 truncate">
                    {u.glicko2_rating !== undefined ? `${Math.round(u.glicko2_rating)} RTG` : "Unrated"} · {u.wins ?? 0}–{u.losses ?? 0}
                  </span>
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
