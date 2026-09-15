"use client";

import { useState, useEffect, useMemo } from "react";
import { mockLeaderboards, LeaderboardEntry } from "@/lib/mock/leaderboard";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services";
import { University, GameId } from "@/types";
import { LeaderboardSkeletonRow } from "@/components/ui/Skeleton";
import { CrownIcon, TrophyIcon, ZapIcon, InfoIcon, ShieldIcon } from "@/components/ui/Icons";
import { GAMES, GAME_LIST } from "@/lib/games";

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
  return universities.map((u, i) => {
    const wins = u.wins ?? 0;
    const losses = u.losses ?? 0;
    const total = wins + losses;
    const winRate = u.winRate ?? (total > 0 ? Math.round((wins / total) * 100) : 0);
    const streak = u.streak ?? (wins > 0 ? `${Math.min(wins, 9)}W` : total > 0 ? `${Math.min(losses, 9)}L` : "-");
    const rd = u.glicko2_rd ?? 350;
    const isProvisional = u.isProvisional ?? (rd >= 100 || total === 0);

    return {
      id: u.id,
      rank: i + 1,
      university: u.name,
      teamId: u.teamId,
      teamName: u.teamName || `${u.name} Varsity`,
      rating: u.glicko2_rating ?? 1500,
      rd,
      sigma: u.glicko2_sigma ?? 0.06,
      isProvisional,
      winRate,
      wins,
      losses,
      streak,
      game,
    };
  });
}

function normalizeMockEntries(entries: LeaderboardEntry[], game: string): LeaderboardEntry[] {
  return entries.map((entry, idx) => {
    const winRate = entry.winRate ?? 50;
    const wins = entry.wins ?? Math.round((winRate / 100) * 10);
    const losses = entry.losses ?? Math.max(0, 10 - wins);
    return {
      ...entry,
      rank: idx + 1,
      teamName: entry.teamName || `${entry.university.split(" ")[0]} Varsity`,
      rd: entry.rd ?? 65,
      isProvisional: entry.isProvisional ?? false,
      wins,
      losses,
      game,
    };
  });
}

/**
 * Progressive color from 0% (Red) -> 50% (Yellow/Amber) -> 100% (Emerald Green)
 */
function getWinRateColor(rate: number): string {
  const clamped = Math.max(0, Math.min(100, rate));
  const hue = (clamped / 100) * 142;
  return `hsl(${hue.toFixed(1)}, 85%, 50%)`;
}

type SortOption = "rating" | "winRate" | "wins";

export default function LeaderboardPage() {
  const { selectedGame: globalGame, selectGame } = useGame();
  const activeGame = (globalGame || "valo") as GameId;
  const gameDisplayName = GAME_ID_TO_DISPLAY[activeGame] || "VALORANT";
  const enumValue = GAME_ID_TO_ENUM[activeGame] || "VALORANT";

  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [loadedGame, setLoadedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("rating");
  const [showAllInTable, setShowAllInTable] = useState<boolean>(false);

  const isLoading = loadedGame !== activeGame;

  useEffect(() => {
    let cancelled = false;

    universitiesService.getUniversities(enumValue)
      .then((universities) => {
        if (cancelled) return;
        if (universities && universities.length > 0) {
          const mapped = mapUniversitiesToLeaderboard(universities, gameDisplayName);
          setStandings(mapped);
        } else {
          const fallback = mockLeaderboards[gameDisplayName] || [];
          setStandings(normalizeMockEntries(fallback, gameDisplayName));
        }
      })
      .catch(() => {
        if (cancelled) return;
        const fallback = mockLeaderboards[gameDisplayName] || [];
        setStandings(normalizeMockEntries(fallback, gameDisplayName));
      })
      .finally(() => {
        if (!cancelled) setLoadedGame(activeGame);
      });

    return () => { cancelled = true; };
  }, [activeGame, gameDisplayName, enumValue]);

  // Filter and sort standings
  const filteredStandings = useMemo(() => {
    let list = [...standings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (entry) =>
          entry.university.toLowerCase().includes(q) ||
          (entry.teamName && entry.teamName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === "winRate") {
        return b.winRate - a.winRate;
      }
      if (sortBy === "wins") {
        return (b.wins ?? 0) - (a.wins ?? 0);
      }
      return b.rating - a.rating;
    });

    return list;
  }, [standings, searchQuery, sortBy]);

  // When searching, always show all filtered matches in the table.
  // Otherwise, top 3 are featured in the podium, and table displays remaining or all based on toggle.
  const isSearchingOrSorting = searchQuery.trim().length > 0 || sortBy !== "rating";
  const podiumList = standings.slice(0, 3);
  const top1 = podiumList[0];
  const top2 = podiumList[1];
  const top3 = podiumList[2];

  const tableStandings = isSearchingOrSorting || showAllInTable
    ? filteredStandings
    : filteredStandings.slice(3);

  const activeGameInfo = GAMES[activeGame] || GAMES.valo;

  return (
    <div className="flex flex-col flex-1 game-theme-bg text-[#EDEEF2] relative animate-page-slide-in pb-16">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 space-y-10">

        {/* Header Title & Tactical Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#1A2234]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-[10px] font-mono font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5 bg-primary-brand/10 px-3 py-1 border border-primary-brand/30 shadow-sm"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <ZapIcon className="w-3.5 h-3.5 text-primary-brand" />
                GLICKO-2 DYNAMIC RANKING ENGINE
              </span>
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                • {gameDisplayName} DIVISION
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase drop-shadow-md">
              VARSITY ESPORTS LEADERBOARDS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time aggregated Glicko-2 ratings, rating deviations (<span className="text-slate-300 font-mono">RD</span>), and verified tournament match records for verified collegiate varsity teams in <strong className="text-white font-bold">{gameDisplayName}</strong>.
            </p>
          </div>

          {/* Active Battleground Status Chip */}
          <div className="flex items-center gap-4 bg-[#0A0D18] border border-[#1E293B] p-3 shadow-xl shrink-0 rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeGameInfo.image || "/valorant.png"}
              alt={gameDisplayName}
              className="w-10 h-10 object-cover border border-white/20 rounded shadow-sm"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            />
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                ACTIVE BATTLEGROUND
              </span>
              <span className="font-display text-base font-black uppercase text-white tracking-wide">
                {gameDisplayName}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE CALIBRATED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical In-Page Game Division Switcher Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
              SELECT COMPETITIVE DIVISION
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              4 CIRCUIT TITLES ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GAME_LIST.map((g) => {
              const isActive = activeGame === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => selectGame(g.id)}
                  type="button"
                  className={`group relative p-3 sm:p-4 text-left transition-all duration-200 border cursor-pointer overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-[#141B2D] via-[#0E1424] to-[#0A0D18] border-primary-brand shadow-lg shadow-primary-brand/10 ring-1 ring-primary-brand/40"
                      : "bg-[#0A0D18] border-[#1E293B] hover:border-[#334155] hover:bg-[#0E1322]"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                  }}
                >
                  {/* Top Edge Accent for Active Tab */}
                  {isActive && (
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{ backgroundColor: g.accentColor || "#E53A4C" }}
                    />
                  )}

                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.image}
                      alt={g.name}
                      className={`w-8 h-8 object-cover rounded border transition-transform duration-200 ${
                        isActive ? "border-white/40 scale-105" : "border-white/10 opacity-70 group-hover:opacity-100"
                      }`}
                      style={{
                        clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      }}
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono font-bold tracking-wider text-slate-400 block uppercase">
                        {g.genre}
                      </span>
                      <span
                        className={`font-display text-xs sm:text-sm font-black uppercase tracking-wide truncate block transition-colors ${
                          isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {g.shortName}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3D Stepped Championship Podium Cards (Top 3) */}
        {!isLoading && standings.length >= 3 && !isSearchingOrSorting && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
              <h2 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                <CrownIcon className="w-5 h-5 text-amber-400" />
                <span>CHAMPIONSHIP PODIUM</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                TOP 3 CONTENDERS • {gameDisplayName}
              </span>
            </div>

            {/* Stepped Pedestals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">

              {/* 2nd Place (Silver Medalist - Left) */}
              {top2 && (
                <div className="flex flex-col items-center">
                  <Link
                    href={`/university/${top2.id}`}
                    className="w-full group relative p-6 bg-gradient-to-b from-[#101626] via-[#0A0D18] to-[#070912] border border-slate-600/70 shadow-xl transition-all duration-300 hover:border-slate-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-400 via-slate-200 to-transparent" />

                    <div className="flex flex-col items-center text-center space-y-3">
                      {/* Silver Octagonal Rank Emblem */}
                      <div
                        className="w-14 h-14 bg-gradient-to-br from-slate-200 via-slate-400 to-slate-600 text-black flex items-center justify-center font-display text-2xl font-black shadow-lg ring-1 ring-white/30"
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        2
                      </div>

                      <div>
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span
                            className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest px-2.5 py-0.5 bg-[#141A29] border border-[#232D44] inline-block"
                            style={{
                              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            SILVER MEDALIST
                          </span>
                          {top2.isProvisional && (
                            <span
                              className="text-[8px] font-mono font-bold text-amber-300 uppercase px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30"
                              title="Rating Deviation > 100. Calibrates with verified tournament matches."
                            >
                              PROVISIONAL
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white group-hover:text-primary-brand transition-colors leading-tight">
                          {top2.teamName || top2.university}
                        </h3>
                        <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                          {top2.university}
                        </p>
                      </div>
                    </div>

                    {/* Telemetry Box */}
                    <div className="w-full mt-4 p-3 bg-[#05070E] border border-[#182236] flex items-center justify-between font-mono text-xs shadow-inner">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">GLICKO-2</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-white text-base">{top2.rating.toFixed(1)}</span>
                          <span className="text-[9px] text-slate-400">±{Math.round(top2.rd ?? 350)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">WIN RATE</span>
                        <span className="font-bold text-base" style={{ color: getWinRateColor(top2.winRate) }}>
                          {top2.winRate}%
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {top2.wins ?? 0}W - {top2.losses ?? 0}L
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Pedestal Base */}
                  <div
                    className="w-4/5 h-4 bg-[#101626] border-x border-b border-[#1E2538] flex items-center justify-center"
                    style={{
                      clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)",
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">PEDESTAL 02</span>
                  </div>
                </div>
              )}

              {/* 1st Place (Gold Champion - Center Elevated) */}
              {top1 && (
                <div className="flex flex-col items-center order-first md:order-none -mt-4 z-10">
                  <Link
                    href={`/university/${top1.id}`}
                    className="w-full group relative p-7 bg-gradient-to-b from-[#1C1708] via-[#0E101B] to-[#070912] border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 transition-all duration-300 hover:border-amber-400 hover:scale-[1.01] cursor-pointer overflow-hidden flex flex-col justify-between"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 22px 100%, 0 calc(100% - 22px))",
                    }}
                  >
                    {/* Glowing Gold Crown Top Accent */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.9)]" />

                    <div className="flex flex-col items-center text-center space-y-3 pt-1">
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
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                            COLLEGIATE DIVISION LEADER
                          </span>
                          {top1.isProvisional && (
                            <span
                              className="text-[8px] font-mono font-bold text-amber-300 uppercase px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30"
                              title="Rating Deviation > 100. Calibrates with verified tournament matches."
                            >
                              PROVISIONAL
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-2xl sm:text-3xl font-black uppercase text-white group-hover:text-amber-400 transition-colors leading-tight">
                          {top1.teamName || top1.university}
                        </h3>
                        <p className="text-xs font-sans text-slate-300 mt-0.5">
                          {top1.university}
                        </p>
                      </div>
                    </div>

                    {/* Recessed Gold Telemetry Box */}
                    <div className="w-full mt-4 p-3.5 bg-[#080703] border border-amber-500/30 flex items-center justify-between font-mono shadow-inner">
                      <div>
                        <span className="text-[8px] text-amber-400/80 block uppercase font-bold">GLICKO-2 SCORE</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-amber-400 text-xl">{top1.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-amber-400/70">±{Math.round(top1.rd ?? 350)} RD</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-amber-400/80 block uppercase font-bold">CIRCUIT WIN RATE</span>
                        <span className="font-bold text-lg" style={{ color: getWinRateColor(top1.winRate) }}>
                          {top1.winRate}%
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {top1.wins ?? 0}W - {top1.losses ?? 0}L
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Elevated Champion Pedestal Base */}
                  <div
                    className="w-11/12 h-5 bg-gradient-to-b from-[#1C1708] to-[#0E101B] border-x border-b border-amber-500/40 flex items-center justify-center shadow-lg"
                    style={{
                      clipPath: "polygon(8px 0, calc(100% - 8px) 0, 100% 100%, 0 100%)",
                    }}
                  >
                    <span className="text-[8px] font-display font-black text-amber-400 uppercase tracking-widest">CHAMPION PLATFORM 01</span>
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze Medalist - Right) */}
              {top3 && (
                <div className="flex flex-col items-center">
                  <Link
                    href={`/university/${top3.id}`}
                    className="w-full group relative p-6 bg-gradient-to-b from-[#140F09] via-[#0A0D18] to-[#070912] border border-amber-900/70 shadow-xl transition-all duration-300 hover:border-amber-600 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-700 via-amber-600 to-transparent" />

                    <div className="flex flex-col items-center text-center space-y-3">
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
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <span
                            className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest px-2.5 py-0.5 bg-[#141A29] border border-[#232D44] inline-block"
                            style={{
                              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            BRONZE MEDALIST
                          </span>
                          {top3.isProvisional && (
                            <span
                              className="text-[8px] font-mono font-bold text-amber-300 uppercase px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30"
                              title="Rating Deviation > 100. Calibrates with verified tournament matches."
                            >
                              PROVISIONAL
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white group-hover:text-primary-brand transition-colors leading-tight">
                          {top3.teamName || top3.university}
                        </h3>
                        <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                          {top3.university}
                        </p>
                      </div>
                    </div>

                    {/* Telemetry Box */}
                    <div className="w-full mt-4 p-3 bg-[#05070E] border border-[#182236] flex items-center justify-between font-mono text-xs shadow-inner">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">GLICKO-2</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-white text-base">{top3.rating.toFixed(1)}</span>
                          <span className="text-[9px] text-slate-400">±{Math.round(top3.rd ?? 350)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">WIN RATE</span>
                        <span className="font-bold text-base" style={{ color: getWinRateColor(top3.winRate) }}>
                          {top3.winRate}%
                        </span>
                        <span className="text-[9px] text-slate-400 block">
                          {top3.wins ?? 0}W - {top3.losses ?? 0}L
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Pedestal Base */}
                  <div
                    className="w-4/5 h-4 bg-[#140F09] border-x border-b border-[#1E2538] flex items-center justify-center"
                    style={{
                      clipPath: "polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)",
                    }}
                  >
                    <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest">PEDESTAL 03</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Search, Sort, and Table Controls Toolbar */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-[#0A0D18] border border-[#1E293B] rounded-xl shadow-lg">

            {/* Instant Search Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by varsity team or university name..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#05070E] border border-[#1E2538] focus:border-primary-brand focus:outline-none text-white text-xs sm:text-sm font-sans placeholder-slate-500 rounded-lg transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  <span className="text-xs font-mono">✕</span>
                </button>
              )}
            </div>

            {/* Sort Dropdown & Toggle Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center gap-1.5 bg-[#05070E] border border-[#1E2538] px-3 py-2 rounded-lg text-xs font-mono">
                <span className="text-slate-400 text-[10px] uppercase font-bold">SORT:</span>
                <button
                  type="button"
                  onClick={() => setSortBy("rating")}
                  className={`px-2 py-1 rounded transition-colors ${
                    sortBy === "rating" ? "bg-primary-brand text-white font-bold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Rating
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("winRate")}
                  className={`px-2 py-1 rounded transition-colors ${
                    sortBy === "winRate" ? "bg-primary-brand text-white font-bold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Win %
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy("wins")}
                  className={`px-2 py-1 rounded transition-colors ${
                    sortBy === "wins" ? "bg-primary-brand text-white font-bold" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Wins
                </button>
              </div>

              {/* Show All Toggle when not searching */}
              {!isSearchingOrSorting && (
                <button
                  type="button"
                  onClick={() => setShowAllInTable(!showAllInTable)}
                  className={`px-3 py-2 text-xs font-mono border rounded-lg transition-all ${
                    showAllInTable
                      ? "bg-[#141A29] text-primary-brand border-primary-brand/40"
                      : "bg-[#05070E] text-slate-400 border-[#1E2538] hover:text-slate-200"
                  }`}
                >
                  {showAllInTable ? "Show 4+ in Table" : "Show All in Table"}
                </button>
              )}

              {/* Match Counter Badge */}
              <span className="text-xs font-mono font-bold text-slate-400 px-3 py-2 bg-[#05070E] border border-[#1E2538] rounded-lg">
                {filteredStandings.length} {filteredStandings.length === 1 ? "Program" : "Programs"}
              </span>
            </div>

          </div>
        </div>

        {/* Overall University Ranking Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E2538] pb-3">
            <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-primary-brand" />
              <span>
                {isSearchingOrSorting
                  ? "SEARCH & SORTED STANDINGS TABLE"
                  : showAllInTable
                  ? "COMPLETE DIVISION STANDINGS TABLE (ALL RANKS)"
                  : "CONTENDER RANKINGS TABLE (RANK 4+)"}
              </span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              DIVISION: {gameDisplayName}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <LeaderboardSkeletonRow />
              <LeaderboardSkeletonRow />
              <LeaderboardSkeletonRow />
            </div>
          ) : tableStandings.length === 0 ? (
            /* Empty Search State */
            <div className="p-12 text-center bg-[#0A0D18] border border-[#1E293B] rounded-xl space-y-4 shadow-xl">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#141A29] border border-[#232D44] flex items-center justify-center text-slate-400">
                <InfoIcon className="w-6 h-6 text-primary-brand" />
              </div>
              <h4 className="font-display text-lg font-black uppercase text-white">
                No Varsity Programs Found
              </h4>
              <p className="font-sans text-xs text-slate-400 max-w-md mx-auto">
                No varsity teams matched your search for &quot;<span className="text-white font-mono">{searchQuery}</span>&quot; in the {gameDisplayName} division.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSortBy("rating");
                }}
                className="px-4 py-2 bg-primary-brand text-white font-sans text-xs font-bold uppercase tracking-wider rounded-lg shadow-md hover:bg-primary-brand/90 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Table Rows */
            <div className="flex flex-col gap-3">
              {tableStandings.map((entry) => {
                const singleColor = getWinRateColor(entry.winRate);
                const isPodium = entry.rank <= 3;
                const medalBorderColor =
                  entry.rank === 1
                    ? "border-amber-500/60"
                    : entry.rank === 2
                    ? "border-slate-400/60"
                    : entry.rank === 3
                    ? "border-amber-700/60"
                    : "border-[#1E293B]";

                return (
                  <Link
                    key={`${entry.id}-${entry.rank}`}
                    href={`/university/${entry.id}`}
                    className={`group relative flex flex-col md:flex-row items-start md:items-center bg-[#0A0D18] border ${medalBorderColor} hover:border-[#2E3C56] p-5 sm:p-6 shadow-xl transition-all duration-200 hover:bg-[#0E1322] cursor-pointer rounded-xl gap-6`}
                  >
                    {/* Top Neutral Highlight */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-slate-500/20 via-slate-400/10 to-transparent" />

                    {/* Column 1: Rank Badge + Varsity Team Name & University */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 pr-2">
                      {/* Octagonal Rank Badge */}
                      <div
                        className={`h-12 w-12 sm:h-13 sm:w-13 text-white border flex items-center justify-center font-display text-xl sm:text-2xl font-black shrink-0 shadow-md transition-colors ${
                          entry.rank === 1
                            ? "bg-gradient-to-br from-amber-400 to-amber-700 text-black border-amber-300"
                            : entry.rank === 2
                            ? "bg-gradient-to-br from-slate-200 to-slate-500 text-black border-slate-300"
                            : entry.rank === 3
                            ? "bg-gradient-to-br from-amber-600 to-amber-900 text-white border-amber-500"
                            : "bg-gradient-to-br from-[#1A2236] to-[#0E1424] text-white border-[#2B3B5C] group-hover:border-primary-brand group-hover:text-primary-brand"
                        }`}
                        style={{
                          clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                        }}
                      >
                        {entry.rank}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-display text-base sm:text-lg font-black tracking-wide text-white group-hover:text-primary-brand transition-colors truncate">
                            {entry.teamName || entry.university}
                          </h2>
                          {entry.isProvisional && (
                            <span
                              className="text-[9px] font-mono font-bold text-amber-300 uppercase px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded"
                              title="Rating Deviation > 100. Calibrates with verified tournament matches."
                            >
                              PROVISIONAL
                            </span>
                          )}
                          {isPodium && (
                            <span className="text-[9px] font-mono font-bold text-amber-400 uppercase px-2 py-0.5 bg-[#141A29] border border-amber-500/30 rounded">
                              TOP 3
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-sans text-slate-400 truncate">
                            {entry.university}
                          </span>
                          <span className="font-mono text-xs font-bold text-white">
                            {entry.rating.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">Glicko-2</span>
                          </span>
                          <span
                            className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#141A29] text-slate-300 border border-[#232D44] rounded"
                            title="Rating Deviation: Represents the statistical uncertainty of the rating."
                          >
                            ±{Math.round(entry.rd ?? 350)} RD
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Circuit Win Rate Progress Well */}
                    <div className="flex flex-col w-full md:w-64 lg:w-72 shrink-0 p-3 bg-[#05070E] border border-[#161D2E] rounded-lg shadow-inner">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider text-slate-300 uppercase mb-1.5">
                        <span>CIRCUIT WIN RATE</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-normal font-mono">
                            {entry.wins ?? 0}W - {entry.losses ?? 0}L
                          </span>
                          <span className="font-mono font-bold" style={{ color: singleColor }}>
                            {entry.winRate}%
                          </span>
                        </div>
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

                    {/* Column 3: Recent Streak */}
                    <div className="flex flex-col w-full md:w-24 shrink-0 md:text-center pt-3 md:pt-0 border-t md:border-t-0 border-[#1E2538]">
                      <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                        STREAK
                      </span>
                      <span
                        className={`font-mono text-sm sm:text-base font-bold mt-0.5 ${
                          entry.streak.includes("W")
                            ? "text-emerald-400"
                            : entry.streak.includes("L")
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {entry.streak}
                      </span>
                    </div>

                    {/* Column 4: Division Badge */}
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

        {/* Engine Explainer Footer Card */}
        <div className="p-6 sm:p-8 bg-[#0A0D18] border border-[#1E293B] space-y-4 shadow-2xl relative rounded-xl">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-primary-brand uppercase tracking-widest flex items-center justify-center md:justify-start gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
              PEER-VERIFIED GLICKO-2 RATING ENGINE SPECIFICATION
            </span>
            <h4 className="font-display text-base sm:text-lg font-black text-white uppercase">
              How Ratings & Calibration Work
            </h4>
            <p className="font-sans text-xs text-slate-400 max-w-3xl leading-relaxed mt-1">
              Collegium rates registered varsity teams directly under a persistent Glicko-2 dynamic rating system. Ratings evaluate opponent strength, Rating Deviation (<span className="text-slate-300 font-mono">RD</span>), and volatility (<span className="text-slate-300 font-mono">σ</span>) computed at tournament rating period closures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#161D2E]">
            <div className="p-3 bg-[#05070E] border border-[#182236] rounded-lg">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                Rating (r)
              </span>
              <p className="text-[11px] font-sans text-slate-400 leading-normal">
                Starts at cold-start <strong className="text-white font-mono">1500</strong>. Updates based on win/loss outcome scaled by tournament Event Weight.
              </p>
            </div>

            <div className="p-3 bg-[#05070E] border border-[#182236] rounded-lg">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                Rating Deviation (RD)
              </span>
              <p className="text-[11px] font-sans text-slate-400 leading-normal">
                Starts at <strong className="text-white font-mono">350</strong> (provisional). Shrinks as more official tournament matches are verified, increasing confidence.
              </p>
            </div>

            <div className="p-3 bg-[#05070E] border border-[#182236] rounded-lg">
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase block mb-1">
                Tournament Outcome Exclusivity
              </span>
              <p className="text-[11px] font-sans text-slate-400 leading-normal">
                Only verified competitive tournament matches affect Glicko-2 ratings. Scrims and casual matches are non-rated practice.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
