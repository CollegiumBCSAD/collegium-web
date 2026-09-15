"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MatchBoxScoreModalProps, MatchPlayerStat } from "@/types";
import { CrownIcon, SwordsIcon, ShieldIcon } from "@/components/ui/Icons";

function kda(p: MatchPlayerStat): number {
  return (p.kills + p.assists) / Math.max(1, p.deaths);
}

function totalKills(players: MatchPlayerStat[]): number {
  return players.reduce((sum, p) => sum + p.kills, 0);
}

export default function MatchBoxScoreModal({
  isOpen,
  onClose,
  title = "MATCH BOX SCORE",
  subtitle = "TOURNAMENT MATCH",
  matchInfo,
}: MatchBoxScoreModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLive = matchInfo?.status === "LIVE";
  const playerStats = matchInfo?.playerStats || [];
  const isMatchPlayed = playerStats.length > 0;

  const team1Name = matchInfo?.team1Name || "TBD";
  const team2Name = matchInfo?.team2Name || "TBD";
  const isTeam1Winner = isMatchPlayed && Boolean(matchInfo?.isTeam1Winner);
  const isTeam2Winner = isMatchPlayed && Boolean(matchInfo?.isTeam2Winner);

  // Prefer splitting on universityId, but fall back to each row's own `win`
  // flag: PlayerStat.universityId is nullable server-side, and some callers
  // don't know the university ids at all.
  const canSplitById =
    Boolean(matchInfo?.team1UniversityId) &&
    Boolean(matchInfo?.team2UniversityId) &&
    playerStats.some((p) => p.universityId);

  const team1Players = canSplitById
    ? playerStats.filter((p) => p.universityId === matchInfo?.team1UniversityId)
    : playerStats.filter((p) => p.win === isTeam1Winner);
  const team2Players = canSplitById
    ? playerStats.filter((p) => p.universityId === matchInfo?.team2UniversityId)
    : playerStats.filter((p) => p.win !== isTeam1Winner);

  const maxKda = isMatchPlayed ? Math.max(...playerStats.map(kda)) : 0;

  const resultLabel = (isWinner: boolean) =>
    !isMatchPlayed ? (isLive ? "LIVE IN PROGRESS" : "STARTING SQUAD") : isWinner ? "VICTORY" : "DEFEAT";

  const renderRosterPreview = (roster?: { displayName?: string; gameHandle?: string }[]) => (
    <div className="py-4 text-center space-y-1.5">
      {roster && roster.length > 0 ? (
        roster.map((m, idx) => (
          <div key={idx} className="font-sans text-xs text-slate-300">
            {m.displayName || m.gameHandle || `Player ${idx + 1}`}
          </div>
        ))
      ) : (
        <p className="font-sans text-xs text-slate-500">
          {isLive
            ? "Match in progress — stats will appear once results are reported."
            : "Stats not yet reported — this match hasn't been closed by tournament staff yet."}
        </p>
      )}
    </div>
  );

  const renderStatsTable = (players: MatchPlayerStat[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left font-sans text-xs">
        <thead>
          <tr className="border-b border-[#182338] text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
            <th className="pb-2 pl-1">ATHLETE</th>
            <th className="pb-2 text-center">K</th>
            <th className="pb-2 text-center">D</th>
            <th className="pb-2 text-center">A</th>
            <th className="pb-2 text-center pr-1">KDA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#121828]">
          {players.map((p, idx) => {
            const playerKda = kda(p);
            const isMvp = playerKda === maxKda;
            return (
              <tr key={`${p.name}-${idx}`} className="hover:bg-[#101626] transition-colors">
                <td className="py-2.5 pl-1 font-sans text-xs font-bold flex items-center gap-2">
                  {isMvp && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  <span className={isMvp ? "text-amber-400 font-extrabold" : "text-white"}>{p.name}</span>
                  {p.displayName && p.displayName !== p.name && (
                    <span className="text-[10px] font-mono text-slate-500 truncate">{p.displayName}</span>
                  )}
                </td>
                <td className="py-2.5 text-center font-mono font-bold text-white">{p.kills}</td>
                <td className="py-2.5 text-center font-mono text-slate-400">{p.deaths}</td>
                <td className="py-2.5 text-center font-mono text-slate-400">{p.assists}</td>
                <td className="py-2.5 text-center font-mono font-bold text-emerald-400 pr-1">
                  {playerKda.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderTeamPanel = (
    name: string,
    isWinner: boolean,
    players: MatchPlayerStat[],
    roster?: { displayName?: string; gameHandle?: string }[]
  ) => (
    <div className="bg-[#0A0D18] border border-[#1E293B] p-5 shadow-2xl rounded-2xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#182338]">
        <h3 className="font-display text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              !isMatchPlayed ? "bg-cyan-400" : isWinner ? "bg-emerald-400" : "bg-rose-400"
            }`}
          />
          <span>{name}</span>
        </h3>
        <span
          className={`font-mono text-[9px] font-bold uppercase tracking-widest ${
            !isMatchPlayed ? "text-cyan-400" : isWinner ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          {!isMatchPlayed
            ? isLive
              ? "ACTIVE ROSTER"
              : "STARTING LINEUP"
            : isWinner
            ? "VICTOR SQUAD"
            : "DEFEATED SQUAD"}
        </span>
      </div>
      {isMatchPlayed ? renderStatsTable(players) : renderRosterPreview(roster)}
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-lg overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[94vh] flex flex-col bg-[#080B14] border border-[#1E293B] shadow-2xl overflow-hidden z-10 rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-brand via-amber-500/60 to-primary-brand" />

        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#182338] bg-[#0A0D18]/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold tracking-widest text-primary-brand uppercase px-2.5 py-0.5 bg-primary-brand/10 border border-primary-brand/30 rounded">
                TACTICAL COMBAT LOG
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{subtitle}</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="flex h-9 w-9 items-center justify-center bg-[#141A29] border border-[#232D44] text-slate-300 hover:text-white hover:bg-[#1E273D] transition-colors cursor-pointer rounded-xl"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-gradient-to-b from-[#080B14] via-[#0A0D18] to-[#05070E]">
          {/* Match Result Banner — team kill totals, the only aggregate the
              reported stat lines actually support. */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
            {[
              { name: team1Name, players: team1Players, isWinner: isTeam1Winner },
              { name: team2Name, players: team2Players, isWinner: isTeam2Winner },
            ].map((team, idx) => (
              <div key={idx} className="contents">
                {idx === 1 && (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <div className="w-12 h-12 bg-[#141A29] border border-[#232D44] flex items-center justify-center shadow-lg rounded-2xl">
                      <SwordsIcon className="w-5 h-5 text-primary-brand" />
                    </div>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {isLive ? "LIVE MATCH" : "TOURNAMENT MATCH"}
                    </span>
                  </div>
                )}
                <div
                  className={`w-full sm:w-64 p-5 bg-gradient-to-b from-[#101826] via-[#0A0D18] to-[#070912] border-2 shadow-2xl flex flex-col items-center text-center space-y-2 relative rounded-2xl ${
                    team.isWinner ? "border-emerald-500/70" : "border-[#1E293B]"
                  }`}
                >
                  {team.isWinner && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent" />
                  )}
                  <span className="font-display text-sm sm:text-base font-black uppercase text-white tracking-wide truncate max-w-[200px]">
                    {team.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {team.isWinner && <CrownIcon className="w-5 h-5 text-amber-400" />}
                    <span
                      className={`font-display text-4xl sm:text-5xl font-black drop-shadow ${
                        team.isWinner ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {isMatchPlayed ? totalKills(team.players) : "-"}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    {isMatchPlayed ? "Total Kills" : "Not Reported"}
                  </span>
                  <span
                    className={`px-3 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest border rounded-full ${
                      !isMatchPlayed
                        ? isLive
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-[#141A29] text-slate-400 border-slate-700"
                        : team.isWinner
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-[#141A29] text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {resultLabel(team.isWinner)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Team Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderTeamPanel(team1Name, isTeam1Winner, team1Players, matchInfo?.team1Roster)}
            {renderTeamPanel(team2Name, isTeam2Winner, team2Players, matchInfo?.team2Roster)}
          </div>

          <div className="pt-4 border-t border-[#182338] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
              <span>
                {isMatchPlayed
                  ? "REPORTED BY TOURNAMENT STAFF • PEER-VERIFIED COMBAT LOG"
                  : "MATCH TELEMETRY PENDING • STATS WILL POPULATE ONCE THE RESULT IS REPORTED"}
              </span>
            </div>
            <span>KDA = (KILLS + ASSISTS) / DEATHS</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
