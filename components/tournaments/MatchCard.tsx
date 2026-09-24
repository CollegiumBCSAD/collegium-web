"use client";

import { MatchCardProps } from "@/types";
import { CrownIcon } from "@/components/ui/Icons";

export default function MatchCard({ match, onViewBoxScore, isFeatured }: MatchCardProps) {
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
      className={`w-72 sm:w-80 md:w-84 min-h-[104px] bg-[#0A0D18] border shadow-2xl transition-all duration-200 cursor-pointer overflow-hidden group relative flex flex-col justify-between hover:-translate-y-0.5 ${
        isFeatured
          ? "border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.25)]"
          : isLive
            ? "border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            : "border-[#1E293B] hover:border-primary-brand/70 hover:shadow-[0_0_20px_rgba(229,58,76,0.18)]"
      }`}
      style={{
        clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
      }}
    >
      {isFeatured && (
        <span className="absolute top-1 right-2.5 z-10 text-[9px] font-mono font-black uppercase tracking-widest text-rose-200 bg-rose-950/90 px-2 py-0.5 border border-rose-500/50 shadow-sm">
          On Stream
        </span>
      )}

      {/* Top Accent Highlight */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${
        isFeatured
          ? "bg-gradient-to-r from-rose-500 via-rose-400 to-transparent"
          : isLive
            ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent"
            : "bg-gradient-to-r from-primary-brand via-amber-400/60 to-transparent"
      }`} />

      {/* Team 1 Slot */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 border-b border-[#161E30] transition-colors ${
          isTeam1Winner
            ? "bg-[#12182B] text-white"
            : "bg-[#080B14] text-slate-300 hover:bg-[#0E1322]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {/* Team Initials Badge */}
          <div 
            className={`w-6 h-6 flex items-center justify-center font-display text-[10px] font-black shrink-0 shadow-sm ${
              isTeam1Winner ? "bg-primary-brand text-white" : "bg-[#161E32] text-slate-300 border border-[#222E4A]"
            }`}
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
            }}
          >
            {getInitials(match.team1.name)}
          </div>
          <span className={`font-display text-sm tracking-wide uppercase truncate ${isTeam1Winner ? "font-black text-white" : "font-bold text-slate-200"}`}>
            {match.team1.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isTeam1Winner && isCompleted && (
            <CrownIcon className="w-4 h-4 text-amber-400 shrink-0 drop-shadow-sm" />
          )}
          <span className={`font-mono text-xs sm:text-sm font-black px-2 py-0.5 rounded min-w-[24px] text-center ${
            isTeam1Winner
              ? "text-white bg-primary-brand/30 border border-primary-brand/50 shadow-sm"
              : isLive
                ? "text-emerald-300 bg-emerald-950/60 border border-emerald-500/40"
                : "text-slate-400 bg-[#121726]"
          }`}>
            {isMatchPlayed ? match.team1.score : "-"}
          </span>
        </div>
      </div>

      {/* Team 2 Slot */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 transition-colors ${
          isTeam2Winner
            ? "bg-[#12182B] text-white"
            : "bg-[#080B14] text-slate-300 hover:bg-[#0E1322]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {/* Team Initials Badge */}
          <div 
            className={`w-6 h-6 flex items-center justify-center font-display text-[10px] font-black shrink-0 shadow-sm ${
              isTeam2Winner ? "bg-primary-brand text-white" : "bg-[#161E32] text-slate-300 border border-[#222E4A]"
            }`}
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
            }}
          >
            {getInitials(match.team2.name)}
          </div>
          <span className={`font-display text-sm tracking-wide uppercase truncate ${isTeam2Winner ? "font-black text-white" : "font-bold text-slate-200"}`}>
            {match.team2.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isTeam2Winner && isCompleted && (
            <CrownIcon className="w-4 h-4 text-amber-400 shrink-0 drop-shadow-sm" />
          )}
          <span className={`font-mono text-xs sm:text-sm font-black px-2 py-0.5 rounded min-w-[24px] text-center ${
            isTeam2Winner
              ? "text-white bg-primary-brand/30 border border-primary-brand/50 shadow-sm"
              : isLive
                ? "text-emerald-300 bg-emerald-950/60 border border-emerald-500/40"
                : "text-slate-400 bg-[#121726]"
          }`}>
            {isMatchPlayed ? match.team2.score : "-"}
          </span>
        </div>
      </div>

      {/* Match Status Footer */}
      <div className="px-3.5 py-1.5 bg-[#05070E] border-t border-[#141A29] flex items-center justify-between text-[9px] font-mono text-slate-400 group-hover:text-primary-brand transition-colors">
        <span className={`flex items-center gap-1.5 ${isLive ? "text-emerald-400 font-bold" : ""}`}>
          {isLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
          {isLive ? "LIVE MATCH IN PROGRESS" : isCompleted ? "MATCH FINAL • BOX SCORE" : "UPCOMING MATCH"}
        </span>
        <span className="font-bold flex items-center gap-1">
          <span>VIEW SCORE</span>
          <span>→</span>
        </span>
      </div>
    </div>
  );
}

