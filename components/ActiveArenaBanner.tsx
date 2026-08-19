"use client";

import React from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GAME_LIST, GameInfo, GameId } from "@/lib/games";

export default function ActiveArenaBanner() {
  const { selectedGame, selectedGameInfo, selectGame, openGameSelector, isLoaded } = useGame();

  if (!isLoaded || !selectedGameInfo) return null;

  return (
    <div className="w-full bg-[#0B0E17]/95 border-b border-[#1E273A] backdrop-blur-md relative z-30 shadow-md">
      {/* Subtle Game Accent Glow Line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-300 shadow-sm"
        style={{
          backgroundColor: selectedGameInfo.accentColor,
          boxShadow: `0 0 10px ${selectedGameInfo.accentColor}`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Active Game Badge */}
        <div className="flex items-center gap-3">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-white/20 shadow-md">
            <Image
              src={selectedGameInfo.image}
              alt={selectedGameInfo.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase hidden sm:inline-block">
              CURRENT ARENA:
            </span>
            <span
              className="font-display text-sm font-black uppercase tracking-wide flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#141A29] border"
              style={{
                color: selectedGameInfo.accentColor,
                borderColor: `${selectedGameInfo.accentColor}55`,
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: selectedGameInfo.accentColor }}
              />
              {selectedGameInfo.name}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#121622] px-2 py-0.5 rounded border border-[#232D44] hidden md:inline-block">
              {selectedGameInfo.genre}
            </span>
          </div>
        </div>

        {/* Right: Quick Switcher Arena Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase hidden lg:inline-block mr-1">
            SWITCH ARENA:
          </span>
          {GAME_LIST.map((game: GameInfo) => {
            const isActive = selectedGame === game.id;
            return (
              <button
                key={game.id}
                onClick={() => selectGame(game.id as GameId)}
                className={`px-3 py-1 rounded-full text-xs font-mono font-black uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "text-black shadow-md scale-105"
                    : "text-slate-400 hover:text-white bg-[#121724] border border-[#232D44] hover:border-slate-500"
                }`}
                style={{
                  backgroundColor: isActive ? game.accentColor : undefined,
                  boxShadow: isActive ? `0 0 12px ${game.accentColor}66` : undefined,
                }}
              >
                <span>{game.shortName}</span>
              </button>
            );
          })}

          <button
            onClick={openGameSelector}
            title="Browse all arena title battlegrounds"
            className="p-1 rounded-full bg-[#141A29] border border-[#232D44] hover:border-amber-400 text-slate-400 hover:text-amber-400 transition-colors ml-1 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
