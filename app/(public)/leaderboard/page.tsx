"use client";

import { useState, useEffect } from "react";
import { mockLeaderboards, LeaderboardEntry } from "@/lib/mock/leaderboard";
import Link from "next/link";
import { universitiesService } from "@/services";
import { University } from "@/types";

const GAME_TAB_TO_ENUM: Record<string, string> = {
  "VALORANT": "VALORANT",
  "LEAGUE OF LEGENDS": "LOL",
  "MOBILE LEGENDS: BANG BANG": "MLBB",
  "CALL OF DUTY: MOBILE": "CODM",
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
    icon: i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : undefined,
  }));
}

export default function LeaderboardPage() {
  const games = ["VALORANT", "LEAGUE OF LEGENDS", "MOBILE LEGENDS: BANG BANG", "CALL OF DUTY: MOBILE"];
  const [selectedGame, setSelectedGame] = useState("VALORANT");
  const [standings, setStandings] = useState<LeaderboardEntry[]>(mockLeaderboards["VALORANT"] || []);

  useEffect(() => {
    const enumValue = GAME_TAB_TO_ENUM[selectedGame];
    let cancelled = false;

    universitiesService.getUniversities(enumValue)
      .then((universities) => {
        if (cancelled) return;
        const mapped = mapUniversitiesToLeaderboard(universities, selectedGame);
        setStandings(mapped.length > 0 ? mapped : (mockLeaderboards[selectedGame] || []));
      })
      .catch(() => {
        if (cancelled) return;
        setStandings(mockLeaderboards[selectedGame] || []);
      });

    return () => { cancelled = true; };
  }, [selectedGame]);

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b md:bg-gradient-to-r from-[#CC0000]/25 from-0% to-[#0A0C10] to-[50%] md:to-[40%]">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="border-t border-raised-panel/50 pt-8 mb-8 sm:mb-10 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground uppercase">
              RANKINGS PREVIEW
            </h1>
            <p className="font-sans text-xs sm:text-sm text-primary-brand mt-1 font-normal tracking-tight">
              Top universities shaping the circuit.
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="font-sans text-xs sm:text-sm font-medium text-secondary-text hover:text-foreground transition-colors pt-2"
          >
            View Full Rankings
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-raised-panel/50 pb-6 mb-8">
          {games.map((game) => {
            const isActive = selectedGame === game;
            return (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full font-sans text-xs sm:text-sm font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  isActive
                    ? "border border-raised-panel bg-[#141824] text-foreground shadow-lg"
                    : "border border-transparent bg-transparent text-secondary-text hover:text-foreground hover:bg-[#141824]/40"
                }`}
              >
                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-[#E53A4C] inline-block shadow-[0_0_8px_rgba(229,58,76,0.8)]" />
                )}
                <span>{game}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          {standings.map((entry) => (
            <Link
              key={entry.id}
              href={`/university/${entry.id}`}
              className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden rounded-xl border border-raised-panel bg-[#0E1119] p-5 sm:p-6 shadow-xl transition-all hover:border-primary-brand/50 hover:bg-[#121622] cursor-pointer"
            >
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                <div
                  className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center font-display text-lg sm:text-xl font-bold shrink-0 shadow-md ${
                    entry.rank === 1
                      ? "bg-[#F2B705] text-[#0A0C10]"
                      : entry.rank === 2
                      ? "bg-[#EDEEF2] text-[#0A0C10]"
                      : entry.rank === 3
                      ? "bg-[#E57C23] text-white"
                      : "bg-[#161A26] text-foreground border border-[#262B3B]"
                  }`}
                >
                  {entry.rank}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    {entry.icon && <span className="text-sm">{entry.icon}</span>}
                    <h2 className="font-sans text-sm sm:text-base font-bold tracking-wide text-foreground group-hover:text-primary-brand transition-colors">
                      {entry.university}
                    </h2>
                  </div>
                  <div className="mt-1 flex flex-col items-baseline ">
                    <span className="font-sans text-[10px] sm:text-xs font-bold tracking-widest text-secondary-text uppercase">
                      RATING
                    </span>
                    <span className="font-sans text-sm sm:text-base font-bold text-foreground">
                      {entry.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full md:w-64 lg:w-80">
                <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold tracking-widest text-secondary-text uppercase mb-1.5">
                  <span>WIN RATE</span>
                </div>
                <div className="w-full bg-[#1A1F2D] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#242A3C]">
                  <div
                    className="bg-gradient-to-r from-[#E53A4C] to-[#FF5E70] h-full rounded-full transition-all duration-500"
                    style={{ width: `${entry.winRate}%` }}
                  />
                </div>
                <span className="font-sans text-xs font-bold text-foreground mt-1.5">
                  {entry.winRate}%
                </span>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8 sm:gap-12 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#1E2333]">
                <div className="flex flex-col">
                  <span className="font-sans text-[10px] sm:text-xs font-bold tracking-widest text-secondary-text uppercase">
                    STREAK
                  </span>
                  <span
                    className={`font-sans text-sm sm:text-base font-bold mt-0.5 ${
                      entry.streak.includes("W") ? "text-[#2FD97A]" : "text-[#E53A4C]"
                    }`}
                  >
                    {entry.streak}
                  </span>
                </div>

                <div className="font-sans text-xs sm:text-sm font-bold tracking-wider text-[#E53A4C] uppercase">
                  {entry.game}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

