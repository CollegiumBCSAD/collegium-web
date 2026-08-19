"use client";

import React from "react";
import { University } from "@/types";
import { useGame } from "@/context/GameContext";
import { GAMES } from "@/lib/games";
import { ShieldIcon, CheckCircleIcon, TrophyIcon, ZapIcon } from "@/components/ui/Icons";

interface UniversityHeaderBannerProps {
  university: University;
}

export default function UniversityHeaderBanner({ university }: UniversityHeaderBannerProps) {
  const { selectedGame } = useGame();
  const game = GAMES[selectedGame as keyof typeof GAMES] || GAMES.valo;

  const wins = university.wins || 0;
  const losses = university.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const initials = university.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();

  return (
    <div className="relative">
      {/* 6-Sided Faceted Tactical Chassis */}
      <div 
        className="relative bg-gradient-to-r from-[#0C101D] via-[#090D18] to-[#0C101D] border border-[#1E293B] p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden"
        style={{
          clipPath: "polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px))",
        }}
      >
        {/* Dynamic Game Accent Ambient Top Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2.5px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, ${game.accentColor} 70%, transparent 100%)`,
            boxShadow: `0 0 16px var(--primary-brand)`,
          }}
        />

        {/* Subtle Ambient Radial Glow in the Corner */}
        <div 
          className="absolute right-0 top-0 w-96 h-96 pointer-events-none opacity-15 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${game.accentColor} 0%, transparent 70%)`,
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          {/* Left Side: 8-Sided Octagonal Varsity Emblem & University Title */}
          <div className="flex items-center gap-5 min-w-0">
            
            {/* 8-Sided Octagonal Varsity Emblem with Game Accent Ring */}
            <div 
              className="w-20 h-20 bg-gradient-to-br from-[#1E293B] via-[#101626] to-[#0A0D18] p-[2.5px] shadow-2xl flex items-center justify-center shrink-0"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                boxShadow: `0 0 20px ${game.accentColor}25`,
              }}
            >
              <div 
                className="w-full h-full bg-[#080B14] flex items-center justify-center font-display text-2xl sm:text-3xl font-black text-white"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                {initials}
              </div>
            </div>

            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span 
                  className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-3 py-0.5 border border-emerald-500/30 flex items-center gap-1.5 shrink-0"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                  ACCREDITED VARSITY ORGANIZATION
                </span>

                {university.domain && (
                  <span 
                    className="text-[10px] font-mono font-bold text-slate-400 bg-[#0F1422] px-3 py-0.5 border border-[#1E293B] flex items-center gap-1.5"
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <ShieldIcon className="w-3 h-3 text-slate-400" />
                    {university.domain}
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black uppercase text-white tracking-wide truncate drop-shadow-sm">
                {university.name}
              </h1>
            </div>
          </div>

          {/* Right Side: Asymmetrical Slanted Telemetry Pod */}
          <div 
            className="grid grid-cols-3 gap-2 p-3.5 bg-[#050711] border border-[#1A253A] shrink-0 text-center shadow-inner"
            style={{
              clipPath: "polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)",
            }}
          >
            <div className="px-4 py-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold flex items-center justify-center gap-1">
                <ZapIcon className="w-2.5 h-2.5 text-primary-brand" />
                GLICKO-2
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-white block mt-0.5">
                {university.glicko2_rating.toFixed(1)}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                ±{university.glicko2_rd?.toFixed(0) || "42"} RD
              </span>
            </div>

            <div className="px-4 py-1 border-x border-[#182338]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold flex items-center justify-center gap-1">
                <TrophyIcon className="w-2.5 h-2.5 text-amber-400" />
                WIN RATE
              </span>
              <span className="font-display text-xl sm:text-2xl font-black text-white block mt-0.5">
                {winRate}%
              </span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                {totalMatches} MATCHES
              </span>
            </div>

            <div className="px-4 py-1">
              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 block font-bold">
                RECORD
              </span>
              <span className="font-display text-lg sm:text-xl font-black text-slate-200 block mt-1">
                {wins}W - {losses}L
              </span>
              <span className="text-[9px] font-mono text-emerald-400 block mt-0.5 font-bold">
                SEASON 1
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
