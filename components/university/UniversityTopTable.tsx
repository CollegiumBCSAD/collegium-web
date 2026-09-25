"use client";

import Link from "next/link";
import { UniversityTopTableProps } from "@/types";
import { getUniversityBranding, mutedBranding } from "@/lib/universityBranding";
import UniversityShield from "./UniversityShield";
import { DOT_SURFACE } from "./surface";

const rated = (r?: number) => (r !== undefined ? Math.round(r) : "—");

// Broadcast-style standings: the leader gets a featured block, 2nd and 3rd
// sit below as compact rows showing their gap to the top.
export default function UniversityTopTable({ universities }: UniversityTopTableProps) {
  const [leader, ...chasers] = [...universities]
    .sort((a, b) => (b.glicko2_rating ?? 0) - (a.glicko2_rating ?? 0))
    .slice(0, 3);

  return (
    <div className={`rounded-2xl border border-white/[0.08] ${DOT_SURFACE} overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_30px_60px_-30px_rgba(0,0,0,0.95)]`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400">Top of the table</span>
        <Link
          href="/leaderboard"
          className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
          Full rankings <span className="text-primary-brand">→</span>
        </Link>
      </div>

      {!leader ? (
        <p className="px-5 py-10 text-center text-xs font-mono text-slate-600">No rated programs yet</p>
      ) : (
        <>
          {(() => {
            const brand = getUniversityBranding(leader.name, leader.domain);
            const muted = mutedBranding(brand);
            const streak = leader.streak && leader.streak !== "-" ? `${leader.streak} streak` : null;
            return (
              <Link
                href={`/university/${leader.id}`}
                className="group relative block overflow-hidden px-5 py-5"
                style={{ background: `linear-gradient(115deg, color-mix(in srgb, ${muted.primary} 26%, transparent), transparent 65%)` }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -bottom-8 font-display text-[8.5rem] font-black leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)]"
                >
                  01
                </span>
                <div className="relative flex items-center gap-4">
                  <UniversityShield
                    abbr={brand.abbr}
                    primary={muted.primary}
                    secondary={muted.secondary}
                    className="w-14 h-16 shrink-0 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">Leader</span>
                    <span className="block mt-0.5 font-display text-lg font-black uppercase leading-tight text-white truncate">{leader.name}</span>
                    <span className="block mt-0.5 text-[11px] font-sans text-slate-400 truncate">
                      {leader.teamName || "No squad"} · {leader.wins ?? 0}–{leader.losses ?? 0}
                      {streak && <> · <span className={streak.includes("W") ? "text-success" : ""}>{streak}</span></>}
                    </span>
                  </div>
                  <span className="font-display text-4xl font-black tabular-nums leading-none text-white">{rated(leader.glicko2_rating)}</span>
                </div>
              </Link>
            );
          })()}

          <ol>
            {chasers.map((u, i) => {
              const brand = getUniversityBranding(u.name, u.domain);
              const muted = mutedBranding(brand);
              const gap = Math.round((u.glicko2_rating ?? 0) - (leader.glicko2_rating ?? 0));
              return (
                <li key={`${u.id}-${u.teamId ?? i}`} className="border-t border-white/[0.05]">
                  <Link href={`/university/${u.id}`} className="group relative flex items-center gap-3.5 px-5 py-3 transition-colors hover:bg-white/[0.03]">
                    <span aria-hidden className="absolute left-0 inset-y-0 w-[3px] opacity-60 group-hover:opacity-100 transition-opacity" style={{ background: muted.primary }} />
                    <span className="w-8 shrink-0 font-display text-2xl font-black leading-none tabular-nums text-transparent [-webkit-text-stroke:1px_rgba(148,163,184,0.45)]">
                      {String(i + 2).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-black uppercase text-white truncate">{u.name}</span>
                      <span className="block text-[11px] font-sans text-slate-500 truncate">{u.teamName || "No squad"}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-display text-xl font-black tabular-nums leading-none text-white">{rated(u.glicko2_rating)}</span>
                      <span className="block mt-1 text-[10px] font-mono tabular-nums text-slate-500">{gap === 0 ? "level" : `${gap}`}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
