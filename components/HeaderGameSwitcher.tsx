"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GAME_LIST, GameInfo } from "@/lib/games";
import { GamepadIcon } from "@/components/ui/Icons";

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
      <div className="h-10 w-28 sm:w-36 rounded-full bg-raised-panel/60 border border-raised-panel animate-pulse" />
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-full border border-[#232D44] bg-[#0D121F]/90 hover:bg-[#141A29] hover:border-primary-brand/40 transition-all duration-200 focus:outline-none shadow-md cursor-pointer group active:scale-95"
      >
        {selectedGameInfo ? (
          <>
            <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-white/20 group-hover:scale-110 transition-transform duration-200">
              <Image
                src={selectedGameInfo.image}
                alt={selectedGameInfo.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col text-left leading-tight hidden sm:flex">
              <span className="text-[9px] font-mono text-slate-400 tracking-wider uppercase font-semibold">
                GAME TITLE
              </span>
              <span
                className="text-xs font-mono font-black uppercase"
                style={{ color: selectedGameInfo.accentColor }}
              >
                {selectedGameInfo.shortName}
              </span>
            </div>
            <span className="sm:hidden font-mono text-xs font-black uppercase" style={{ color: selectedGameInfo.accentColor }}>
              {selectedGameInfo.shortName}
            </span>
          </>
        ) : (
          <>
            <div className="w-6 h-6 rounded-full bg-primary-brand/20 text-primary-brand flex items-center justify-center">
              <GamepadIcon className="w-3.5 h-3.5 text-primary-brand" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Select Game
            </span>
          </>
        )}

        <svg
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
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
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#1E293B] bg-[#0D121F] shadow-2xl z-50 py-2 animate-dropdown-pop">
          <div className="px-4 py-2 border-b border-[#1C2538]">
            <span className="text-[10px] font-mono font-extrabold tracking-widest uppercase text-slate-400 block">
              Active Game Preference
            </span>
            <p className="text-xs font-sans text-slate-300 mt-0.5">
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
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs font-sans transition-all duration-150 hover:bg-[#141A29] hover:translate-x-1 ${
                    isCurrent ? "bg-[#141A29] font-bold text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 border border-white/10">
                      <Image src={game.image} alt={game.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-display font-black text-sm tracking-wide text-white uppercase">
                        {game.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {game.genre}
                      </span>
                    </div>
                  </div>
                  {isCurrent && (
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: game.accentColor }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1 border-t border-[#1C2538] px-2 mt-1">
            <button
              onClick={() => {
                openGameSelector();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-bold text-slate-300 hover:text-white hover:bg-[#141A29] transition-all text-center"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
