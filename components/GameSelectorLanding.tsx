"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { GAME_LIST, GAMES, GameId, GameInfo } from "@/lib/games";
import { ShieldIcon, TrophyIcon, SwordsIcon } from "@/components/ui/Icons";

const ARENA_DETAILS: Record<string, { num: string; initial: string; genre: string; gradient: string }> = {
  valo: {
    num: "01",
    initial: "V",
    genre: "TACTICAL FPS",
    gradient: "from-[#8B1424]/90 via-[#4F0B14]/80 to-[#140306]",
  },
  lol: {
    num: "02",
    initial: "L",
    genre: "MOBA",
    gradient: "from-[#0066B3]/90 via-[#003866]/80 to-[#001224]",
  },
  ml: {
    num: "03",
    initial: "M",
    genre: "MOBILE MOBA",
    gradient: "from-[#8C4A00]/90 via-[#4D2900]/80 to-[#1A0E00]",
  },
  codm: {
    num: "04",
    initial: "C",
    genre: "ACTION FPS",
    gradient: "from-[#856404]/90 via-[#473602]/80 to-[#140F00]",
  },
};

export default function GameSelectorLanding() {
  const router = useRouter();
  const { selectedGame, selectGame } = useGame();
  const [hoveredGame, setHoveredGame] = useState<GameId | null>(null);
  const [isSelecting, setIsSelecting] = useState<GameId | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const handleSelect = (id: GameId) => {
    setIsSelecting(id);
    setTimeout(() => {
      selectGame(id);
      setIsSelecting(null);
    }, 250);
  };

  const handleContinue = () => {
    if (selectedGame) {
      selectGame(selectedGame);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-between bg-[#080A10] text-foreground relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {GAME_LIST.map((game) => {
          const isActive = hoveredGame === game.id || (!hoveredGame && selectedGame === game.id);
          return (
            <div
              key={game.id}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[160px] transition-opacity duration-700 pointer-events-none ${
                isActive ? "opacity-30" : "opacity-0"
              }`}
              style={{ backgroundColor: game.accentColor }}
            />
          );
        })}
      </div>

      {/* Navbar Header Bar with Perfectly Centered Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between animate-arena-header-down">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Collegium Logo" className="w-7 h-7 object-contain" />
          <span className="font-display text-xl font-bold tracking-wider text-white">
            COLLEGIUM
          </span>
        </div>

        {/* Center: Perfectly Centered ARENAS / ABOUT Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-8 font-mono text-xs tracking-widest uppercase bg-[#0D121F]/90 px-5 py-2 rounded-full border border-[#232D44] shadow-md backdrop-blur-md">
          <button
            type="button"
            onClick={() => setShowAbout(false)}
            className={`transition-all duration-200 cursor-pointer font-bold ${
              !showAbout ? "text-primary-brand" : "text-slate-400 hover:text-white"
            }`}
          >
            ARENAS
          </button>
          <button
            type="button"
            onClick={() => setShowAbout(true)}
            className={`transition-all duration-200 cursor-pointer font-bold ${
              showAbout ? "text-primary-brand" : "text-slate-400 hover:text-white"
            }`}
          >
            ABOUT
          </button>
        </div>

        {/* Right: Live indicator */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 bg-[#121724] px-3 py-1.5 rounded-full border border-[#232D44]">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            LIVE 107
          </span>
        </div>
      </header>

      {/* Main Canvas: Toggle between Arenas and About */}
      {!showAbout ? (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-6xl mx-auto w-full text-center">
          {/* Title Header */}
          <div className="mb-8 md:mb-12 max-w-2xl text-center space-y-2 animate-arena-header-down">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-[2px] w-6 bg-primary-brand" />
              <span className="font-mono text-xs font-bold tracking-[0.25em] text-primary-brand uppercase">
                CHOOSE YOUR BATTLEGROUND
              </span>
              <span className="h-[2px] w-6 bg-primary-brand" />
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase leading-none">
              FIND YOUR <br />
              <span className="text-white/50">NEXT ARENA.</span>
            </h1>

            <p className="mt-3 font-sans text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Every game has a world. Pick yours and step into the conversation.
            </p>
          </div>

          {/* 4 Arena Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full max-w-6xl">
            {GAME_LIST.map((game: GameInfo, idx: number) => {
              const isSelected = selectedGame === game.id;
              const isThisLoading = isSelecting === game.id;
              const meta = ARENA_DETAILS[game.id] || {
                num: "01",
                initial: game.name.charAt(0),
                genre: game.genre,
                gradient: "from-rose-950 via-slate-900 to-black",
              };

              return (
                <button
                  type="button"
                  key={game.id}
                  onClick={() => handleSelect(game.id)}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame(null)}
                  style={{ animationDelay: `${idx * 120}ms` }}
                  className={`group relative text-left focus:outline-none transition-all duration-300 rounded-2xl p-2 border bg-[#0B0E17] animate-arena-roll-in cursor-pointer ${
                    isSelected
                      ? "border-primary-brand ring-2 ring-primary-brand/50 shadow-2xl shadow-primary-brand/30 scale-[1.02]"
                      : "border-[#1E293B] hover:border-slate-400 hover:-translate-y-1 shadow-xl"
                  }`}
                >
                  {/* Inner Card Wrapper */}
                  <div
                    className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b ${meta.gradient}`}
                  >
                    {/* High Opacity Game Artwork Overlay */}
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className="object-cover object-center opacity-70 group-hover:scale-105 group-hover:opacity-85 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080A10]/95 via-black/35 to-transparent pointer-events-none" />

                    {/* Top Bar inside Card */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-white/90 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 uppercase">
                        OFFICIAL ARENA
                      </span>

                      <span className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-md border border-white/20 flex items-center justify-center font-mono text-[10px] text-white/90 font-bold shadow-md">
                        {meta.num}
                      </span>
                    </div>

                    {/* Loading Spinner */}
                    {isThisLoading && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-20">
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      </div>
                    )}

                    {/* Bottom Content inside Card */}
                    <div className="relative z-10 mt-auto pb-2 space-y-1">
                      <span
                        className="text-[10px] font-mono font-extrabold tracking-widest uppercase block drop-shadow-sm"
                        style={{ color: game.accentColor }}
                      >
                        {meta.genre}
                      </span>

                      <h3 className="font-display text-lg sm:text-xl font-black text-white leading-tight uppercase drop-shadow-md">
                        {game.name}
                      </h3>
                    </div>

                    {/* Card Bottom Bar */}
                    <div className="relative z-10 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] font-mono text-slate-200 uppercase">
                      <span className="flex items-center gap-1.5 font-bold">
                        {isSelected ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            PRIMARY ARENA
                          </span>
                        ) : (
                          <span>ENTER ARENA</span>
                        )}
                      </span>

                      <span className="font-bold tracking-wider" style={{ color: game.accentColor }}>
                        5v5 /
                      </span>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Continue Action */}
          <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3">
            {selectedGame ? (
              <button
                type="button"
                onClick={handleContinue}
                className="h-11 px-8 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-[0.98]"
              >
                Continue to {GAMES[selectedGame].shortName} Arena →
              </button>
            ) : (
              <p className="font-sans text-xs text-slate-400 tracking-wider">
                Select any game title above to enter the Collegium Circuit
              </p>
            )}
          </div>
        </main>
      ) : (
        /* About Collegium Circuit Information View */
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full text-center space-y-8 animate-in fade-in duration-200">
          <div className="space-y-3">
            <span className="font-mono text-xs font-bold tracking-[0.25em] text-primary-brand uppercase block">
              THE COLLEGIUM MISSION
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              PHILIPPINE COLLEGIATE ESPORTS ENGINE
            </h2>
            <p className="font-sans text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Collegium is the single official home for Philippine university esports, connecting varsity athletes across Valorant, League of Legends, Mobile Legends: Bang Bang, and CODM.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left">
            <div className="p-6 rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] space-y-2 shadow-xl backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-[#141A29] border border-[#232D44] flex items-center justify-center text-primary-brand mb-3">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white uppercase">VERIFIED VARSITY ATHLETICS</h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                Cryptographically validated rosters via official university domains (`.edu.ph`) and Riot API integration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] space-y-2 shadow-xl backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-[#141A29] border border-[#232D44] flex items-center justify-center text-slate-300 mb-3">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white uppercase">GLICKO-2 MATCH ENGINE</h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                Automated inter-university scrimmage scheduling, rating adjustments, and peer-validated match reporting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] space-y-2 shadow-xl backdrop-blur-xl">
              <div className="w-10 h-10 rounded-xl bg-[#141A29] border border-[#232D44] flex items-center justify-center text-slate-300 mb-3">
                <SwordsIcon className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-white uppercase">LIVE WAR ROOM DM</h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                Realtime team-to-team tactical communication, custom lobby code sharing, and map veto coordination.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAbout(false)}
            className="h-11 px-8 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-[0.98]"
          >
            ← Back to Arenas
          </button>
        </main>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-[#1C2538]">
        <span>BUILT FOR PLAYERS, BY PLAYERS</span>
        <span>SELECT AN ARENA TO CONTINUE</span>
        <span>EST. 2026</span>
      </footer>
    </div>
  );
}
