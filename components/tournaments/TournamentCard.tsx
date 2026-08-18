"use client";

import React from "react";
import { Tournament } from "@/types";
import { TrophyIcon } from "@/components/ui/Icons";

interface TournamentCardProps {
  tournament: Tournament;
  onSelect: (tournament: Tournament) => void;
}

export default function TournamentCard({
  tournament,
  onSelect,
}: TournamentCardProps) {
  const isCompleted = tournament.status?.toLowerCase() === "completed";

  return (
    <div className="group relative flex flex-col md:flex-row overflow-hidden rounded-2xl border border-[#1E273A] bg-[#0C101A]/90 transition-all duration-300 hover:border-primary-brand/50 hover:bg-[#101524] shadow-2xl backdrop-blur-md">
      {/* Top Banner Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-brand/80 via-accent/50 to-primary-brand/80 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Game Image Banner Area */}
      <div
        className={`w-full md:w-64 lg:w-72 h-44 md:h-auto shrink-0 relative overflow-hidden bg-gradient-to-br ${tournament.bgGradient || "from-red-900/40 via-purple-950/30 to-[#0C101A]"} p-6 flex flex-col justify-between`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-black/60 pointer-events-none" />
        
        {/* Game Tag Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="font-sans text-[11px] font-extrabold tracking-widest text-white uppercase px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-md">
            {tournament.game}
          </span>
          <span className={`font-sans text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${
            isCompleted 
              ? "bg-slate-900/80 text-slate-300 border-slate-700" 
              : "bg-emerald-950/80 text-emerald-400 border-emerald-500/40 animate-pulse"
          }`}>
            {isCompleted ? "COMPLETED" : "LIVE CIRCUIT"}
          </span>
        </div>

        {/* Banner Graphic Placeholder */}
        <div className="relative z-10 mt-auto">
          <span className="font-display text-2xl font-black uppercase text-white/20 tracking-tighter block group-hover:text-white/30 transition-colors">
            {tournament.game}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between min-h-[220px]">
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5">
              <TrophyIcon className="w-4 h-4 text-primary-brand" />
              <span>OFFICIAL COLLEGIATE CIRCUIT</span>
            </span>
            <span className="font-mono text-xs font-semibold text-secondary-text">
              {tournament.statusText || "Season Tournament"}
            </span>
          </div>

          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground uppercase group-hover:text-primary-brand transition-colors">
            {tournament.title}
          </h2>

          <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1.5 leading-relaxed">
            {tournament.statusText}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {tournament.bulletPoints.map((pt) => (
              <span key={pt} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#141926] border border-[#232B3E] text-xs font-sans text-slate-300">
                <span className="text-primary-brand font-bold">•</span>
                <span>{pt}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#192030] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-sans text-secondary-text">
            <span>Verified Tournament Payload</span>
          </div>

          <button
            onClick={() => onSelect(tournament)}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#171D2C] to-[#1C2336] hover:from-primary-brand hover:to-[#C02636] text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground hover:text-white border border-[#2A344D] hover:border-primary-brand/50 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.98] flex items-center gap-2"
          >
            <span>View Bracket & Details</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

