"use client";

import React from "react";
import Image from "next/image";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { HeaderGameSwitcherProps } from "@/types";
import { GamepadIcon } from "@/components/ui/Icons";

export default function HeaderGameSwitcher({ variant = "bar", onInteract }: HeaderGameSwitcherProps) {
  const { selectedGameInfo, openGameSelector, isLoaded } = useGame();
  const { isLoggedIn, user } = useAuth();

  if (!isLoaded) {
    return null;
  }

  const isAthlete = isLoggedIn && user?.role === "ATHLETE";
  const accent = selectedGameInfo?.accentColor;
  const borderStyle = {
    borderColor: accent ? `${accent}66` : "#232D44",
    boxShadow: accent ? `0 0 10px ${accent}25` : undefined,
  };

  const handleOpenSelector = () => {
    onInteract?.();
    openGameSelector();
  };

  if (variant === "menu") {
    const body = (
      <>
        <span className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/15 flex items-center justify-center bg-[#141A29] relative">
          {selectedGameInfo ? (
            <Image
              src={selectedGameInfo.image}
              alt={selectedGameInfo.name}
              fill
              className="object-cover"
            />
          ) : (
            <GamepadIcon className="w-4 h-4 text-primary-brand" />
          )}
        </span>
        <span className="flex-1 min-w-0 text-left">
          <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Active game
          </span>
          <span
            className="block font-display text-sm font-black uppercase tracking-wider truncate"
            style={{ color: accent || "#fff" }}
          >
            {selectedGameInfo?.name || "Select a game"}
          </span>
        </span>
        {!isAthlete && (
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
            Change
          </span>
        )}
      </>
    );

    if (isAthlete) {
      return (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0D121F]/90"
          style={borderStyle}
        >
          {body}
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={handleOpenSelector}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border bg-[#0D121F]/90 hover:bg-[#141A29] transition-colors cursor-pointer"
        style={borderStyle}
      >
        {body}
      </button>
    );
  }

  const content = selectedGameInfo ? (
    <>
      <div
        className={`relative w-6 h-6 rounded-md overflow-hidden shrink-0 border border-white/20 ${
          !isAthlete ? "group-hover:scale-110" : ""
        } transition-transform duration-200`}
      >
        <Image
          src={selectedGameInfo.image}
          alt={selectedGameInfo.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col text-left leading-tight">
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
  );

  if (isAthlete) {
    return (
      <div
        style={borderStyle}
        className="flex items-center gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border bg-[#0D121F]/90 shadow-md select-none cursor-default"
      >
        {content}
      </div>
    );
  }

  return (
    <button
      onClick={handleOpenSelector}
      style={borderStyle}
      className="flex items-center gap-3 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border bg-[#0D121F]/90 hover:bg-[#141A29] transition-all duration-200 focus:outline-none shadow-md cursor-pointer group active:scale-95"
      title="Click to switch active game"
    >
      {content}
    </button>
  );
}
