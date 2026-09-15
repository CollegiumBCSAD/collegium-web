"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tournament } from "@/types";
import { Team } from "@/lib/teams";
import { tournamentsService } from "@/services/tournamentsService";
import { useGame } from "@/context/GameContext";
import { GAMES, GameId } from "@/lib/games";
import { 
  TrophyIcon, 
  ClockIcon, 
  ShieldIcon, 
  PlusIcon, 
  ZapIcon, 
  CheckCircleIcon 
} from "@/components/ui/Icons";

interface DashboardTournamentsShowcaseProps {
  onSelectTournament: (tournament: Tournament) => void;
  userTeams?: Team[];
}

function normalizeGameId(gameText?: string): GameId {
  if (!gameText) return "valo";
  const upper = gameText.toUpperCase();
  if (upper.includes("MOBILE") || upper.includes("MLBB") || upper.includes("ML")) return "ml";
  if (upper.includes("LEAGUE") || upper.includes("LOL") || upper.includes("RIFT")) return "lol";
  if (upper.includes("CALL") || upper.includes("CODM") || upper.includes("WARFARE")) return "codm";
  return "valo";
}

function formatDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardTournamentsShowcase({
  onSelectTournament,
  userTeams = [],
}: DashboardTournamentsShowcaseProps) {
  const router = useRouter();
  const { selectedGame, selectedGameInfo, selectGame } = useGame();
  const activeGame: GameId = selectedGame || "valo";

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewScope, setViewScope] = useState<"ACTIVE_GAME" | "ALL_GAMES">("ACTIVE_GAME");

  useEffect(() => {
    let isMounted = true;
    tournamentsService
      .getTournaments()
      .then((data) => {
        if (!isMounted) return;
        setTournaments(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (isMounted) setTournaments([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute tournament counts per game title
  const countsByGame = useMemo(() => {
    const counts: Record<GameId, number> = {
      valo: 0,
      lol: 0,
      ml: 0,
      codm: 0,
    };

    tournaments.forEach((t) => {
      const g = normalizeGameId(t.gameTitle || t.game);
      counts[g] = (counts[g] || 0) + 1;
    });

    return counts;
  }, [tournaments]);

  // Tournaments for the active game
  const activeGameTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const g = normalizeGameId(t.gameTitle || t.game);
      return g === activeGame;
    });
  }, [tournaments, activeGame]);

  // Filtered list based on view scope
  const displayedTournaments = useMemo(() => {
    return viewScope === "ACTIVE_GAME" ? activeGameTournaments : tournaments;
  }, [viewScope, activeGameTournaments, tournaments]);

  // Other games that have tournaments when current active game has none
  const otherGamesWithTournaments = useMemo(() => {
    return (Object.keys(countsByGame) as GameId[]).filter(
      (g) => g !== activeGame && countsByGame[g] > 0
    );
  }, [countsByGame, activeGame]);

  const handleFormSquad = (gameKey: GameId) => {
    selectGame(gameKey);
    router.push("/team/create");
  };

  const userHasTeamForGame = (gameKey: GameId) => {
    return userTeams.some((t) => normalizeGameId(t.gameTitle) === gameKey);
  };

  return (
    <div className="space-y-4">
      {/* Tactical Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A253C] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-brand animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-primary-brand uppercase">
              PHILIPPINE COLLEGIATE CIRCUIT
            </span>
          </div>
          <h2 className="font-display text-base sm:text-lg font-black text-white uppercase tracking-wide flex items-center gap-2 mt-0.5">
            <TrophyIcon className="w-4 h-4 text-amber-400" />
            <span>Sanctioned Tournaments & Brackets</span>
          </h2>
        </div>

        {/* Tactical Scope & Filter Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#070A14] border border-[#182338]">
          <button
            type="button"
            onClick={() => setViewScope("ACTIVE_GAME")}
            className={`px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              viewScope === "ACTIVE_GAME"
                ? "game-theme-btn"
                : "text-slate-400 hover:text-white hover:bg-[#101626]"
            }`}
            style={{
              clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
            }}
          >
            <span>{selectedGameInfo?.shortName || "ACTIVE"}</span>
            <span className={`text-[9px] px-1 rounded ${
              viewScope === "ACTIVE_GAME" ? "bg-black/30 text-white" : "bg-[#141A29] text-slate-400"
            }`}>
              {activeGameTournaments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewScope("ALL_GAMES")}
            className={`px-3 py-1 text-[10px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              viewScope === "ALL_GAMES"
                ? "game-theme-btn"
                : "text-slate-400 hover:text-white hover:bg-[#101626]"
            }`}
            style={{
              clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
            }}
          >
            <span>ALL ESPORTS</span>
            <span className={`text-[9px] px-1 rounded ${
              viewScope === "ALL_GAMES" ? "bg-black/30 text-white" : "bg-[#141A29] text-slate-400"
            }`}>
              {tournaments.length}
            </span>
          </button>
        </div>
      </div>

      {/* Smart Alert: Tournaments active in other games */}
      {viewScope === "ACTIVE_GAME" && activeGameTournaments.length === 0 && otherGamesWithTournaments.length > 0 && (
        <div 
          className="p-4 bg-gradient-to-r from-amber-950/40 via-[#0D1220] to-[#0A0D18] border border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          style={{
            clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
          }}
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ZapIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-mono font-bold text-amber-300 uppercase tracking-wider block">
                Tournaments Uploaded in Other Titles
              </span>
              <span className="text-slate-300 text-[11px] leading-relaxed">
                No active brackets for {selectedGameInfo?.name || "this title"}, but{" "}
                {otherGamesWithTournaments.map((g, i) => (
                  <strong key={g} className="text-white font-mono">
                    {countsByGame[g]} in {GAMES[g]?.shortName || g.toUpperCase()}
                    {i < otherGamesWithTournaments.length - 1 ? ", " : ""}
                  </strong>
                ))}{" "}
                are open for university competition!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setViewScope("ALL_GAMES")}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-display text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
              style={{
                clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
              }}
            >
              View All Tournaments
            </button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-28 bg-[#0A0D18] border border-[#1E293B] animate-pulse" />
          <div className="h-28 bg-[#0A0D18] border border-[#1E293B] animate-pulse" />
        </div>
      ) : displayedTournaments.length === 0 ? (
        /* Empty State */
        <div 
          className="p-8 bg-[#0A0D18] border border-[#1E293B] text-center space-y-3 shadow-xl"
          style={{
            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
          }}
        >
          <div className="w-12 h-12 bg-[#121929] text-slate-400 border border-[#202C45] flex items-center justify-center mx-auto shadow-inner">
            <TrophyIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase text-white tracking-wider">
              {viewScope === "ACTIVE_GAME"
                ? `NO ACTIVE ${selectedGameInfo?.name || ""} TOURNAMENTS`
                : "NO TOURNAMENTS UPLOADED YET"}
            </h3>
            <p className="text-xs font-sans text-slate-400 max-w-sm mx-auto mt-1">
              Sanctioned collegiate brackets are posted weekly by student directors. Explore previous results or review circuit regulations.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/tournaments"
              className="h-8 px-4 bg-[#141A2B] hover:bg-[#1C253B] text-slate-200 border border-[#222E48] font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              Browse Tournaments Hub →
            </Link>
          </div>
        </div>
      ) : (
        /* Cards List */
        <div className="space-y-3.5">
          {displayedTournaments.slice(0, 4).map((t) => {
            const gameKey = normalizeGameId(t.gameTitle || t.game);
            const gameData = GAMES[gameKey] || GAMES.valo;
            const cardImg = t.image || gameData.image;
            const isLive = t.status === "LIVE";
            const hasSquad = userHasTeamForGame(gameKey);

            return (
              <div
                key={t.id}
                className="group relative bg-[#090C16] border border-[#1A253C] hover:border-primary-brand/50 shadow-xl transition-all duration-200 overflow-hidden"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                }}
              >
                {/* Specular Cyber Lightline */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary-brand/70 via-transparent to-transparent opacity-80" />

                <div className="flex flex-col md:flex-row items-stretch">
                  {/* Left Game Artwork Banner */}
                  <div className="w-full md:w-52 h-28 md:h-auto relative overflow-hidden bg-[#050711] shrink-0 border-b md:border-b-0 md:border-r border-[#162034] p-3 flex flex-col justify-between">
                    <div className="absolute inset-0 opacity-25 group-hover:opacity-40 transition-opacity duration-300">
                      <Image src={cardImg} alt="" fill sizes="(max-width: 768px) 100vw, 208px" className="object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#090C16] via-transparent to-transparent" />

                    <div className="relative z-10 flex items-center justify-between">
                      <span 
                        className="font-mono text-[9px] font-bold text-white uppercase px-2 py-0.5 bg-[#141A29]/90 border border-white/20"
                        style={{
                          clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                        }}
                      >
                        {gameData.shortName}
                      </span>

                      <span 
                        className={`font-mono text-[8px] font-bold uppercase px-2 py-0.5 border ${
                          isLive
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse"
                            : "bg-cyan-950/70 text-cyan-300 border-cyan-500/30"
                        }`}
                        style={{
                          clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                        }}
                      >
                        {isLive ? "LIVE CIRCUIT" : "UPCOMING"}
                      </span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      <span className="font-display text-sm font-black uppercase text-white/50 tracking-tight block">
                        {gameData.name}
                      </span>
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold text-primary-brand tracking-widest uppercase">
                          OFFICIAL SANCTIONED EVENT
                        </span>
                        {t.startDate && (
                          <span className="text-[10px] font-mono text-cyan-300 flex items-center gap-1 bg-cyan-950/30 px-2 py-0.2 border border-cyan-500/20">
                            <ClockIcon className="w-3 h-3 text-cyan-400" />
                            <span>{formatDate(t.startDate)}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-base sm:text-lg font-black text-white uppercase tracking-tight group-hover:text-primary-brand transition-colors">
                        {t.title}
                      </h3>

                      <p className="text-xs font-sans text-slate-400 mt-1 line-clamp-1">
                        {t.statusText || "Inter-collegiate championship series bracket."}
                      </p>

                      {/* Badges Row */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        {t.bracketFormat && (
                          <span className="px-2 py-0.5 bg-[#0F1424] border border-[#1E2942] text-[10px] font-mono text-slate-300">
                            Format: <strong className="text-white">{t.bracketFormat}</strong>
                          </span>
                        )}
                        {t.teamQuota && (
                          <span className="px-2 py-0.5 bg-[#0F1424] border border-[#1E2942] text-[10px] font-mono text-slate-300">
                            Quota: <strong className="text-white">{t.teamQuota} Squads</strong>
                          </span>
                        )}
                        {t.universities && t.universities.length > 0 && (
                          <span className="px-2 py-0.5 bg-[#0F1424] border border-[#1E2942] text-[10px] font-mono text-emerald-300">
                            <strong className="text-emerald-400">{t.universities.length}</strong> Universities Registered
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-2.5 border-t border-[#162034] flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
                        <span>Sanctioned Collegiate Bracket</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Bracket Inspection Button */}
                        <button
                          type="button"
                          onClick={() => onSelectTournament(t)}
                          className="h-8 px-3.5 bg-[#121828] hover:bg-[#1A233A] text-slate-200 hover:text-white border border-[#202C48] font-display text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <TrophyIcon className="w-3 h-3 text-amber-400" />
                          <span>View Bracket</span>
                        </button>

                        {/* Squad Action / CTA */}
                        {hasSquad ? (
                          <Link
                            href="/tournaments"
                            className="h-8 px-3.5 bg-gradient-to-r from-emerald-900/60 to-emerald-950/90 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 font-display text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                            style={{
                              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                            <span>Squad Ready</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFormSquad(gameKey)}
                            className="h-8 px-4 game-theme-btn font-display text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                            style={{
                              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            <PlusIcon className="w-3 h-3" />
                            <span>Form Squad to Compete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Footer Link to the full tournaments page */}
          <div className="pt-1 flex items-center justify-end">
            <Link
              href="/tournaments"
              className="text-xs font-mono font-bold text-slate-400 hover:text-primary-brand transition-colors flex items-center gap-1.5 uppercase"
            >
              <span>Explore All Tournaments & Brackets ({tournaments.length})</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
