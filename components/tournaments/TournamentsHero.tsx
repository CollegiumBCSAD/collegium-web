"use client";

import Image from "next/image";
import { TournamentsHeroProps } from "@/types";
import { approvedTeamCount, formatStart, matchProgress, tournamentCover } from "@/lib/organize";

// Editorial header plus a spotlight on whatever is happening right now:
// the live tournament (with its bracket progress) or, failing that, the next
// one opening up.
export default function TournamentsHero({ gameName, gameShortName, tournaments, onOpen }: TournamentsHeroProps) {
  const count = (status: string) => tournaments.filter((t) => t.status === status).length;
  const live = tournaments.find((t) => t.status === "LIVE");
  const next = tournaments
    .filter((t) => t.status === "UPCOMING")
    .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))[0];
  const spotlight = live ?? next;
  const progress = spotlight ? matchProgress(spotlight) : { played: 0, total: 0 };

  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
      <div>
        <p className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-slate-400">
          <span className="h-px w-8 bg-primary-brand" />
          Collegiate Circuit
          <span className="text-primary-brand">{gameShortName}</span>
        </p>
        <h1 className="mt-5 font-display font-black uppercase leading-[0.88] tracking-tight text-[3.25rem] sm:text-7xl">
          <span className="block text-white">Compete.</span>
          <span className="block text-transparent [-webkit-text-stroke:1.5px_var(--primary-brand)]">Get rated.</span>
        </h1>
        <p className="mt-6 max-w-md text-[15px] font-sans leading-relaxed text-slate-400">
          Sanctioned {gameName} tournaments, where every verified result moves your squad&apos;s rating.{" "}
          <span className="text-white font-semibold">{count("LIVE")} live</span>,{" "}
          <span className="text-white font-semibold">{count("UPCOMING")} open for registration</span>,{" "}
          <span className="text-white font-semibold">{count("COMPLETED")} completed</span>.
        </p>
      </div>

      {spotlight && (
        <button
          type="button"
          onClick={() => onOpen(spotlight)}
          className="group relative block overflow-hidden rounded-2xl border border-white/[0.08] text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.95)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-brand/40"
        >
          <Image
            src={spotlight.image || tournamentCover(spotlight)}
            alt=""
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/75 to-[#07090F]/20" />

          <div className="relative flex min-h-[250px] flex-col justify-end p-6">
            <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">
              {live && <span className="w-1.5 h-1.5 rounded-full bg-primary-brand animate-pulse" />}
              {live ? "Now live" : `Up next${formatStart(spotlight.startDate) ? ` · ${formatStart(spotlight.startDate)}` : ""}`}
            </span>
            <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">{spotlight.title}</h2>
            <p className="mt-1 text-xs font-sans text-slate-300">
              {spotlight.bracketFormat || "Single Elimination"} · {approvedTeamCount(spotlight)} squads
            </p>

            {live && progress.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  <span>Bracket progress</span>
                  <span className="text-white tabular-nums">
                    {progress.played}/{progress.total}
                  </span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {Array.from({ length: progress.total }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < progress.played ? "bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" : "bg-white/15"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <span className="game-theme-btn mt-5 self-start h-10 px-5 gap-2 text-xs">
              {live ? "Open bracket" : "View details"}
              <span>→</span>
            </span>
          </div>
        </button>
      )}
    </section>
  );
}
