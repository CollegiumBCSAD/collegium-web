"use client";

import React from "react";
import Image from "next/image";
import { University } from "@/types";
import { useGame } from "@/context/GameContext";
import { GAMES } from "@/lib/games";
import { SwordsIcon, TrophyIcon, ZapIcon, CrownIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface UniversityGameCardsProps {
  university: University;
}

const GAME_DETAILS: Record<string, { format: string; mode: string; banner: string }> = {
  valo: {
    format: "5v5 TACTICAL SHOOTER",
    mode: "COMPETITIVE MAP POOL • ASCENT, HAVEN, SUNSET",
    banner: "/valorant-art-1.png",
  },
  lol: {
    format: "5v5 MOBA RIFT WARFARE",
    mode: "SUMMONER'S RIFT • DRAFT PICK RULES",
    banner: "/lol-art-3.png",
  },
  ml: {
    format: "5v5 MOBILE MOBA",
    mode: "EXP LANE, GOLD LANE, JUNGLE ROTATION",
    banner: "/ml-art-3.jpg",
  },
  codm: {
    format: "5v5 TACTICAL FPS",
    mode: "SEARCH & DESTROY, HARDPOINT, CONTROL",
    banner: "/codm-art-2.jpg",
  },
};

export default function UniversityGameCards({ university }: UniversityGameCardsProps) {
  const { selectedGame } = useGame();
  const activeGameKey = selectedGame || "valo";
  const game = GAMES[activeGameKey as keyof typeof GAMES] || GAMES.valo;
  const gameDetails = GAME_DETAILS[activeGameKey] || GAME_DETAILS.valo;

  // Match the specific rating for the selected game if available
  const specificRating = university.gameRatings?.find(
    (gr) => gr.gameTitle.toLowerCase().includes(activeGameKey) ||
            (activeGameKey === "valo" && gr.gameTitle.toLowerCase().includes("valorant")) ||
            (activeGameKey === "lol" && gr.gameTitle.toLowerCase().includes("league")) ||
            (activeGameKey === "ml" && gr.gameTitle.toLowerCase().includes("mobile")) ||
            (activeGameKey === "codm" && gr.gameTitle.toLowerCase().includes("duty"))
  );

  const rating = specificRating ? specificRating.glicko2_rating : Math.round(university.glicko2_rating);
  const wins = specificRating ? specificRating.wins : university.wins || 0;
  const losses = specificRating ? specificRating.losses : university.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-[#1E2538] pb-2.5">
        <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
          <SwordsIcon className="w-4 h-4 text-primary-brand" />
          <span>VARSITY ESPORTS DIVISION: {game.name.toUpperCase()}</span>
        </h2>
        <span 
          className="text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 bg-primary-brand/10 border border-primary-brand/30 text-primary-brand"
          style={{
            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
          }}
        >
          ACTIVE BATTLEGROUND
        </span>
      </div>

      {/* Unified High-Tech Esports Console for the Selected Game */}
      <div 
        className="p-6 sm:p-8 bg-[#090C16] border border-[#1E293B] shadow-2xl relative overflow-hidden group"
        style={{
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Dynamic Specular Top Highlight */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)`,
            boxShadow: `0 0 14px var(--primary-brand)`,
          }}
        />

        {/* Ambient Game Artwork Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 group-hover:opacity-25 transition-opacity duration-700 pointer-events-none overflow-hidden">
          <Image 
            src={gameDetails.banner} 
            alt="" 
            fill 
            className="object-cover object-right-center blur-[0.5px] scale-105 group-hover:scale-110 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090C16] via-[#090C16]/80 to-transparent" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Game Title & Competitive Division Details */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              {/* Octagonal Game Badge */}
              <div 
                className="relative w-14 h-14 overflow-hidden shrink-0 border border-white/20 bg-[#060810] shadow-lg"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                <Image src={game.image} alt={game.name} fill className="object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-[#141A29] border border-[#243350] text-slate-300"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    {game.shortName} CIRCUIT
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                    <CrownIcon className="w-3 h-3 text-amber-400" />
                    TIER 1 VARSITY
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-wide mt-1">
                  {game.name}
                </h3>
              </div>
            </div>

            <div className="space-y-1 text-xs font-mono text-slate-400">
              <p className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-brand" />
                <span>{gameDetails.format}</span>
              </p>
              <p className="text-[11px] text-slate-400">{gameDetails.mode}</p>
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span 
                className="px-3 py-1 bg-[#101626] border border-[#1E293B] text-[10px] font-mono text-slate-300 flex items-center gap-1.5"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                Roster Certified
              </span>
              <span 
                className="px-3 py-1 bg-[#101626] border border-[#1E293B] text-[10px] font-mono text-slate-300 flex items-center gap-1.5"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <TrophyIcon className="w-3 h-3 text-amber-400" />
                Active Contender
              </span>
            </div>
          </div>

          {/* Right Column: Telemetry Gauge & Win Rate Bar */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Glicko-2 Score Pod */}
            <div 
              className="p-4 bg-[#050711] border border-[#192438] space-y-2 shadow-inner"
              style={{
                clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <span className="text-[9px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <ZapIcon className="w-3 h-3 text-primary-brand" />
                GLICKO-2 POWER RATING
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl sm:text-3xl font-black text-white">
                  {rating.toFixed(0)}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  TOP 5% NATIONWIDE
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Confidence RD: ±{university.glicko2_rd?.toFixed(0) || "42"}
              </p>
            </div>

            {/* Record & Win Rate Pod */}
            <div 
              className="p-4 bg-[#050711] border border-[#192438] space-y-2 shadow-inner"
              style={{
                clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
              }}
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase font-bold">
                <span>SEASON WIN RATE</span>
                <span className="text-white font-bold">{winRate}%</span>
              </div>

              {/* Progress Bar */}
              <div 
                className="w-full bg-[#0B0F1C] h-2.5 overflow-hidden border border-[#1C2538] p-0.5"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <div 
                  className="h-full game-theme-btn transition-all duration-500"
                  style={{ width: `${Math.max(winRate, 5)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                <span className="text-slate-400">Match Record:</span>
                <span className="text-white font-bold">{wins}W - {losses}L</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
