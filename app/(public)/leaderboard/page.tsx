"use client";

import { useState, useEffect } from "react";
import { mockLeaderboards, LeaderboardEntry } from "@/lib/mock/leaderboard";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services";
import { University } from "@/types";
import { LeaderboardSkeletonRow } from "@/components/ui/Skeleton";
import { MedalIcon } from "@/components/ui/Icons";

const GAME_ID_TO_DISPLAY: Record<string, string> = {
  valo: "VALORANT",
  lol: "LEAGUE OF LEGENDS",
  ml: "MOBILE LEGENDS: BANG BANG",
  codm: "CALL OF DUTY: MOBILE",
};

const GAME_ID_TO_ENUM: Record<string, string> = {
  valo: "VALORANT",
  lol: "LOL",
  ml: "MLBB",
  codm: "CODM",
};

function mapUniversitiesToLeaderboard(universities: University[], game: string): LeaderboardEntry[] {
  return universities.map((u, i) => ({
    id: u.id,
    rank: i + 1,
    university: u.name.toUpperCase(),
    rating: u.glicko2_rating,
    winRate: u.wins + u.losses > 0 ? Math.round((u.wins / (u.wins + u.losses)) * 100) : 0,
    streak: u.wins > 0 ? `${Math.min(u.wins, 9)}W` : `${Math.min(u.losses, 9)}L`,
    game,
  }));
}

export default function LeaderboardPage() {
  const { selectedGame: globalGame, selectedGameInfo } = useGame();
  const activeGame = globalGame || "valo";
  const gameDisplayName = GAME_ID_TO_DISPLAY[activeGame] || "VALORANT";
  const enumValue = GAME_ID_TO_ENUM[activeGame] || "VALORANT";

  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    universitiesService.getUniversities(enumValue)
      .then((universities) => {
        if (cancelled) return;
        const mapped = mapUniversitiesToLeaderboard(universities, gameDisplayName);
        setStandings(mapped.length > 0 ? mapped : (mockLeaderboards[gameDisplayName] || []));
      })
      .catch(() => {
        if (cancelled) return;
        setStandings(mockLeaderboards[gameDisplayName] || []);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeGame, gameDisplayName, enumValue]);

  return (
    <div className="flex flex-col flex-1 game-theme-bg">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16">
        {/* Header Banner */}
        <div className="border-b border-[#1E2538] pb-6 mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold tracking-widest text-primary-brand uppercase">
                GLICKO-2 DYNAMIC RANKING ENGINE
              </span>
              {selectedGameInfo && (
                <span
                  className="text-[10px] font-sans font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: selectedGameInfo.accentColor, color: selectedGameInfo.id === "codm" ? "#0A0C10" : "#FFFFFF" }}
                >
                  {selectedGameInfo.shortName}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground uppercase">
              UNIVERSITY STANDINGS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1">
              Bottom-Up Aggregated Glicko-2 ratings for {selectedGameInfo?.name || "Valorant"} varsity programs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-sans font-bold text-slate-400 bg-[#121624] px-3.5 py-1.5 rounded-full border border-[#222B3F]">
              ⚡ Rating Period Active
            </span>
          </div>
        </div>

        {/* Standings List or Skeleton */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <LeaderboardSkeletonRow />
            <LeaderboardSkeletonRow />
            <LeaderboardSkeletonRow />
            <LeaderboardSkeletonRow />
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {standings.map((entry) => (
              <Link
                key={entry.id}
                href={`/university/${entry.id}`}
                className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden rounded-2xl border border-[#1E273A] bg-[#0C101A]/90 p-5 sm:p-6 shadow-2xl backdrop-blur-md transition-all duration-200 hover:border-primary-brand/60 hover:bg-[#101524] cursor-pointer"
              >
                {/* Accent Highlight Line for Top 3 */}
                {entry.rank <= 3 && (
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                    entry.rank === 1 ? "bg-[#F2B705]" : entry.rank === 2 ? "bg-[#CBD5E1]" : "bg-[#E57C23]"
                  }`} />
                )}

                <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-1">
                  {/* Rank Badge */}
                  <div
                    className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center font-display text-xl sm:text-2xl font-black shrink-0 shadow-lg ${
                      entry.rank === 1
                        ? "bg-gradient-to-br from-[#F2B705] to-[#D97706] text-[#0A0C10] ring-2 ring-[#F2B705]/40"
                        : entry.rank === 2
                        ? "bg-gradient-to-br from-[#E2E8F0] to-[#94A3B8] text-[#0A0C10] ring-1 ring-white/20"
                        : entry.rank === 3
                        ? "bg-gradient-to-br from-[#E57C23] to-[#B45309] text-white ring-1 ring-amber-500/30"
                        : "bg-[#141A28] text-foreground border border-[#27324B]"
                    }`}
                  >
                    {entry.rank}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      {entry.rank <= 3 && <MedalIcon rank={entry.rank} className="w-5 h-5 shrink-0" />}
                      <h2 className="font-display text-base sm:text-lg font-bold tracking-wide text-foreground group-hover:text-primary-brand transition-colors truncate">
                        {entry.university}
                      </h2>
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-foreground">
                        {entry.rating.toFixed(1)} <span className="text-[10px] text-secondary-text font-normal">Glicko-2</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C2C] text-slate-400 border border-[#242E46]">
                        ±42.5 RD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Win Rate Progress Bar */}
                <div className="flex flex-col w-full md:w-64 lg:w-80">
                  <div className="flex items-center justify-between text-[11px] font-sans font-bold tracking-wider text-secondary-text uppercase mb-1.5">
                    <span>CIRCUIT WIN RATE</span>
                    <span className="font-mono font-extrabold text-foreground">{entry.winRate}%</span>
                  </div>
                  <div className="w-full bg-[#141926] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#232B3E]">
                    <div
                      className="bg-gradient-to-r from-primary-brand via-rose-500 to-[#FF5E70] h-full rounded-full transition-all duration-500 shadow-md shadow-primary-brand/20"
                      style={{ width: `${entry.winRate}%` }}
                    />
                  </div>
                </div>

                {/* Stats & Streak */}
                <div className="flex items-center justify-between md:justify-end gap-8 sm:gap-12 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#1A2030]">
                  <div className="flex flex-col">
                    <span className="font-sans text-[10px] font-bold tracking-widest text-secondary-text uppercase">
                      RECENT STREAK
                    </span>
                    <span
                      className={`font-sans text-sm sm:text-base font-extrabold mt-0.5 ${
                        entry.streak.includes("W") ? "text-[#2FD97A]" : "text-primary-brand"
                      }`}
                    >
                      {entry.streak}
                    </span>
                  </div>

                  <div className="font-sans text-xs font-bold tracking-wider text-slate-300 uppercase px-3 py-1 rounded-lg bg-[#141926] border border-[#222B3E]">
                    {entry.game}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

