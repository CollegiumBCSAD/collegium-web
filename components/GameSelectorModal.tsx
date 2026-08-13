"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GAME_LIST, GAMES, GameId, GameInfo } from "@/lib/games";

export default function GameSelectorModal() {
  const { selectedGame, selectGame, isSelectorOpen, closeGameSelector, isLoaded } = useGame();
  const [hoveredGame, setHoveredGame] = useState<GameId | null>(null);
  const [isSelecting, setIsSelecting] = useState<GameId | null>(null);

  useEffect(() => {
    if (isSelectorOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSelectorOpen]);

  if (!isLoaded || !isSelectorOpen) return null;

  const handleSelect = (id: GameId) => {
    setIsSelecting(id);
    setTimeout(() => {
      selectGame(id);
      setIsSelecting(null);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#0A0C10] text-foreground overflow-y-auto">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {GAME_LIST.map((game) => {
          const isActive = hoveredGame === game.id || (!hoveredGame && selectedGame === game.id);
          return (
            <div
              key={game.id}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] transition-opacity duration-700 pointer-events-none ${
                isActive ? "opacity-25" : "opacity-0"
              }`}
              style={{ backgroundColor: game.accentColor }}
            />
          );
        })}
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 bg-[#E53A4C] inline-block rounded-xs" />
          <span className="font-display text-xl font-bold tracking-wider text-foreground">
            COLLEGIUM
          </span>
        </div>
        {selectedGame && (
          <button
            onClick={closeGameSelector}
            className="flex items-center gap-2 text-xs font-sans font-medium uppercase tracking-widest text-secondary-text hover:text-foreground transition-colors px-3 py-1.5 rounded border border-raised-panel bg-card-bg hover:bg-raised-panel"
          >
            <span>Back to Site</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-6xl mx-auto w-full text-center">
        <div className="mb-8 md:mb-12 max-w-2xl">
          <span className="font-sans text-xs font-semibold tracking-[0.25em] text-[#F2B705] uppercase block mb-3">
            Philippine Collegiate Esports Circuit
          </span>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground uppercase">
            Who is Playing?
          </h1>
          <p className="mt-3 font-sans text-sm sm:text-base text-secondary-text max-w-lg mx-auto">
            Select your primary esports title to customize your circuit view. Your choice is saved locally and can be changed anytime.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 w-full max-w-5xl">
          {GAME_LIST.map((game: GameInfo) => {
            const isSelected = selectedGame === game.id;
            const isHovered = hoveredGame === game.id;
            const isThisLoading = isSelecting === game.id;

            return (
              <button
                key={game.id}
                onClick={() => handleSelect(game.id)}
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                className="group relative flex flex-col items-center text-left focus:outline-none transition-transform duration-200"
              >
                <div
                  className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#121520] border-2 transition-all duration-200 transform group-hover:-translate-y-1 ${
                    isSelected
                      ? `${game.borderColor}`
                      : "border-[#272B3A] group-hover:border-white/50"
                  }`}
                >
                  <Image
                    src={game.image}
                    alt={game.name}
                    fill
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-sans font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-black/80 text-white/90 border border-white/10">
                      {game.publisher}
                    </span>
                    {isSelected && (
                      <span
                        className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold"
                        style={{ backgroundColor: game.accentColor }}
                      >
                        ✓
                      </span>
                    )}
                  </div>

                  {isThisLoading && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-left">
                    <span
                      className="inline-block text-[10px] font-sans font-extrabold tracking-widest uppercase mb-1 px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: game.accentColor }}
                    >
                      {game.genre}
                    </span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white leading-tight uppercase">
                      {game.shortName}
                    </h3>
                    <p className="font-sans text-[11px] text-white/70 line-clamp-1 mt-0.5 hidden sm:block">
                      {game.tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-center w-full">
                  <span
                    className={`font-display text-sm sm:text-base tracking-wider uppercase block font-semibold transition-colors duration-200 ${
                      isSelected || isHovered ? "text-white" : "text-secondary-text"
                    }`}
                  >
                    {game.name}
                  </span>
                  <span className="text-[11px] font-sans text-secondary-text/70 block mt-0.5">
                    {game.activeTournaments} Tournaments · {game.activeTeams} Teams
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-14 flex flex-col items-center gap-3">
          {selectedGame ? (
            <button
              onClick={closeGameSelector}
              className="px-8 py-3 rounded border border-secondary-text/30 hover:border-white font-sans text-xs font-bold uppercase tracking-widest text-secondary-text hover:text-white transition-all bg-card-bg hover:bg-raised-panel"
            >
              Continue with {GAMES[selectedGame].shortName}
            </button>
          ) : (
            <p className="font-sans text-xs text-secondary-text/80 tracking-wider">
              Select any game title above to enter Collegium
            </p>
          )}
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center">
        <span className="font-sans text-[11px] text-secondary-text/50 tracking-wider">
          COLLEGIUM PHILIPPINES · SELECTION SAVED LOCALLY
        </span>
      </footer>
    </div>
  );
}
