"use client";

import React from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { GamepadIcon } from "@/components/ui/Icons";

export default function HeaderGameSwitcher() {
  const { selectedGameInfo, openGameSelector, isLoaded } = useGame();

  if (!isLoaded) {
    return (
      <div className="h-10 w-28 sm:w-36 rounded-full bg-raised-panel/60 border border-raised-panel animate-pulse" />
    );
  }

  return (
    <button
      onClick={openGameSelector}
      style={{
        borderColor: selectedGameInfo ? `${selectedGameInfo.accentColor}66` : "#232D44",
        boxShadow: selectedGameInfo ? `0 0 10px ${selectedGameInfo.accentColor}25` : undefined,
      }}
      className="flex items-center gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border bg-[#0D121F]/90 hover:bg-[#141A29] transition-all duration-200 focus:outline-none shadow-md cursor-pointer group active:scale-95"
      title="Click to switch active game"
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
    </button>
  );
}
