"use client";

import Image from "next/image";
import { RankingsHeroProps } from "@/types";
import { GAME_LIST } from "@/lib/games";

// Editorial header with the division switcher as art tiles. Switching a
// division changes the global game, exactly like the header game switcher.
export default function RankingsHero({ activeGame, gameDisplayName, programCount, onSelectGame }: RankingsHeroProps) {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
      <div>
        <p className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-slate-400">
          <span className="h-px w-8 bg-primary-brand" />
          Glicko-2 Rankings
          <span className="text-primary-brand">{gameDisplayName}</span>
        </p>
        <h1 className="mt-5 font-display font-black uppercase leading-[0.88] tracking-tight text-[3.25rem] sm:text-7xl">
          <span className="block text-white">The standings.</span>
          <span className="block text-transparent [-webkit-text-stroke:1.5px_var(--primary-brand)]">Earned.</span>
        </h1>
        <p className="mt-6 max-w-md text-[15px] font-sans leading-relaxed text-slate-400">
          <span className="text-white font-semibold">{programCount} varsity programs</span> ranked by Glicko-2 rating and rating
          deviation (<span className="font-mono text-slate-300">RD</span>). Only verified tournament results move the table.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">Competitive division</span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{GAME_LIST.length} titles</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {GAME_LIST.map((g) => {
            const active = activeGame === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelectGame(g.id)}
                aria-pressed={active}
                className={`group relative h-24 overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                  active ? "border-transparent -translate-y-0.5" : "border-white/[0.08] hover:border-white/25"
                }`}
                style={active ? { boxShadow: `0 0 0 1.5px ${g.accentColor}, 0 16px 36px -16px ${g.accentColor}` } : undefined}
              >
                <Image
                  src={g.image}
                  alt=""
                  fill
                  sizes="220px"
                  className={`object-cover transition-all duration-500 group-hover:scale-110 ${active ? "opacity-70" : "opacity-30 grayscale group-hover:opacity-50 group-hover:grayscale-0"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07090F] via-[#07090F]/70 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-3.5">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400">{g.genre}</span>
                  <span className={`font-display text-lg font-black uppercase leading-tight ${active ? "text-white" : "text-slate-300"}`}>
                    {g.shortName}
                  </span>
                </div>
                {active && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full animate-pulse" style={{ background: g.accentColor }} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
