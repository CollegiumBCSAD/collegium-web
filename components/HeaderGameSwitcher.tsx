"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GAME_LIST, GameInfo } from "@/lib/games";

export default function HeaderGameSwitcher() {
  const { selectedGame, selectedGameInfo, selectGame, openGameSelector, isLoaded } = useGame();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="h-9 w-28 sm:w-36 rounded-lg bg-raised-panel/60 border border-raised-panel animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-full border border-panel-border bg-card-bg/90 hover:bg-raised-panel hover:border-white/20 transition-all duration-200 focus:outline-none shadow-md cursor-pointer group"
      >
        {selectedGameInfo ? (
          <>
            <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-white/20">
              <Image
                src={selectedGameInfo.image}
                alt={selectedGameInfo.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-[9px] font-sans text-secondary-text tracking-wider uppercase font-semibold">
                GAME TITLE
              </span>
              <span
                className="text-xs font-sans font-bold uppercase"
                style={{ color: selectedGameInfo.accentColor }}
              >
                {selectedGameInfo.shortName}
              </span>
            </div>
            <span className="sm:hidden font-sans text-xs font-bold uppercase" style={{ color: selectedGameInfo.accentColor }}>
              {selectedGameInfo.shortName}
            </span>
          </>
        ) : (
          <>
            <span className="w-6 h-6 rounded-full bg-primary-brand/20 text-primary-brand flex items-center justify-center text-xs font-bold">
              🎮
            </span>
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-foreground">
              Select Game
            </span>
          </>
        )}

        <svg
          className={`w-3.5 h-3.5 text-secondary-text group-hover:text-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#272B3A] bg-[#0C0F17] shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-raised-panel">
            <span className="text-[10px] font-sans font-extrabold tracking-widest uppercase text-secondary-text block">
              Active Game Preference
            </span>
            <p className="text-xs font-sans text-white/70 mt-0.5">
              Saved locally on your device
            </p>
          </div>

          <div className="py-1">
            {GAME_LIST.map((game: GameInfo) => {
              const isCurrent = selectedGame === game.id;
              return (
                <button
                  key={game.id}
                  onClick={() => {
                    selectGame(game.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-sans transition-colors duration-150 hover:bg-white/5 ${
                    isCurrent ? "bg-white/5 font-bold" : "text-secondary-text hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 border border-white/10 bg-card-bg">
                      <Image src={game.image} alt={game.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-sm tracking-wide text-foreground uppercase">
                        {game.name}
                      </span>
                      <span className="text-[10px] text-secondary-text font-normal">
                        {game.genre}
                      </span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: game.accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1 border-t border-raised-panel px-2 mt-1">
            <button
              onClick={() => {
                openGameSelector();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-sans font-semibold text-secondary-text hover:text-foreground hover:bg-raised-panel transition-colors text-center"
            >
              <svg className="w-4 h-4 text-secondary-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Reopen Game Selector</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
