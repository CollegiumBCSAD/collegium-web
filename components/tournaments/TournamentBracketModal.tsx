"use client";

import { useEffect, useState } from "react";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import MatchCard from "@/components/tournaments/MatchCard";
import { BracketMatch, BracketRound, TournamentBracketModalProps } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { SwordsIcon } from "@/components/ui/Icons";

export default function TournamentBracketModal({
  isOpen,
  onClose,
  tournamentId,
  title = "TOURNAMENT BRACKET",
  subtitle = "SINGLE ELIMINATION",
}: TournamentBracketModalProps) {
  const [activeBoxScore, setActiveBoxScore] = useState<BracketMatch | null>(null);
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadBracketData() {
      if (!tournamentId) {
        if (isMounted) {
          setRounds([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await tournamentsService.getBracket(tournamentId);
        if (isMounted) {
          setRounds(data || []);
        }
      } catch {
        if (isMounted) {
          setRounds([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadBracketData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, tournamentId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activeBoxScore) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, activeBoxScore]);

  if (!isOpen) return null;

  const normalizedRounds = rounds.map((round, rIdx) => ({
    name:
      round.name ||
      (rIdx === rounds.length - 1
        ? "GRAND FINALS"
        : rIdx === rounds.length - 2
        ? "SEMIFINALS"
        : `ROUND ${rIdx + 1}`),
    matches: round.matches.map((m) => ({
      id: m.id,
      team1: {
        name: m.team1.name || "TBD",
        score: m.team1.score ?? 0,
        isWinner: m.team1.isWinner,
      },
      team2: {
        name: m.team2.name || "TBD",
        score: m.team2.score ?? 0,
        isWinner: m.team2.isWinner,
      },
    })),
  }));

  const lastMatch = normalizedRounds[normalizedRounds.length - 1]?.matches[0];
  const champion = lastMatch
    ? lastMatch.team1.isWinner
      ? lastMatch.team1.name
      : lastMatch.team2.isWinner
      ? lastMatch.team2.name
      : lastMatch.team1.score > lastMatch.team2.score
      ? lastMatch.team1.name
      : lastMatch.team1.name
    : "TBD";

  const totalCols = normalizedRounds.length > 0 ? normalizedRounds.length + 1 : 1;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md">
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-panel-border bg-modal-bg shadow-2xl overflow-hidden z-10">
          <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-panel-border">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-normal text-foreground uppercase">
                {title}
              </h2>
              <p className="font-sans text-xs font-semibold tracking-wider text-secondary-text uppercase mt-1">
                {subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Modal"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-card-bg text-foreground transition-colors hover:text-foreground hover:bg-raised-panel cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-x-auto p-6 sm:p-8 flex flex-col justify-center min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-10 h-10 border-4 border-primary-brand border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-xs font-semibold text-secondary-text tracking-wider uppercase">
                  Loading Tournament Bracket...
                </p>
              </div>
            ) : normalizedRounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto space-y-4 rounded-xl border border-panel-border bg-card-bg/60 p-8 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-[#141A29] border border-[#232D44] flex items-center justify-center shadow-inner">
                  <SwordsIcon className="w-8 h-8 text-primary-brand" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
                    NO BRACKET GENERATED YET
                  </h3>
                  <p className="font-sans text-xs text-secondary-text leading-relaxed">
                    Tournament pairings have not been released yet. Brackets will appear here dynamically once registration closes and match seeds are generated.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-block font-sans text-[11px] font-bold tracking-widest text-primary-brand bg-primary-brand/10 border border-primary-brand/30 px-3 py-1 rounded-full uppercase">
                    REGISTRATION OPEN
                  </span>
                </div>
              </div>
            ) : (
              <div className="min-w-[960px] mx-auto">
                <div
                  className="grid gap-8 mb-6 text-xs sm:text-sm font-bold tracking-wide text-foreground uppercase text-left pl-1"
                  style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
                >
                  {normalizedRounds.map((r, i) => (
                    <div key={i}>{r.name}</div>
                  ))}
                  <div>CHAMPION</div>
                </div>

                <div
                  className="grid gap-8 items-center relative min-h-[480px]"
                  style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
                >
                  {normalizedRounds.map((round, rIdx) => (
                    <div key={rIdx} className="flex flex-col justify-around h-full gap-4 py-2 z-10">
                      {round.matches.map((m) => (
                        <MatchCard key={m.id} match={m} onViewBoxScore={() => setActiveBoxScore(m)} />
                      ))}
                    </div>
                  ))}

                  <div className="flex items-center justify-start z-10">
                    <div className="flex items-center gap-2.5 rounded-lg border-2 border-secondary-brand bg-card-bg px-4 py-3 shadow-xl">
                      <span className="text-base">👑</span>
                      <span className="font-sans text-xs sm:text-sm font-bold text-foreground">
                        {champion}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MatchBoxScoreModal
        isOpen={!!activeBoxScore}
        onClose={() => setActiveBoxScore(null)}
        title="MATCH BOX SCORE"
        subtitle={`${activeBoxScore?.team1.name} vs ${activeBoxScore?.team2.name} • TOURNAMENT MATCH`}
      />
    </>
  );
}
