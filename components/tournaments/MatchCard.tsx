"use client";

import { MatchCardProps } from "@/types";
import { CrownIcon } from "@/components/ui/Icons";

export default function MatchCard({ match, onViewBoxScore }: MatchCardProps) {
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";
  const isTeam1Winner = match.team1.isWinner || (isCompleted && match.team1.score > match.team2.score);
  const isTeam2Winner = match.team2.isWinner || (isCompleted && match.team2.score > match.team1.score);
  const isMatchPlayed = isCompleted || (isLive && (match.team1.score > 0 || match.team2.score > 0));

  const getInitials = (name: string) => {
    if (!name || name === "TBD" || name.startsWith("Winner") || name.startsWith("Finalist")) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 3)
      .toUpperCase();
  };

  return (
    <div
      onClick={onViewBoxScore}
      className={`w-56 sm:w-64 h-[86px] bg-[#0A0D18] border shadow-xl transition-all duration-200 cursor-pointer overflow-hidden group relative flex flex-col justify-between ${
        isLive ? "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-[#1E293B] hover:border-primary-brand/60"
      }`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
      }}
    >
      {/* Top Neutral Highlight */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] ${
        isLive ? "bg-gradient-to-r from-emerald-500 via-emerald-400/40 to-transparent" : "bg-gradient-to-r from-slate-500/30 via-slate-400/10 to-transparent"
      }`} />

      {/* Team 1 Slot */}
      <div
        className={`flex items-center justify-between px-3.5 py-2 border-b border-[#161E30] transition-colors ${
          isTeam1Winner
            ? "bg-[#111728] text-white"
            : "bg-[#070912] text-slate-400"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {/* Team Initials Badge */}
          <div 
            className={`w-5 h-5 flex items-center justify-center font-display text-[9px] font-black shrink-0 ${
              isTeam1Winner ? "bg-primary-brand text-white" : "bg-[#141A29] text-slate-400"
            }`}
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
            }}
          >
            {getInitials(match.team1.name)}
          </div>
          <span className={`font-sans text-xs truncate ${isTeam1Winner ? "font-bold text-white" : "font-medium"}`}>
            {match.team1.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isTeam1Winner && isCompleted && (
            <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className={`font-mono text-xs px-1.5 py-0.2 rounded ${
            isTeam1Winner ? "font-bold text-white bg-primary-brand/20" : isLive ? "font-bold text-emerald-400 bg-emerald-950/40" : "font-normal text-slate-500"
          }`}>
            {isMatchPlayed ? match.team1.score : "-"}
          </span>
        </div>
      </div>

      {/* Team 2 Slot */}
      <div
        className={`flex items-center justify-between px-3.5 py-2 transition-colors ${
          isTeam2Winner
            ? "bg-[#111728] text-white"
            : "bg-[#070912] text-slate-400"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {/* Team Initials Badge */}
          <div 
            className={`w-5 h-5 flex items-center justify-center font-display text-[9px] font-black shrink-0 ${
              isTeam2Winner ? "bg-primary-brand text-white" : "bg-[#141A29] text-slate-400"
            }`}
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
            }}
          >
            {getInitials(match.team2.name)}
          </div>
          <span className={`font-sans text-xs truncate ${isTeam2Winner ? "font-bold text-white" : "font-medium"}`}>
            {match.team2.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isTeam2Winner && isCompleted && (
            <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
          <span className={`font-mono text-xs px-1.5 py-0.2 rounded ${
            isTeam2Winner ? "font-bold text-white bg-primary-brand/20" : isLive ? "font-bold text-emerald-400 bg-emerald-950/40" : "font-normal text-slate-500"
          }`}>
            {isMatchPlayed ? match.team2.score : "-"}
          </span>
        </div>
      </div>

      {/* Bottom Subtle Match Status Bar */}
      <div className="px-3 py-0.5 bg-[#05070E] border-t border-[#141A29] flex items-center justify-between text-[8px] font-mono text-slate-500 group-hover:text-primary-brand transition-colors">
        <span className={isLive ? "text-emerald-400 font-bold flex items-center gap-1" : ""}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
          {isLive ? "LIVE MATCH IN PROGRESS" : isCompleted ? "MATCH BOX SCORE" : "UPCOMING MATCH"}
        </span>
        <span>→</span>
      </div>
    </div>
  );
}
