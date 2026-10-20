"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { MatchBoxScoreModalProps, MatchPlayerStat } from "@/types";
import { ShieldIcon } from "@/components/ui/Icons";
import MatchScoreHero from "@/components/match/MatchScoreHero";
import MatchTeamCard from "@/components/match/MatchTeamCard";

const kda = (p: MatchPlayerStat) => (p.kills + p.assists) / Math.max(1, p.deaths);
const totalKills = (players: MatchPlayerStat[]) => players.reduce((sum, p) => sum + p.kills, 0);

export default function MatchBoxScoreModal({
  isOpen,
  onClose,
  title = "MATCH BOX SCORE",
  subtitle = "TOURNAMENT MATCH",
  matchInfo,
  canEditStats,
  onEditStats,
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
  const isPlayed = playerStats.length > 0;

  const team1Name = matchInfo?.team1Name || "TBD";
  const team2Name = matchInfo?.team2Name || "TBD";
  const isTeam1Winner = isPlayed && Boolean(matchInfo?.isTeam1Winner);
  const isTeam2Winner = isPlayed && Boolean(matchInfo?.isTeam2Winner);

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

  const maxKda = isPlayed ? Math.max(...playerStats.map(kda)) : 0;
  const shared = { isPlayed, isLive, maxKda };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/85 backdrop-blur-lg overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden border border-white/[0.08] bg-[#080B14] shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary-brand via-amber-500/60 to-primary-brand" />

        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="border border-primary-brand/30 bg-primary-brand/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-primary-brand">
                Box score
              </span>
              <span className="truncate font-mono text-[10px] uppercase tracking-widest text-slate-500">{subtitle}</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-black uppercase tracking-tight text-white sm:text-2xl">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 bg-white/[0.04] text-slate-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-8">
          <MatchScoreHero
            team1Name={team1Name}
            team2Name={team2Name}
            team1Kills={isPlayed ? totalKills(team1Players) : null}
            team2Kills={isPlayed ? totalKills(team2Players) : null}
            isTeam1Winner={isTeam1Winner}
            isTeam2Winner={isTeam2Winner}
            isLive={isLive}
          />

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <MatchTeamCard name={team1Name} isWinner={isTeam1Winner} players={team1Players} roster={matchInfo?.team1Roster} {...shared} />
            <MatchTeamCard name={team2Name} isWinner={isTeam2Winner} players={team2Players} roster={matchInfo?.team2Roster} {...shared} />
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-4 font-mono text-[10px] uppercase tracking-wider text-slate-500 sm:flex-row">
            <span className="flex items-center gap-2">
              <ShieldIcon className="h-3.5 w-3.5 text-primary-brand" />
              {isPlayed
                ? "Reported by tournament staff · peer-verified"
                : "Stats appear once the result is reported · tap a player to view their profile"}
            </span>
            <span className="flex items-center gap-3">
              {canEditStats && onEditStats && isPlayed && (
                <button
                  type="button"
                  onClick={onEditStats}
                  className="border border-amber-500/40 bg-amber-500/10 px-3 py-1 font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
                >
                  Edit match stats
                </button>
              )}
              {isPlayed && <span>KDA = (K + A) / D</span>}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
