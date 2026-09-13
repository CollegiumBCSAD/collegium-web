"use client";

import React from "react";
import Link from "next/link";
import { Tournament, GameId } from "@/types";
import { mockTournaments } from "@/lib/mock/tournaments";
import { TrophyIcon } from "@/components/ui/Icons";

interface HomeTournamentsWidgetProps {
  tournaments: Tournament[];
  activeGame: GameId;
}

export default function HomeTournamentsWidget({
  tournaments,
  activeGame,
}: HomeTournamentsWidgetProps) {
  const displayTournaments = React.useMemo(() => {
    return tournaments
      .filter((t) => {
        if (!t.game && !t.gameTitle) return true;
        const g = (t.gameTitle || t.game || "").toLowerCase();
        if (activeGame === "valo") return g.includes("val");
        if (activeGame === "lol") return g.includes("lol") || g.includes("league");
        if (activeGame === "codm") return g.includes("cod") || g.includes("call");
        if (activeGame === "ml") return g.includes("ml") || g.includes("mobile");
        return true;
      })
      .slice(0, 3);
  }, [tournaments, activeGame]);

  return (
    <div className="w-full space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202C48]/50 pb-2.5">
        <div className="flex items-center gap-2">
          <TrophyIcon className="w-4 h-4 text-primary-brand" />
          <h2 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-white">
            Circuit Brackets
          </h2>
        </div>

        <Link
          href="/tournaments"
          className="font-mono text-xs font-bold text-primary-brand hover:underline flex items-center gap-1 uppercase tracking-wider"
        >
          <span>All Events</span>
          <span>→</span>
        </Link>
      </div>

      {/* Tournament Cards */}
      {displayTournaments.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-gradient-to-b from-[#0B101E]/40 via-[#0B101E]/20 to-transparent border border-dashed border-[#202E4C]/50 backdrop-blur-xs space-y-1.5">
          <p className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            No active tournaments for this circuit
          </p>
          <p className="font-sans text-[11px] text-slate-400">
            Check back as collegiate organizers create new championship brackets.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayTournaments.map((t) => {
            const isLive = t.status === "LIVE";
            const isCompleted = t.status === "COMPLETED";

          return (
            <Link
              key={t.id}
              href="/tournaments"
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-[#0D1220] hover:bg-[#121828] border border-[#18233B] hover:border-primary-brand/40 transition-all duration-150 p-3 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-wider ${
                    isLive
                      ? "bg-rose-500/20 border border-rose-500/50 text-rose-400 animate-pulse"
                      : isCompleted
                      ? "bg-[#141B2D] text-slate-300"
                      : "bg-primary-brand/20 border border-primary-brand/40 text-primary-brand"
                  }`}
                >
                  {t.status}
                </span>

                <span className="font-mono text-[10px] text-slate-400 font-semibold">
                  {t.bulletPoints?.[0] || "8 Universities"}
                </span>
              </div>

              {/* Tournament Title & Status */}
              <div className="space-y-0.5">
                <h3 className="font-sans text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-100 group-hover:text-primary-brand transition-colors line-clamp-1">
                  {t.title}
                </h3>
                <p className="font-sans text-[11px] text-slate-400 line-clamp-1">
                  {t.statusText}
                </p>
              </div>

              {/* Action link */}
              <div className="pt-2 mt-2 border-t border-[#18233B] flex items-center justify-between font-mono text-[10px] text-slate-400">
                <span>Official Bracket</span>
                <span className="text-primary-brand font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>View Bracket</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    )}
  </div>
  );
}
