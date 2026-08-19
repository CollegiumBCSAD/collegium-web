"use client";

import { MatchCardProps } from "@/types";

export default function MatchCard({ match, onViewBoxScore }: MatchCardProps) {
  return (
    <div className="w-52 sm:w-56 rounded-lg border border-panel-border bg-card-bg overflow-hidden shadow-xl flex flex-col">
      <div
        className={`flex items-center justify-between px-3.5 py-2 font-sans text-xs font-bold border-b border-panel-border ${
          match.team1.isWinner
            ? "bg-raised-panel text-primary-brand"
            : "bg-raised-panel text-foreground"
        }`}
      >
        <span className="truncate pr-2">{match.team1.name}</span>
        <span className="font-sans font-bold text-xs sm:text-sm">
          {match.team1.score}
        </span>
      </div>

      <div
        className={`flex items-center justify-between px-3.5 py-2 font-sans text-xs font-bold ${
          match.team2.isWinner
            ? "bg-card-bg text-primary-brand"
            : "bg-card-bg text-foreground"
        }`}
      >
        <span className="truncate pr-2">{match.team2.name}</span>
        <span className="font-sans font-bold text-xs sm:text-sm">
          {match.team2.score}
        </span>
      </div>

      <button
        onClick={onViewBoxScore}
        className="w-full py-1.5 game-theme-btn font-sans text-xs font-bold tracking-normal text-center transition-colors cursor-pointer"
      >
        View
      </button>
    </div>
  );
}
