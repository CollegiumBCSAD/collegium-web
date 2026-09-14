"use client";

import React from "react";
import { HomeMatchItem } from "./HomeMatchesHub";
import { FlameIcon } from "@/components/ui/Icons";

interface HomeFeaturedMatchProps {
  match: HomeMatchItem;
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

export default function HomeFeaturedMatch({
  match,
  onOpenBoxScore,
}: HomeFeaturedMatchProps) {
  const isLive = match.status === "LIVE";
  const isCompleted = match.status === "COMPLETED";

  const team1Score = match.team1.score ?? 0;
  const team2Score = match.team2.score ?? 0;
  const team1Won = match.team1.isWinner || (isCompleted && team1Score > team2Score);
  const team2Won = match.team2.isWinner || (isCompleted && team2Score > team1Score);

  return (
    <div
      onClick={() => onOpenBoxScore(match)}
      className="group relative overflow-hidden rounded-xl bg-[#0D1220] hover:bg-[#111728] border border-[#1F2942] hover:border-primary-brand/60 transition-all duration-200 cursor-pointer p-4 sm:p-5 shadow-xl"
    >
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#18233B] pb-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/40 text-rose-400 font-mono text-[10px] font-black uppercase tracking-wider animate-pulse">
              <FlameIcon className="w-3 h-3 text-rose-500" />
              <span>LIVE MATCH</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-primary-brand/15 border border-primary-brand/40 text-primary-brand font-mono text-[10px] font-black uppercase tracking-wider">
              FEATURED MATCH
            </span>
          )}
          <span className="font-mono text-xs font-bold text-slate-200 uppercase truncate">
            {match.tournamentTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 font-medium">
          <span className="text-slate-300">{match.stageName}</span>
          <span>•</span>
          <span>{match.timeLabel}</span>
        </div>
      </div>

      {/* Main Versus Arena */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Team 1 */}
        <div className="md:col-span-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#141B2D] border border-[#232F4A] flex items-center justify-center font-display font-black text-xs text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
            {match.team1.code || match.team1.name.slice(0, 3)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">
              {match.team1.code || "VARSITY"}
            </span>
            <span
              className={`font-display text-sm sm:text-base font-black uppercase truncate ${
                team1Won ? "text-white" : isCompleted ? "text-slate-400" : "text-slate-200"
              }`}
            >
              {match.team1.name}
            </span>
          </div>
        </div>

        {/* Center Scoreboard */}
        <div className="md:col-span-2 flex flex-col items-center justify-center py-1">
          <div className="flex items-center gap-2.5 px-3.5 py-1 rounded-lg bg-[#070A12] border border-[#1E2942]">
            <span
              className={`font-display text-xl sm:text-2xl font-black ${
                team1Won ? "text-emerald-400" : isCompleted ? "text-slate-400" : "text-white"
              }`}
            >
              {team1Score}
            </span>
            <span className="text-slate-600 font-black text-sm">:</span>
            <span
              className={`font-display text-xl sm:text-2xl font-black ${
                team2Won ? "text-emerald-400" : isCompleted ? "text-slate-400" : "text-white"
              }`}
            >
              {team2Score}
            </span>
          </div>
          <span className="mt-1 font-mono text-[8px] text-slate-400 uppercase tracking-widest font-bold">
            {isLive ? "LIVE" : isCompleted ? "FINAL" : "SCHEDULED"}
          </span>
        </div>

        {/* Team 2 */}
        <div className="md:col-span-5 flex items-center justify-end gap-3 text-right">
          <div className="flex flex-col min-w-0 items-end">
            <span className="text-[9px] font-mono text-slate-400 uppercase font-bold">
              {match.team2.code || "VARSITY"}
            </span>
            <span
              className={`font-display text-sm sm:text-base font-black uppercase truncate ${
                team2Won ? "text-white" : isCompleted ? "text-slate-400" : "text-slate-200"
              }`}
            >
              {match.team2.name}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#141B2D] border border-[#232F4A] flex items-center justify-center font-display font-black text-xs text-white shrink-0 shadow-md group-hover:scale-105 transition-transform">
            {match.team2.code || match.team2.name.slice(0, 3)}
          </div>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-[#18233B] flex items-center justify-between font-mono text-[11px] text-slate-400">
        <span className="text-slate-400">
          Official Collegiate Sanctioned Result
        </span>
        <span className="text-primary-brand font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
          <span>BOX SCORE</span>
          <span>→</span>
        </span>
      </div>
    </div>
  );
}
