"use client";

import React, { useState } from "react";
import { TournamentMatch, GameId } from "@/types";
import { FlameIcon } from "@/components/ui/Icons";

export interface HomeMatchItem extends TournamentMatch {
  tournamentTitle?: string;
  gameId?: GameId;
  stageName?: string;
}

interface HomeMatchesHubProps {
  matches: HomeMatchItem[];
  activeGame: GameId;
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

type TabType = "ALL" | "LIVE" | "UPCOMING" | "RESULTS";

export default function HomeMatchesHub({
  matches,
  activeGame,
  onOpenBoxScore,
}: HomeMatchesHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ALL");

  const filteredMatches = matches.filter((m) => {
    if (m.gameId && m.gameId !== activeGame) return false;
    if (activeTab === "LIVE") return m.status === "LIVE";
    if (activeTab === "UPCOMING") return m.status === "UPCOMING";
    if (activeTab === "RESULTS") return m.status === "COMPLETED";
    return true;
  });

  const liveCount = matches.filter(
    (m) => m.status === "LIVE" && (!m.gameId || m.gameId === activeGame)
  ).length;

  return (
    <div className="w-full space-y-3.5">
      {/* Header with Title & Solid High-Contrast Segmented Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202C48]/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
            Matches & Schedule
          </h2>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#070A12]/80 backdrop-blur-xs border border-[#1E2942]/80">
          {(["ALL", "LIVE", "UPCOMING", "RESULTS"] as TabType[]).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#182238] text-white border border-[#2D3C60] shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-[#101626]"
                }`}
              >
                <span>{tab}</span>
                {tab === "LIVE" && liveCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                    {liveCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-2">
        {filteredMatches.length === 0 ? (
          <div className="p-8 sm:p-10 text-center rounded-2xl bg-gradient-to-b from-[#0B101E]/40 via-[#0B101E]/20 to-transparent border border-dashed border-[#202E4C]/50 backdrop-blur-xs space-y-2">
            <p className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
              No {activeTab !== "ALL" ? activeTab : ""} matches recorded for this circuit
            </p>
            <p className="font-sans text-[11px] text-slate-400 max-w-md mx-auto">
              Matches populate dynamically as university championship brackets progress. Select another arena title to explore active circuits.
            </p>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isLive = match.status === "LIVE";
            const isCompleted = match.status === "COMPLETED";
            const isUpcoming = match.status === "UPCOMING";

            const team1Score = match.team1.score ?? 0;
            const team2Score = match.team2.score ?? 0;
            const team1Won = match.team1.isWinner || (isCompleted && team1Score > team2Score);
            const team2Won = match.team2.isWinner || (isCompleted && team2Score > team1Score);

            return (
              <div
                key={match.id}
                onClick={() => onOpenBoxScore(match)}
                className="group relative overflow-hidden rounded-xl bg-[#0D1220] hover:bg-[#121828] border border-[#18233B] hover:border-primary-brand/50 transition-all duration-150 cursor-pointer p-3 sm:p-3.5 shadow-md"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Event & Stage */}
                  <div className="lg:w-44 shrink-0 flex flex-col justify-center">
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase truncate">
                      {match.tournamentTitle || "VARSITY CIRCUIT"}
                    </span>
                    <span className="font-mono text-[10px] text-slate-300 truncate mt-0.5 font-semibold">
                      {match.stageName || "PLAYOFFS"} • {match.timeLabel || (isLive ? "LIVE" : isCompleted ? "FINAL" : "UPCOMING")}
                    </span>
                  </div>

                  {/* Middle: Teams vs Teams with Scores */}
                  <div className="flex items-center justify-between gap-3 flex-1 bg-[#070A12] rounded-lg border border-[#18233B] px-3.5 py-1.5">
                    {/* Team 1 */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded bg-[#141B2D] border border-[#232F4A] flex items-center justify-center font-sans font-black text-[11px] text-white shrink-0">
                        {match.team1.code || match.team1.name.slice(0, 3)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span
                          className={`font-sans text-xs sm:text-sm font-bold tracking-wide uppercase truncate transition-colors ${
                            team1Won ? "text-white" : isCompleted ? "text-slate-400" : "text-slate-200"
                          }`}
                        >
                          {match.team1.name}
                        </span>
                        {match.team1.code && (
                          <span className="font-mono text-[9px] text-slate-500 uppercase">
                            {match.team1.code}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scores Pill */}
                    <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#0D1220] border border-[#1E2942] shrink-0">
                      <span
                        className={`font-display text-sm sm:text-base font-black ${
                          team1Won ? "text-emerald-400" : isCompleted ? "text-slate-400" : "text-white"
                        }`}
                      >
                        {isUpcoming ? "-" : team1Score}
                      </span>
                      <span className="text-slate-600 font-bold text-xs">:</span>
                      <span
                        className={`font-display text-sm sm:text-base font-black ${
                          team2Won ? "text-emerald-400" : isCompleted ? "text-slate-400" : "text-white"
                        }`}
                      >
                        {isUpcoming ? "-" : team2Score}
                      </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
                      <div className="flex flex-col min-w-0 items-end">
                        <span
                          className={`font-sans text-xs sm:text-sm font-bold tracking-wide uppercase truncate transition-colors ${
                            team2Won ? "text-white" : isCompleted ? "text-slate-400" : "text-slate-200"
                          }`}
                        >
                          {match.team2.name}
                        </span>
                        {match.team2.code && (
                          <span className="font-mono text-[9px] text-slate-500 uppercase">
                            {match.team2.code}
                          </span>
                        )}
                      </div>
                      <div className="w-7 h-7 rounded bg-[#141B2D] border border-[#232F4A] flex items-center justify-center font-sans font-black text-[11px] text-white shrink-0">
                        {match.team2.code || match.team2.name.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  {/* Status Pill & Action */}
                  <div className="lg:w-28 shrink-0 flex items-center justify-end">
                    {isLive && (
                      <span className="px-2.5 py-1 rounded bg-rose-500/15 border border-rose-500/40 text-rose-400 font-mono text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                        <FlameIcon className="w-3 h-3 text-rose-500" />
                        <span>LIVE</span>
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider">
                        UPCOMING
                      </span>
                    )}

                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded bg-[#141B2D] text-slate-300 border border-[#232F4A] font-mono text-[10px] font-bold uppercase tracking-wider group-hover:text-white group-hover:bg-[#1E293B] transition-all">
                        BOX SCORE →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
