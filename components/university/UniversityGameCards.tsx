"use client";

import React from "react";
import Image from "next/image";
import { University } from "@/types";
import { GAME_LIST, GAMES } from "@/lib/games";
import { SwordsIcon } from "@/components/ui/Icons";

interface UniversityGameCardsProps {
  university: University;
}

export default function UniversityGameCards({ university }: UniversityGameCardsProps) {
  const wins = university.wins || 0;
  const losses = university.losses || 0;

  const gameRatings = [
    { gameId: "valo", name: "VALORANT", shortName: "VALO", image: GAMES.valo.image, accent: "#E53A4C", rating: Math.round(university.glicko2_rating), wins, losses },
    { gameId: "lol", name: "League of Legends", shortName: "LoL", image: GAMES.lol.image, accent: "#00A3FF", rating: Math.round(university.glicko2_rating), wins, losses },
    { gameId: "ml", name: "Mobile Legends: BB", shortName: "MLBB", image: GAMES.ml.image, accent: "#A855F7", rating: Math.round(university.glicko2_rating), wins, losses },
    { gameId: "codm", name: "Call of Duty: Mobile", shortName: "CODM", image: GAMES.codm.image, accent: "#F59E0B", rating: Math.round(university.glicko2_rating), wins, losses },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base sm:text-lg font-bold uppercase tracking-wide text-white flex items-center gap-2">
          <SwordsIcon className="w-4 h-4 text-primary-brand" />
          <span>Varsity Esports Titles & Ratings</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameRatings.map((g) => {
          const gameTotal = g.wins + g.losses;
          const gameWinRate = gameTotal > 0 ? Math.round((g.wins / gameTotal) * 100) : 0;

          return (
            <div
              key={g.gameId}
              className="p-5 rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] space-y-4 relative overflow-hidden shadow-lg backdrop-blur-xl hover:border-slate-400 transition-all duration-200 group hover:-translate-y-0.5"
            >
              {/* Game Top Header */}
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-md">
                  <Image src={g.image} alt={g.name} fill className="object-cover" />
                </div>

                <div className="min-w-0">
                  <span className="text-xs font-sans font-bold uppercase text-white truncate block leading-tight group-hover:text-primary-brand transition-colors">
                    {g.name}
                  </span>
                  <span
                    className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md bg-[#141A29] border border-[#232D44] inline-block mt-0.5"
                    style={{ color: g.accent }}
                  >
                    {g.shortName}
                  </span>
                </div>
              </div>

              {/* Rating & Record */}
              <div className="flex items-baseline justify-between pt-2 border-t border-[#1C2538]">
                <div>
                  <span className="text-[10px] font-sans text-slate-400 block uppercase font-medium">Glicko-2 Score</span>
                  <span className="font-display text-xl font-bold text-white">{g.rating}</span>
                </div>
                <span className="text-xs font-sans font-semibold text-slate-300 bg-[#141A29] px-2.5 py-1 rounded-md border border-[#232D44]">
                  {g.wins}W - {g.losses}L
                </span>
              </div>

              {/* Win Rate Meter Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full bg-[#080C14] h-1.5 rounded-full overflow-hidden border border-[#1C2538] p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-brand to-rose-500 transition-all duration-500 shadow-sm"
                    style={{ width: `${gameWinRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-sans text-slate-400 font-normal">
                  <span>Win Rate Meter</span>
                  <span className="font-semibold text-slate-200">{gameWinRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
