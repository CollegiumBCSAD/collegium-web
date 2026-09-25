"use client";

import Link from "next/link";
import { RankingsPodiumProps } from "@/types";
import { MEDALS, PROVISIONAL_HINT, getWinRateColor } from "@/lib/rankings";
import { getUniversityBranding, mutedBranding } from "@/lib/universityBranding";
import UniversityShield from "@/components/university/UniversityShield";

const STEP: Record<number, string> = { 1: "h-36", 2: "h-24", 3: "h-16" };
const RING = 2 * Math.PI * 22;

// The podium as a lit stage: spotlight beams from above, medal-lit cards on
// 3D blocks (top face + front face), and a reflective floor beneath.
export default function RankingsPodium({ top, gameDisplayName }: RankingsPodiumProps) {
  const order = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#06080D] px-5 sm:px-10 pt-8 pb-0">
      {/* Spotlights, strongest on the champion */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 -top-10 h-[130%] w-[46%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_38%,rgba(245,196,81,0.3)_50%,transparent_62%)] blur-sm" />
        <div className="absolute left-[16%] -top-10 h-[120%] w-[34%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_42%,rgba(201,209,224,0.16)_50%,transparent_58%)] blur-sm" />
        <div className="absolute left-[84%] -top-10 h-[120%] w-[34%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_42%,rgba(208,138,85,0.16)_50%,transparent_58%)] blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(100,116,160,0.1)_1px,transparent_1px)] bg-[size:14px_14px]" />
      </div>

      <div className="relative flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-black uppercase tracking-wide text-white">Podium</h2>
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">Top 3 · {gameDisplayName}</span>
      </div>

      <div className="relative mt-8 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,1fr)] gap-6 md:gap-8 items-end">
        {order.map((entry) => {
          const place = entry.rank;
          const medal = MEDALS[place] ?? MEDALS[3];
          const champ = place === 1;
          const winColor = getWinRateColor(entry.winRate);
          const brand = getUniversityBranding(entry.university, entry.domain ?? "");
          const muted = mutedBranding(brand);
          const streakTone = entry.streak.includes("W") ? "text-success" : entry.streak.includes("L") ? "text-rose-400" : "text-slate-400";

          return (
            <div key={entry.id} className={`flex min-w-0 flex-col ${champ ? "order-first md:order-none" : ""}`}>
              <Link
                href={`/university/${entry.id}`}
                className={`group relative overflow-hidden rounded-2xl border bg-[#0A0D15]/95 backdrop-blur-md transition-all duration-500 hover:-translate-y-1.5 ${champ ? "p-7" : "p-6"}`}
                style={{
                  borderColor: `rgba(${medal.rgb}, ${champ ? 0.55 : 0.28})`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 30px 70px -30px rgba(${medal.rgb}, ${champ ? 0.8 : 0.4})`,
                }}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${medal.color}, transparent)` }} />
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-70 group-hover:opacity-100"
                  style={{ background: `radial-gradient(90% 55% at 50% 0%, rgba(${medal.rgb}, ${champ ? 0.2 : 0.1}), transparent 70%)` }}
                />

                <div className="relative flex items-center gap-4">
                  <UniversityShield
                    abbr={brand.abbr}
                    primary={muted.primary}
                    secondary={muted.secondary}
                    className={`${champ ? "w-16 h-[4.7rem]" : "w-12 h-14"} shrink-0 transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105`}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em]" style={{ color: medal.color }}>
                      {medal.label} · #{place}
                      {entry.isProvisional && (
                        <span className="text-slate-500 tracking-widest" title={PROVISIONAL_HINT}>
                          Provisional
                        </span>
                      )}
                    </span>
                    <h3 className={`mt-1 font-display font-black uppercase leading-tight text-white line-clamp-2 break-words ${champ ? "text-2xl xl:text-3xl" : "text-lg xl:text-xl"}`}>
                      {entry.teamName || entry.university}
                    </h3>
                    <p className="text-xs font-sans text-slate-400 truncate">{entry.university}</p>
                  </div>
                </div>

                <div className="relative mt-6">
                  <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-slate-500">Glicko-2 rating</span>
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-display font-black tabular-nums leading-none ${champ ? "text-5xl xl:text-6xl text-transparent bg-clip-text" : "text-4xl xl:text-5xl text-white"}`}
                      style={champ ? { backgroundImage: `linear-gradient(180deg, #fff 30%, ${medal.color})` } : undefined}
                    >
                      {entry.rating.toFixed(1)}
                    </span>
                    <span className="text-xs font-mono text-slate-500" title="Rating deviation">
                      ±{Math.round(entry.rd ?? 350)} RD
                    </span>
                  </div>
                </div>

                <div className="relative mt-5 grid grid-cols-3 items-center gap-3 rounded-xl border border-white/[0.06] bg-black/35 px-4 py-3">
                  <span className="flex items-center gap-2.5" title="Win rate">
                    <svg viewBox="0 0 52 52" className="w-11 h-11 shrink-0 -rotate-90">
                      <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                      <circle
                        cx="26"
                        cy="26"
                        r="22"
                        fill="none"
                        stroke={winColor}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={RING}
                        strokeDashoffset={RING * (1 - Math.max(0, Math.min(100, entry.winRate)) / 100)}
                      />
                    </svg>
                    <span className="font-display text-lg font-black leading-none" style={{ color: winColor }}>
                      {entry.winRate}%
                    </span>
                  </span>
                  <span className="border-l border-white/[0.07] pl-3">
                    <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">W–L</span>
                    <span className="font-display text-lg font-black text-white tabular-nums">
                      {entry.wins ?? 0}–{entry.losses ?? 0}
                    </span>
                  </span>
                  <span className="border-l border-white/[0.07] pl-3">
                    <span className="block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Streak</span>
                    <span className={`font-display text-lg font-black ${streakTone}`}>{entry.streak}</span>
                  </span>
                </div>
              </Link>

              {/* 3D block: lit top face over a front face stamped with the place */}
              <div className="mx-3 mt-3">
                <div
                  className="h-3"
                  style={{
                    clipPath: "polygon(3% 0, 97% 0, 100% 100%, 0 100%)",
                    background: `linear-gradient(180deg, rgba(${medal.rgb}, 0.45), rgba(${medal.rgb}, 0.18))`,
                  }}
                />
                <div
                  className={`relative ${STEP[place] ?? "h-16"} overflow-hidden`}
                  style={{ background: `linear-gradient(180deg, rgba(${medal.rgb}, 0.2), rgba(${medal.rgb}, 0.03) 85%)` }}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center font-display text-7xl font-black leading-none text-transparent"
                    style={{ WebkitTextStroke: `2px rgba(${medal.rgb}, 0.7)` }}
                  >
                    {place}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reflective floor */}
      <div aria-hidden className="relative -mx-10 h-10 bg-gradient-to-b from-white/[0.05] to-transparent border-t border-white/[0.08]" />
    </section>
  );
}
