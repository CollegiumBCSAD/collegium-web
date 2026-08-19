"use client";

import { useState, useEffect } from "react";
import { mockLeaderboards, LeaderboardEntry } from "@/lib/mock/leaderboard";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services";
import { University } from "@/types";
import { LeaderboardSkeletonRow } from "@/components/ui/Skeleton";
import { CrownIcon, TrophyIcon, ZapIcon } from "@/components/ui/Icons";
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

/**
 * Calculates a single progressive color from 0% (Red) -> 50% (Yellow/Amber) -> 100% (Green)
 */
function getWinRateColor(rate: number): string {
  const clamped = Math.max(0, Math.min(100, rate));
  // Hue transitions smoothly from 0 (Red) up to 142 (Emerald Green)
  const hue = (clamped / 100) * 142;
  return `hsl(${hue.toFixed(1)}, 85%, 50%)`;
}

export default function LeaderboardPage() {
  const { selectedGame: globalGame, selectGame } = useGame();
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
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 space-y-12">
        
        {/* Header Title & Tactical Slanted Game Switcher */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span 
                className="text-[10px] font-mono font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5 bg-primary-brand/10 px-3 py-1 border border-primary-brand/30 shadow-sm"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <ZapIcon className="w-3.5 h-3.5 text-primary-brand" />
                GLICKO-2 DYNAMIC RANKING ENGINE
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
              PHILIPPINE UNIVERSITY STANDINGS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Real-time aggregated Glicko-2 evaluations for verified collegiate varsity esports programs.
            </p>
          </div>

          {/* Tactical Slanted Game Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GAME_LIST.map((game) => {
              const isActive = activeGame === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => selectGame(game.id)}
                  className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shadow-md ${
                    isActive ? "game-theme-btn scale-105" : "tactical-btn-secondary"
                  }`}
                  style={{
                    backgroundColor: isActive ? game.accentColor : undefined,
                    color: isActive ? (game.id === "codm" || game.id === "ml" ? "#0A0C10" : "#FFFFFF") : undefined,
                    boxShadow: isActive ? `0 0 16px ${game.accentColor}60` : undefined,
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

        {/* 3D Stepped Championship Podium Cards */}
        {!isLoading && standings.length >= 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
              <h2 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                <CrownIcon className="w-5 h-5 text-amber-400" />
                <span>CHAMPIONSHIP PODIUM</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                TOP 3 CONTENDERS
              </span>
            </div>

            {/* Stepped 3D Pedestals on Clean Page Background */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              
              {/* 2nd Place (Silver Medalist - Stepped Left) */}
              {top2 && (
                <div className="flex flex-col items-center">
                  <Link
                    href={`/university/${top2.id}`}
                    className="w-full group relative p-6 bg-gradient-to-b from-[#101626] via-[#0A0D18] to-[#070912] border border-slate-600/70 shadow-xl transition-all duration-300 hover:border-slate-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                    }}
                  >
                    {/* Silver Highlight Bevel */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-400 via-slate-200 to-transparent" />

                    <div className="flex flex-col items-center text-center space-y-3.5">
                      {/* Silver Octagonal Emblem */}
                      <div 
                        className="w-14 h-14 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 text-black flex items-center justify-center font-display text-2xl font-black shadow-lg ring-1 ring-white/30"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        2
                      </div>

                      <div>
                        <span 
                          className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest px-2.5 py-0.5 bg-[#141A29] border border-[#232D44] inline-block mb-1.5"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          SILVER MEDALIST
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white group-hover:text-primary-brand transition-colors leading-tight">
                          {top2.university}
                        </h3>
                      </div>
                    </div>

                    {/* Recessed Telemetry Box with Single Progressive Color */}
                    <div className="w-full mt-4 p-3 bg-[#05070E] border border-[#182236] flex items-center justify-between font-mono text-xs shadow-inner">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">GLICKO-2</span>
                        <span className="font-bold text-white text-base">{top2.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">WIN RATE</span>
                        <span className="font-bold text-base" style={{ color: getWinRateColor(top2.winRate) }}>
                          {top2.winRate}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Step Pedestal Base */}
                  <div 
                    className="w-4/5 h-4 bg-[#101626] border-x border-b border-[#1E2538] flex items-center justify-center"
                    style={{
                      clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)"
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">PEDESTAL 02</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Gold Champion - Tall Elevated Stand in Center) */}
              {top1 && (
                <div className="flex flex-col items-center order-first md:order-none -mt-4 z-10">
                  <Link
                    href={`/university/${top1.id}`}
                    className="w-full group relative p-7 bg-gradient-to-b from-[#1C1708] via-[#0E101B] to-[#070912] border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 transition-all duration-300 hover:border-amber-400 hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))",
                    }}
                  >
                    {/* Glowing Gold Crown Header Edge */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.9)]" />

                    <div className="flex flex-col items-center text-center space-y-4 pt-1">
                      <span 
                        className="px-4 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-display text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1.5"
                        style={{
                          clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                        }}
                      >
                        <CrownIcon className="w-3.5 h-3.5 text-black" />
                        <span>#1 GOLD CHAMPION</span>
                      </span>

                      {/* Gold Champion Octagonal Emblem */}
                      <div 
                        className="w-18 h-18 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-black flex items-center justify-center shadow-2xl ring-2 ring-amber-400/40"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        <CrownIcon className="w-9 h-9 text-black shrink-0 drop-shadow" />
                      </div>

                      <div>
                        <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
                          COLLEGIATE DIVISION LEADER
                        </span>
                        <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white group-hover:text-amber-400 transition-colors leading-tight">
                          {top1.university}
                        </h3>
                      </div>
                    </div>

                    {/* Recessed Gold Telemetry Box with Single Progressive Color */}
                    <div className="w-full mt-4 p-3.5 bg-[#080703] border border-amber-500/30 flex items-center justify-between font-mono shadow-inner">
                      <div>
                        <span className="text-[8px] text-amber-400/80 block uppercase font-bold">GLICKO-2 SCORE</span>
                        <span className="font-black text-amber-400 text-xl">{top1.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-amber-400/80 block uppercase font-bold">CIRCUIT WIN RATE</span>
                        <span className="font-bold text-lg" style={{ color: getWinRateColor(top1.winRate) }}>
                          {top1.winRate}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Elevated Champion Pedestal Base */}
                  <div 
                    className="w-11/12 h-5 bg-gradient-to-b from-[#1C1708] to-[#0E101B] border-x border-b border-amber-500/40 flex items-center justify-center shadow-lg"
                    style={{
                      clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 100%, 0 100%)"
                    }}
                  >
                    <span className="text-[8px] font-display font-black text-amber-400 uppercase tracking-widest">CHAMPION PLATFORM 01</span>
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze Medalist - Stepped Right) */}
              {top3 && (
                <div className="flex flex-col items-center">
                  <Link
                    href={`/university/${top3.id}`}
                    className="w-full group relative p-6 bg-gradient-to-b from-[#140F09] via-[#0A0D18] to-[#070912] border border-amber-900/70 shadow-xl transition-all duration-300 hover:border-amber-600 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                    }}
                  >
                    {/* Bronze Highlight Bevel */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-700 via-amber-600 to-transparent" />

                    <div className="flex flex-col items-center text-center space-y-3.5">
                      {/* Bronze Octagonal Emblem */}
                      <div 
                        className="w-14 h-14 bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 text-white flex items-center justify-center font-display text-2xl font-black shadow-lg ring-1 ring-amber-500/20"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        3
                      </div>

                      <div>
                        <span 
                          className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-0.5 bg-[#141A29] border border-[#232D44] inline-block mb-1.5"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          BRONZE MEDALIST
                        </span>
                        <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white group-hover:text-primary-brand transition-colors leading-tight">
                          {top3.university}
                        </h3>
                      </div>
                    </div>

                    {/* Recessed Telemetry Box with Single Progressive Color */}
                    <div className="w-full mt-4 p-3 bg-[#05070E] border border-[#182236] flex items-center justify-between font-mono text-xs shadow-inner">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">GLICKO-2</span>
                        <span className="font-bold text-white text-base">{top3.rating.toFixed(1)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">WIN RATE</span>
                        <span className="font-bold text-base" style={{ color: getWinRateColor(top3.winRate) }}>
                          {top3.winRate}%
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Step Pedestal Base */}
                  <div 
                    className="w-4/5 h-4 bg-[#140F09] border-x border-b border-[#1E2538] flex items-center justify-center"
                    style={{
                      clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)"
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">PEDESTAL 03</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Full Rankings Laser-Straight Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
            <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-primary-brand" />
              <span>OVERALL UNIVERSITY RANKING TABLE</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {standings.length} REGISTERED PROGRAMS
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <LeaderboardSkeletonRow />
              <LeaderboardSkeletonRow />
              <LeaderboardSkeletonRow />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {remainingStandings.map((entry) => {
                const singleColor = getWinRateColor(entry.winRate);
                return (
                  <Link
                    key={entry.id}
                    href={`/university/${entry.id}`}
                    className="group relative flex flex-col md:flex-row items-start md:items-center bg-[#0A0D18] border border-[#1E293B] hover:border-[#2E3C56] p-5 sm:p-6 shadow-xl transition-all duration-200 hover:bg-[#0E1322] cursor-pointer rounded-xl gap-6"
                  >
                    {/* Subtle Top Neutral Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-slate-500/20 via-slate-400/10 to-transparent" />

                    {/* Column 1: Rank + University Name & Rating (Takes all remaining flexible space) */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 pr-2">
                      {/* Octagonal Rank Badge */}
                      <div 
                        className="h-12 w-12 sm:h-13 sm:w-13 bg-gradient-to-br from-[#1A2236] to-[#0E1424] text-white border border-[#2B3B5C] flex items-center justify-center font-display text-xl sm:text-2xl font-black shrink-0 shadow-md group-hover:border-primary-brand group-hover:text-primary-brand transition-colors"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        {entry.rank}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <h2 className="font-display text-base sm:text-lg font-black tracking-wide text-white group-hover:text-primary-brand transition-colors truncate">
                          {entry.university}
                        </h2>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-white">
                            {entry.rating.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">Glicko-2</span>
                          </span>
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#141A29] text-slate-300 border border-[#232D44] rounded">
                            ±42.5 RD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Fixed-Width Laser-Straight Circuit Win Rate Well */}
                    <div className="flex flex-col w-full md:w-72 lg:w-80 shrink-0 p-3 bg-[#05070E] border border-[#161D2E] rounded-lg shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                        <span>CIRCUIT WIN RATE</span>
                        <span className="font-mono font-bold" style={{ color: singleColor }}>
                          {entry.winRate}%
                        </span>
                      </div>
                      <div className="w-full bg-[#080B14] h-2.5 rounded-full overflow-hidden border border-[#1E2538] p-0.5">
                        <div
                          className="h-full rounded-full transition-all duration-500 shadow-sm"
                          style={{
                            width: `${Math.max(entry.winRate, 3)}%`,
                            backgroundColor: singleColor,
                          }}
                        />
                      </div>
                    </div>

                    {/* Column 3: Fixed-Width Laser-Straight Recent Streak */}
                    <div className="flex flex-col w-full md:w-28 shrink-0 md:text-center pt-3 md:pt-0 border-t md:border-t-0 border-[#1E2538]">
                      <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                        RECENT STREAK
                      </span>
                      <span
                        className={`font-mono text-sm sm:text-base font-bold mt-0.5 ${
                          entry.streak.includes("W") ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entry.streak}
                      </span>
                    </div>

                    {/* Column 4: Fixed-Width Laser-Straight Game Badge */}
                    <div className="flex items-center md:justify-end w-full md:w-28 shrink-0">
                      <span className="font-display text-xs font-bold tracking-wider text-slate-200 uppercase px-3 py-1.5 bg-[#141A29] border border-[#232D44] shadow-sm rounded-md">
                        {entry.game}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Engine Explainer Footer */}
        <div 
          className="p-6 sm:p-8 bg-[#0A0D18] border border-[#1E293B] space-y-3 shadow-2xl relative rounded-xl"
        >
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
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
