"use client";

import React from "react";
import { GAME_LIST } from "@/lib/games";
import { GameId } from "@/types";

interface ScrimFilterBarProps {
  selectedGame: GameId | "all";
  onSelectGame: (gameId: GameId | "all") => void;
}

export default function ScrimFilterBar({
  selectedGame,
  onSelectGame,
}: ScrimFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectGame("all")}
        className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
          selectedGame === "all"
            ? "bg-primary-brand text-foreground"
            : "bg-card-bg border border-raised-panel text-secondary-text hover:text-foreground"
        }`}
      >
        All Titles
      </button>
      {GAME_LIST.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelectGame(game.id)}
          className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            selectedGame === game.id
              ? `${game.borderColor} border-2 bg-card-bg text-foreground`
              : "bg-card-bg border border-raised-panel text-secondary-text hover:text-foreground"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.image} alt={game.name} className="w-4 h-4 rounded object-cover" />
          <span>{game.shortName}</span>
        </button>
      ))}
    </div>
  );
}
