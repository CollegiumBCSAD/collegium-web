"use client";

import React, { useState, useEffect } from "react";
import { TournamentMatch, GameId } from "@/types";
import { matchesService } from "@/services/matchesService";
import { FlameIcon, ShieldIcon } from "@/components/ui/Icons";

export interface HomeMatchItem extends TournamentMatch {
  tournamentTitle?: string;
  gameId?: GameId;
  stageName?: string;
  matchMode?: "TOURNAMENT" | "SCRIM";
  isForfeit?: boolean;
}

interface HomeMatchesHubProps {
  matches?: HomeMatchItem[];
  activeGame: GameId;
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

type StatusTabType = "ALL" | "LIVE" | "UPCOMING" | "RESULTS";

const gameTitleMap: Record<GameId, string> = {
  valo: "VALORANT",
  lol: "LOL",
  ml: "MLBB",
  codm: "CODM",
};

export default function HomeMatchesHub({
  matches: propMatches = [],
  activeGame,
  onOpenBoxScore,
}: HomeMatchesHubProps) {
  const [statusTab, setStatusTab] = useState<StatusTabType>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [matches, setMatches] = useState<HomeMatchItem[]>([]);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch matches from dedicated server-side matches API with pagination
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const apiStatus =
      statusTab === "RESULTS"
        ? "COMPLETED"
        : statusTab === "LIVE"
        ? "LIVE"
        : statusTab === "UPCOMING"
        ? "UPCOMING"
        : undefined;

    const gameEnum = gameTitleMap[activeGame] || undefined;

    matchesService
      // Home only ever shows tournament matches - scrims are practice
      // matches surfaced on the athlete's own /scrims page instead.
      .getMatches({
        page: currentPage,
        limit: pageSize,
        gameTitle: gameEnum,
        status: apiStatus as any,
        matchMode: "TOURNAMENT",
      })
      .then((res) => {
        if (!isMounted) return;
        if (res && res.matches && res.matches.length > 0) {
          setMatches(res.matches);
          setTotalMatches(res.total);
          setTotalPages(res.totalPages || Math.ceil(res.total / pageSize) || 1);
        } else {
          // Fallback to client-side filtering if API returned empty
          const filtered = propMatches.filter((m) => {
            if (m.gameId && m.gameId !== activeGame) return false;
            if (statusTab === "LIVE" && m.status !== "LIVE") return false;
            if (statusTab === "UPCOMING" && m.status !== "UPCOMING") return false;
            if (statusTab === "RESULTS" && m.status !== "COMPLETED") return false;
            if (m.matchMode && m.matchMode !== "TOURNAMENT") return false;
            return true;
          });
          const start = (currentPage - 1) * pageSize;
          setMatches(filtered.slice(start, start + pageSize));
          setTotalMatches(filtered.length);
          setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        const filtered = propMatches.filter((m) => {
          if (m.gameId && m.gameId !== activeGame) return false;
          if (statusTab === "LIVE" && m.status !== "LIVE") return false;
          if (statusTab === "UPCOMING" && m.status !== "UPCOMING") return false;
          if (statusTab === "RESULTS" && m.status !== "COMPLETED") return false;
          if (m.matchMode && m.matchMode !== "TOURNAMENT") return false;
          return true;
        });
        const start = (currentPage - 1) * pageSize;
        setMatches(filtered.slice(start, start + pageSize));
        setTotalMatches(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeGame, currentPage, statusTab, pageSize, propMatches]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusChange = (tab: StatusTabType) => {
    setStatusTab(tab);
    setCurrentPage(1);
  };

  return (
    <div className="w-full space-y-4">
      {/* Header with Title & Mode / Status Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#202C48]/50 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <h2 className="font-display text-base sm:text-lg font-black uppercase tracking-wider text-white">
              Matches & Schedule
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {totalMatches} Scheduled
            </span>
          </div>
          <p className="font-sans text-[11px] text-slate-400">
            Official collegiate championship brackets and verified tournament results.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Controls */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#070A12]/80 border border-[#1E2942]/80">
            {(["ALL", "LIVE", "UPCOMING", "RESULTS"] as StatusTabType[]).map((tab) => {
              const isSelected = statusTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleStatusChange(tab)}
                  className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-[#182238] text-white border border-[#2D3C60] shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-[#101626]"
                  }`}
                >
                  <span>{tab}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 animate-pulse bg-[#0A0D18] border border-[#182338] rounded-xl">
            Loading match schedule (10 per page)...
          </div>
        ) : matches.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#0B101E]/40 border border-dashed border-[#202E4C]/50 backdrop-blur-xs space-y-2">
            <ShieldIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider">
              No {statusTab !== "ALL" ? statusTab : ""} tournament matches found
            </p>
            <p className="font-sans text-[11px] text-slate-400 max-w-md mx-auto">
              Matches populate dynamically as university championship brackets progress.
            </p>
          </div>
        ) : (
          matches.map((match) => {
            const isLive = match.status === "LIVE";
            const isCompleted = match.status === "COMPLETED";
            const isUpcoming = match.status === "UPCOMING";
            const isScrim = match.matchMode === "SCRIM" || match.stageName?.includes("Scrim");

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
                  {/* Event, Mode & Stage */}
                  <div className="lg:w-48 shrink-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                          isScrim
                            ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/40"
                            : "bg-amber-950/80 text-amber-300 border-amber-500/40"
                        }`}
                      >
                        {isScrim ? "SCRIM" : "CIRCUIT"}
                      </span>
                      {match.isForfeit && (
                        <span className="text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                          FORFEIT
                        </span>
                      )}
                      <span className="font-mono text-[9px] font-bold text-slate-400 uppercase truncate">
                        {match.tournamentTitle || "VARSITY MATCH"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-300 truncate mt-1 font-semibold">
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

      {/* Numbered Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#182338]">
          <span className="text-[11px] font-mono text-slate-400">
            Showing page <strong className="text-white">{currentPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong> ({totalMatches} matches)
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 px-3 rounded bg-[#0D1220] hover:bg-[#182238] border border-[#1E2942] text-slate-300 hover:text-white disabled:opacity-40 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              // Only render adjacent pages if there are many
              if (totalPages > 7 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
                if (p === 2 || p === totalPages - 1) {
                  return (
                    <span key={p} className="px-1 text-slate-600 font-mono text-xs">
                      ...
                    </span>
                  );
                }
                return null;
              }

              const isCurrent = p === currentPage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`h-8 w-8 rounded font-mono text-xs font-bold transition-colors cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? "bg-primary-brand text-white font-black shadow-xs"
                      : "bg-[#0D1220] hover:bg-[#182238] border border-[#1E2942] text-slate-300 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 px-3 rounded bg-[#0D1220] hover:bg-[#182238] border border-[#1E2942] text-slate-300 hover:text-white disabled:opacity-40 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
