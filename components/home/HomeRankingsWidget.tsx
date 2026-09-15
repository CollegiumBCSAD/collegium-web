"use client";

import React from "react";
import Link from "next/link";
import { University, GameId } from "@/types";
import { mockLeaderboards } from "@/lib/mock/leaderboard";
import { CrownIcon } from "@/components/ui/Icons";

interface HomeRankingsWidgetProps {
  universities: University[];
  activeGame: GameId;
}

const GAME_DISPLAY_KEY: Record<GameId, string> = {
  valo: "VALORANT",
  lol: "LEAGUE OF LEGENDS",
  ml: "MOBILE LEGENDS: BANG BANG",
  codm: "CALL OF DUTY: MOBILE",
};

export default function HomeRankingsWidget({
  universities,
  activeGame,
}: HomeRankingsWidgetProps) {
  const items = React.useMemo(() => {
    const key = GAME_DISPLAY_KEY[activeGame] || "VALORANT";

    if (universities.length > 0) {
      return universities
        .map((u) => {
          const gameRating = u.gameRatings?.find(
            (r) => r.gameTitle.toLowerCase().includes(activeGame)
          );
          const rating = gameRating ? gameRating.glicko2_rating.toFixed(1) : (u.glicko2_rating || 1500).toFixed(1);
          const wins = gameRating ? gameRating.wins : u.wins || 0;
          const losses = gameRating ? gameRating.losses : u.losses || 0;
          const total = wins + losses;
          const winRate = total > 0 ? Math.round((wins / total) * 100) : 50;

          return {
            id: u.id,
            name: u.name,
            rating,
            winRate,
            streak: wins > 0 ? `${Math.min(wins, 9)}W` : `${Math.min(losses, 9)}L`,
          };
        })
        .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
        .slice(0, 5);
    }

    // Match the leaderboard page data
    const fallback = mockLeaderboards[key] || mockLeaderboards.VALORANT || [];
    return fallback.slice(0, 5).map((e) => ({
      id: e.id,
      name: e.university,
      rating: typeof e.rating === "number" ? e.rating.toFixed(1) : String(e.rating),
      winRate: e.winRate,
      streak: e.streak,
    }));
  }, [universities, activeGame]);

  return (
    <div className="w-full space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#202C48]/50 pb-2.5">
        <div className="flex items-center gap-2">
          <CrownIcon className="w-4 h-4 text-amber-400" />
          <h2 className="font-display text-sm sm:text-base font-black uppercase tracking-wider text-white">
            Power Rankings (Top 5)
          </h2>
        </div>

        <Link
          href="/leaderboard"
          className="font-mono text-xs font-bold text-primary-brand hover:underline flex items-center gap-1 uppercase tracking-wider"
        >
          <span>Full Board</span>
          <span>→</span>
        </Link>
      </div>

      {/* Standings Table */}
      {items.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-gradient-to-b from-[#0B101E]/40 via-[#0B101E]/20 to-transparent border border-dashed border-[#202E4C]/50 backdrop-blur-xs space-y-1.5">
          <p className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
            No university rankings recorded yet
          </p>
          <p className="font-sans text-[11px] text-slate-400">
            Rankings update automatically after verified tournament matches.
          </p>
        </div>
      ) : (
        <div className="rounded-xl bg-[#0D1220] border border-[#18233B] divide-y divide-[#141B2D] overflow-hidden shadow-sm">
          {items.map((item, index) => {
            const isFirst = index === 0;

          return (
            <Link
              key={item.id}
              href="/leaderboard"
              className="group flex items-center justify-between gap-3 p-2.5 hover:bg-[#121828] transition-colors"
            >
              {/* Rank & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center font-display font-black text-[10px] shrink-0 ${
                    isFirst
                      ? "bg-amber-500 text-black shadow-sm"
                      : index === 1
                      ? "bg-slate-300 text-black"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-[#141B2D] text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-sans text-xs sm:text-sm font-bold tracking-wide uppercase text-slate-100 group-hover:text-primary-brand transition-colors truncate">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-400">
                    <span>Streak: <span className="text-emerald-400 font-bold">{item.streak}</span></span>
                    <span>•</span>
                    <span>{item.winRate}% WR</span>
                  </div>
                </div>
              </div>

              {/* Rating Score */}
              <div className="flex flex-col items-end shrink-0">
                <span className="font-display text-xs sm:text-sm font-black text-primary-brand">
                  {item.rating}
                </span>
                <span className="font-mono text-[8px] text-slate-500 uppercase tracking-widest font-bold">
                  GLICKO-2
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
