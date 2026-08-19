"use client";

import { useState, useEffect } from "react";
import { mockLeaderboards, LeaderboardEntry } from "@/lib/mock/leaderboard";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services";
import { University } from "@/types";
import { LeaderboardSkeletonRow } from "@/components/ui/Skeleton";
import { CrownIcon, TrophyIcon, ShieldIcon, CheckCircleIcon, ZapIcon } from "@/components/ui/Icons";
import { GAME_LIST } from "@/lib/games";

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
  const { selectedGame: globalGame, selectedGameInfo, selectGame } = useGame();
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

  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];
  const remainingStandings = standings.slice(3);

  return (
    <div className="flex flex-col flex-1 game-theme-bg text-[#EDEEF2] relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 space-y-10">
        
        {/* Header Title & Game Switcher Filter */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono font-extrabold tracking-widest text-primary-brand uppercase flex items-center gap-1.5">
                <ZapIcon className="w-3.5 h-3.5 text-primary-brand" />
                GLICKO-2 DYNAMIC RANKING ENGINE
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
              PHILIPPINE UNIVERSITY STANDINGS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Real-time aggregated Glicko-2 evaluations for verified collegiate varsity esports programs.
            </p>
          </div>

          {/* Minimalist Game Title Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GAME_LIST.map((game) => {
              const isActive = activeGame === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => selectGame(game.id)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                    isActive
                      ? "shadow-lg scale-105"
                      : "bg-[#0D121F] text-slate-400 border-[#1E293B] hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    backgroundColor: isActive ? game.accentColor : undefined,
                    color: isActive ? (game.id === "codm" || game.id === "ml" ? "#0A0C10" : "#FFFFFF") : undefined,
                    borderColor: isActive ? game.accentColor : undefined,
                    boxShadow: isActive ? `0 0 12px ${game.accentColor}55` : undefined,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={game.image} alt={game.name} className="w-4 h-4 rounded object-cover ring-1 ring-white/10" />
                  <span>{game.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Championship Top 3 Podium Cards */}
        {!isLoading && standings.length >= 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
                <CrownIcon className="w-5 h-5 text-amber-400" />
                <span>CHAMPIONSHIP PODIUM</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-2">
              
              {/* 2nd Place (Silver Medalist) */}
              {top2 && (
                <Link
                  href={`/university/${top2.id}`}
                  className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#141A26] via-[#0D121F] to-[#0D121F] border border-slate-700/80 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-slate-300 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-500 text-black flex items-center justify-center font-display text-2xl font-black shadow-lg">
                      2
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
                        SILVER MEDALIST
                      </span>
                      <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-primary-brand transition-colors">
                        {top2.university}
                      </h3>
                    </div>

                    <div className="w-full pt-4 border-t border-[#1E2538] flex items-center justify-between font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">GLICKO-2 SCORE</span>
                        <span className="font-bold text-white text-base">{top2.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase">WIN RATE</span>
                        <span className="font-bold text-emerald-400 text-base">{top2.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* 1st Place (Gold Champion - Center Elevated Podium) */}
              {top1 && (
                <Link
                  href={`/university/${top1.id}`}
                  className="group relative p-8 rounded-3xl bg-gradient-to-b from-[#1E190B] via-[#0D121F] to-[#0D121F] border-2 border-amber-500/60 shadow-2xl shadow-amber-950/40 backdrop-blur-xl transition-all duration-300 hover:border-amber-400 hover:scale-[1.02] order-first md:order-none z-10 cursor-pointer"
                >
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-black font-mono text-[10px] font-black uppercase tracking-widest rounded-full shadow-md flex items-center gap-1.5">
                    <CrownIcon className="w-3.5 h-3.5 text-black" />
                    <span>#1 GOLD CHAMPION</span>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-4 pt-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-xl ring-4 ring-amber-500/20">
                      <CrownIcon className="w-8 h-8 text-black shrink-0" />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
                        COLLEGIATE DIVISION LEADER
                      </span>
                      <h3 className="font-display text-2xl font-black uppercase text-white group-hover:text-amber-400 transition-colors">
                        {top1.university}
                      </h3>
                    </div>

                    <div className="w-full pt-4 border-t border-[#2A2210] flex items-center justify-between font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">GLICKO-2 SCORE</span>
                        <span className="font-black text-amber-400 text-xl">{top1.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase">CIRCUIT WIN RATE</span>
                        <span className="font-bold text-emerald-400 text-lg">{top1.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* 3rd Place (Bronze Medalist) */}
              {top3 && (
                <Link
                  href={`/university/${top3.id}`}
                  className="group relative p-6 rounded-3xl bg-gradient-to-b from-[#1C140D] via-[#0D121F] to-[#0D121F] border border-amber-900/60 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-600 hover:-translate-y-1 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-display text-2xl font-black shadow-lg">
                      3
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-0.5">
                        BRONZE MEDALIST
                      </span>
                      <h3 className="font-display text-lg font-black uppercase text-white group-hover:text-primary-brand transition-colors">
                        {top3.university}
                      </h3>
                    </div>

                    <div className="w-full pt-4 border-t border-[#1E2538] flex items-center justify-between font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">GLICKO-2 SCORE</span>
                        <span className="font-bold text-white text-base">{top3.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block uppercase">WIN RATE</span>
                        <span className="font-bold text-emerald-400 text-base">{top3.winRate}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

            </div>
          </div>
        )}

        {/* Full Rankings Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
            <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wide flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-primary-brand" />
              <span>OVERALL UNIVERSITY RANKING TABLE</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {standings.length} Registered Programs
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <LeaderboardSkeletonRow />
              <LeaderboardSkeletonRow />
              <LeaderboardSkeletonRow />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {remainingStandings.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/university/${entry.id}`}
                  className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden rounded-3xl border border-[#1E293B] bg-[#0D121F]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-md transition-all duration-200 hover:border-primary-brand/50 hover:bg-[#111827] cursor-pointer"
                >
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 pl-1">
                    {/* Rank Badge */}
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-[#141A29] text-white border border-[#232D44] flex items-center justify-center font-display text-xl sm:text-2xl font-black shrink-0 shadow-lg">
                      {entry.rank}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-base sm:text-lg font-black tracking-wide text-white group-hover:text-primary-brand transition-colors truncate">
                          {entry.university}
                        </h2>
                      </div>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="font-mono text-xs font-extrabold text-white">
                          {entry.rating.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">Glicko-2</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44]">
                          ±42.5 RD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Win Rate Progress Bar */}
                  <div className="flex flex-col w-full md:w-64 lg:w-80">
                    <div className="flex items-center justify-between text-[11px] font-mono font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                      <span>CIRCUIT WIN RATE</span>
                      <span className="font-mono font-black text-emerald-400">{entry.winRate}%</span>
                    </div>
                    <div className="w-full bg-[#080B12] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#1E2538]">
                      <div
                        className="bg-gradient-to-r from-primary-brand to-rose-500 h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${entry.winRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats & Streak */}
                  <div className="flex items-center justify-between md:justify-end gap-8 sm:gap-12 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[#1E2538]">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                        RECENT STREAK
                      </span>
                      <span
                        className={`font-mono text-sm sm:text-base font-black mt-0.5 ${
                          entry.streak.includes("W") ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entry.streak}
                      </span>
                    </div>

                    <div className="font-mono text-xs font-extrabold tracking-wider text-slate-200 uppercase px-3 py-1.5 rounded-xl bg-[#141A29] border border-[#232D44] shadow-sm">
                      {entry.game}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Engine Explainer Footer */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0D121F]/95 border border-[#1E293B] space-y-3 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-extrabold text-primary-brand uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
              <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
              PEER-VERIFIED GLICKO-2 MATCHMAKING ALGORITHM
            </span>
            <h4 className="font-display text-base sm:text-lg font-black text-white uppercase">
              How Ratings Are Calculated
            </h4>
            <p className="font-sans text-xs text-slate-400 max-w-2xl leading-relaxed">
              Ratings update dynamically after every peer-verified tournament match and scrimmage. Opponent strength, rating deviation (`RD`), and volatility (`σ`) are calculated continuously.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
