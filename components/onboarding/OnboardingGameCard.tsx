"use client";

import React from "react";
import Image from "next/image";
import { OnboardingGameCardProps } from "@/types";
import { GAMES } from "@/lib/games";

export default function OnboardingGameCard({ gameId, isSelected, onSelect, multi = false }: OnboardingGameCardProps) {
  const game = GAMES[gameId];

  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={isSelected}
      onClick={() => onSelect(gameId)}
      className={`group relative text-left rounded-2xl p-1.5 border bg-[#0B0E17] transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${
        isSelected ? "shadow-2xl scale-[1.02]" : "border-[#1E293B] hover:border-slate-400 hover:-translate-y-0.5"
      }`}
      style={isSelected ? { borderColor: game.accentColor, boxShadow: `0 0 0 2px ${game.accentColor}55` } : undefined}
    >
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden flex flex-col justify-end p-3">
        <Image
          src={game.image}
          alt=""
          fill
          sizes="(min-width: 768px) 220px, 45vw"
          className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080A10] via-black/40 to-transparent" />

        <span
          aria-hidden
          className={`absolute top-2.5 right-2.5 w-5 h-5 border-2 flex items-center justify-center bg-black/60 ${
            multi ? "rounded-md" : "rounded-full"
          }`}
          style={{ borderColor: isSelected ? game.accentColor : "rgba(255,255,255,0.4)" }}
        >
          {isSelected && (
            <span className={`w-2.5 h-2.5 ${multi ? "rounded-sm" : "rounded-full"}`} style={{ backgroundColor: game.accentColor }} />
          )}
        </span>

        <div className="relative">
          <span className="block text-[9px] font-mono font-extrabold uppercase tracking-widest" style={{ color: game.accentColor }}>
            {game.genre}
          </span>
          <span className="block font-display text-sm sm:text-base font-black uppercase text-white leading-tight">
            {game.name}
          </span>
        </div>
      </div>
    </button>
  );
}
