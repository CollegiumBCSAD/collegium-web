"use client";

import { BracketMatchCardProps, BracketTeamRowProps } from "@/types";
import { isUnknownTeam, teamInitials } from "@/lib/bracket";

function TeamRow({ team, decided, won }: BracketTeamRowProps) {
  const unknown = isUnknownTeam(team.name);
  return (
    <div
      className={`relative flex items-center gap-2 h-9 pl-2.5 pr-1.5 transition-colors ${
        won ? "bg-gradient-to-r from-primary-brand/20 to-transparent" : ""
      }`}
    >
      {won && <span aria-hidden className="absolute left-0 inset-y-0 w-0.5 bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" />}
      <span
        className={`w-8 h-6 shrink-0 flex items-center justify-center font-display text-[9px] font-black tracking-tight ${
          won
            ? "bg-primary-brand text-[var(--game-btn-text,#fff)]"
            : unknown
              ? "border border-dashed border-white/15 text-slate-600"
              : "bg-white/[0.06] border border-white/10 text-slate-300"
        }`}
      >
        {teamInitials(team.name)}
      </span>
      <span
        className={`flex-1 min-w-0 truncate font-display text-[12.5px] uppercase tracking-wide ${
          unknown ? "italic font-bold text-slate-600 normal-case" : won ? "font-black text-white" : decided ? "font-bold text-slate-500" : "font-bold text-slate-200"
        }`}
      >
        {team.name}
      </span>
      <span
        className={`w-6 h-6 shrink-0 flex items-center justify-center font-mono text-[10px] font-black ${
          won ? "bg-primary-brand/25 text-white" : decided ? "text-slate-600" : "text-slate-600"
        }`}
      >
        {decided ? (won ? "W" : "L") : "–"}
      </span>
    </div>
  );
}

export default function BracketMatchCard({ match, label, isPlaceholder, isFeatured, canReport, onOpen, onReport }: BracketMatchCardProps) {
  const decided = match.status === "COMPLETED";
  const live = match.status === "LIVE";
  const isBye = match.team2.name === "BYE";

  const status = isFeatured
    ? { text: "On stream", className: "text-rose-300" }
    : isBye
      ? { text: "Bye", className: "text-slate-500" }
      : decided
        ? { text: "Final", className: "text-slate-400" }
        : live
          ? { text: "Live", className: "text-emerald-400" }
          : { text: match.timeLabel || "Upcoming", className: "text-slate-600" };

  return (
    <div className={`w-64 ${isPlaceholder ? "opacity-60" : ""}`}>
      <button
        type="button"
        onClick={onOpen}
        disabled={isPlaceholder}
        className={`group block w-full text-left overflow-hidden transition-all duration-200 ${
          isPlaceholder
            ? "border border-dashed border-white/10 bg-black/20 cursor-default"
            : `bg-gradient-to-b from-[#141A2A] to-[#0B0E17] border shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_30px_-16px_rgba(0,0,0,0.9)] hover:-translate-y-0.5 hover:border-primary-brand/60 ${
                live || isFeatured
                  ? "border-primary-brand/45 shadow-[0_0_24px_-8px_rgba(var(--game-glow-rgb),0.55)]"
                  : "border-white/[0.08]"
              }`
        }`}
      >
        <div className="flex items-center justify-between h-6 px-2.5 border-b border-white/[0.06] bg-black/25 text-[9px] font-mono font-bold uppercase tracking-widest">
          <span className="text-slate-500">{label}</span>
          <span className={`flex items-center gap-1.5 ${status.className}`}>
            {(live || isFeatured) && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
            {status.text}
          </span>
        </div>
        <TeamRow team={match.team1} decided={decided} won={decided && Boolean(match.team1.isWinner)} />
        <div className="h-px bg-white/[0.05]" />
        <TeamRow team={match.team2} decided={decided} won={decided && Boolean(match.team2.isWinner)} />
      </button>

      {canReport && !isPlaceholder && !decided && !isBye && (
        <button
          type="button"
          onClick={onReport}
          className="w-full h-7 flex items-center justify-center gap-1.5 border-x border-b border-primary-brand/30 bg-primary-brand/10 text-[10px] font-mono font-black uppercase tracking-widest text-primary-brand hover:bg-primary-brand hover:text-[var(--game-btn-text,#fff)] transition-colors"
        >
          Report result →
        </button>
      )}
    </div>
  );
}
