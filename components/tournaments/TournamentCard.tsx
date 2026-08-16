"use client";

import React from "react";
import { Tournament } from "@/types";

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
}

export default function TournamentCard({
  tournament,
  onSelect,
}: TournamentCardProps) {
  return (
    <div className="group relative flex flex-col md:flex-row overflow-hidden rounded-xl border border-raised-panel bg-[#0E1119] transition-all hover:border-raised-panel/80 shadow-xl">
      <div
        className={`w-full md:w-56 lg:w-64 h-40 md:h-auto shrink-0 relative overflow-hidden bg-gradient-to-b ${tournament.bgGradient}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0E1119] opacity-90 hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E1119] opacity-90 md:hidden" />
      </div>

      <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
        <div>
          <div className="flex items-center justify-between gap-4 mb-1">
            <span className="font-sans text-xs sm:text-sm font-bold tracking-wider text-foreground uppercase">
              {tournament.game}
            </span>
            <span className="font-sans text-2xs sm:text-xs font-bold tracking-wider text-foreground uppercase">
              {tournament.status}
            </span>
          </div>

          <h2 className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {tournament.title}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1 tracking-tight">
            {tournament.statusText}
          </p>

          <ul className="mt-3 space-y-1 text-xs text-secondary-text font-sans tracking-tight">
            {tournament.bulletPoints.map((pt) => (
              <li key={pt} className="flex items-center gap-2">
                <span className="text-secondary-text">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <button
            onClick={() => onSelect(tournament)}
            className="flex h-11 w-full items-center justify-center rounded-full border border-raised-panel bg-[#141824] text-xs sm:text-sm font-semibold tracking-normal text-foreground transition-all hover:bg-raised-panel hover:border-secondary-text/30 cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
