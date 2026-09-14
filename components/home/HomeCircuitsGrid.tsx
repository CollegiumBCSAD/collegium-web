"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { GameId, Tournament } from "@/types";
import { Team } from "@/lib/teams";
import { GAME_LIST } from "@/lib/games";
import { CheckCircleIcon } from "@/components/ui/Icons";

interface HomeCircuitsGridProps {
  activeGame: GameId;
  selectGame: (gameId: GameId) => void;
  openGameSelector: () => void;
  teams: Team[];
  tournaments: Tournament[];
}

export default function HomeCircuitsGrid({
  activeGame,
  selectGame,
  openGameSelector,
  teams,
  tournaments,
}: HomeCircuitsGridProps) {
  const gameStats = useMemo(() => {
    const map: Record<string, { tourneys: number; teamsCount: number }> = {
      valo: { tourneys: 0, teamsCount: 0 },
      lol: { tourneys: 0, teamsCount: 0 },
      codm: { tourneys: 0, teamsCount: 0 },
      ml: { tourneys: 0, teamsCount: 0 },
    };

    teams.forEach((t) => {
      const g = (t.gameTitle || "").toLowerCase();
      if (g.includes("val")) map.valo.teamsCount++;
      else if (g.includes("lol") || g.includes("league")) map.lol.teamsCount++;
      else if (g.includes("cod")) map.codm.teamsCount++;
      else if (g.includes("ml") || g.includes("mobile")) map.ml.teamsCount++;
    });

    tournaments.forEach((t) => {
      const g = (t.game || t.gameTitle || "").toLowerCase();
      if (g.includes("val")) map.valo.tourneys++;
      else if (g.includes("lol") || g.includes("league")) map.lol.tourneys++;
      else if (g.includes("cod")) map.codm.tourneys++;
      else if (g.includes("ml") || g.includes("mobile")) map.ml.tourneys++;
    });

    return map;
  }, [teams, tournaments]);

  return (
    <section className="py-10 sm:py-14 border-t border-white/[0.06]">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#18233B]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-brand animate-ping" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary-brand">
                SANCTIONED CIRCUITS
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
              FEATURED ARENA TITLES
            </h2>
          </div>

          <button
            type="button"
            onClick={openGameSelector}
            className="h-9 px-4 bg-[#10172A] hover:bg-[#18233C] text-slate-300 hover:text-white border border-[#202C48] hover:border-primary-brand/50 font-display text-xs font-bold uppercase tracking-wider transition-all rounded-lg self-start sm:self-auto flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>Browse All Arenas</span>
            <span className="text-primary-brand">→</span>
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GAME_LIST.map((game) => {
            const isSelected = activeGame === game.id;
            const gStat = gameStats[game.id] || { tourneys: 0, teamsCount: 0 };
            const displayTournaments = gStat.tourneys > 0 ? gStat.tourneys : game.activeTournaments;
            const displayTeams = gStat.teamsCount > 0 ? gStat.teamsCount : game.activeTeams;

            return (
              <div
                key={game.id}
                onClick={() => selectGame(game.id as GameId)}
                className={`group relative flex flex-col justify-between overflow-hidden bg-[#0D1220] border transition-all duration-200 cursor-pointer p-4 rounded-xl ${
                  isSelected
                    ? "border-primary-brand shadow-xl shadow-primary-brand/10 -translate-y-0.5"
                    : "border-[#18233B] hover:border-[#2A3B60] hover:-translate-y-0.5"
                }`}
              >
                {/* Neon strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] transition-opacity"
                  style={{
                    backgroundColor: game.accentColor,
                    boxShadow: `0 0 10px ${game.accentColor}`,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                <div className="space-y-3">
                  <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg bg-[#060810] border border-white/10">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-transparent to-black/20" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider bg-black/80 rounded-full text-slate-300 border border-white/10">
                      {game.genre}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-black tracking-wide text-white uppercase group-hover:text-primary-brand transition-colors truncate">
                      {game.name}
                    </h3>
                    <p className="text-[10px] font-sans text-slate-400 truncate mt-0.5">
                      {game.tagline || game.subtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[9px]">
                    <div className="p-2 rounded bg-[#070A12] border border-[#18233B]">
                      <span className="text-slate-500 uppercase block">TOURNAMENTS</span>
                      <span className="font-display text-xs font-black text-white block mt-0.5">{displayTournaments}</span>
                    </div>
                    <div className="p-2 rounded bg-[#070A12] border border-[#18233B]">
                      <span className="text-slate-500 uppercase block">SQUADS</span>
                      <span className="font-display text-xs font-black text-white block mt-0.5">{displayTeams}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#18233B]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectGame(game.id as GameId);
                    }}
                    className={`w-full h-8 rounded-lg font-display text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "game-theme-btn shadow-sm"
                        : "bg-[#141B2D] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#232F4A]"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3" />
                        <span>Active Arena</span>
                      </>
                    ) : (
                      <>
                        <span>Select Arena</span>
                        <span className="text-primary-brand">→</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
