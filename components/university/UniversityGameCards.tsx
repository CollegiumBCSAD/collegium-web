"use client";

import React from "react";
import Image from "next/image";
import { University } from "@/types";
import { GAMES } from "@/lib/games";
import { SwordsIcon } from "@/components/ui/Icons";

interface UniversityGameCardsProps {
  university: University;
}

export default function UniversityGameCards({ university }: UniversityGameCardsProps) {
  const wins = university.wins || 0;
  const losses = university.losses || 0;

  const gameRatings = [
    { gameId: "valo", name: "VALORANT", shortName: "VALO", image: GAMES.valo.image, rating: Math.round(university.glicko2_rating), wins, losses },
    { gameId: "lol", name: "League of Legends", shortName: "LoL", image: GAMES.lol.image, rating: Math.round(university.glicko2_rating), wins, losses },
    { gameId: "ml", name: "Mobile Legends: BB", shortName: "MLBB", image: GAMES.ml.image, rating: Math.round(university.glicko2_rating), wins, losses },
    { gameId: "codm", name: "Call of Duty: Mobile", shortName: "CODM", image: GAMES.codm.image, rating: Math.round(university.glicko2_rating), wins, losses },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#1E2538] pb-2.5">
        <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <SwordsIcon className="w-4 h-4 text-slate-400" />
          <span>VARSITY ESPORTS TITLES & RATINGS</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameRatings.map((g) => {
          const gameTotal = g.wins + g.losses;
          const gameWinRate = gameTotal > 0 ? Math.round((g.wins / gameTotal) * 100) : 0;

          return (
            <div
              key={g.gameId}
              className="p-5 bg-[#0A0D18] border border-[#1E293B] space-y-4 relative overflow-hidden shadow-xl hover:border-[#3A4E7A] transition-all duration-200 group hover:-translate-y-1"
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              {/* Top Neutral Highlight Notch */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-slate-500/40 via-slate-400/20 to-transparent" />

              {/* Background Game Art Watermark */}
              <div className="absolute right-0 bottom-0 w-28 h-28 opacity-[0.04] group-hover:opacity-[0.09] grayscale blur-[1px] group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <Image src={g.image} alt="" fill className="object-cover" />
              </div>

              {/* Game Top Header */}
              <div className="flex items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Octagonal Game Thumbnail */}
                  <div 
                    className="relative w-9 h-9 overflow-hidden shrink-0 border border-white/10 bg-[#060810]"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  >
                    <Image src={g.image} alt={g.name} fill className="object-cover" />
                  </div>

                  <span className="font-display text-xs font-black uppercase text-white truncate block group-hover:text-primary-brand transition-colors">
                    {g.name}
                  </span>
                </div>

                {/* Angled Game Badge */}
                <span
                  className="text-[9px] font-mono font-bold px-2.5 py-0.5 text-slate-300 bg-[#141A29] border border-[#232D44] shrink-0"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {g.shortName}
                </span>
              </div>

              {/* Rating & Record */}
              <div className="flex items-baseline justify-between pt-2 border-t border-[#182338] relative z-10">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 block uppercase font-bold">GLICKO-2 SCORE</span>
                  <span className="font-display text-xl font-black text-white">{g.rating}</span>
                </div>
                <span 
                  className="text-xs font-mono font-bold text-slate-300 bg-[#141A29] px-2.5 py-1 border border-[#232D44]"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {g.wins}W - {g.losses}L
                </span>
              </div>

              {/* Slanted Segmented Win Rate Meter Bar */}
              <div className="space-y-1.5 pt-1 relative z-10">
                <div 
                  className="w-full bg-[#060812] h-2 overflow-hidden border border-[#182338] p-0.5"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-slate-500 to-slate-300 transition-all duration-500"
                    style={{ width: `${gameWinRate}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold">
                  <span>WIN RATE METER</span>
                  <span className="text-slate-300">{gameWinRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
