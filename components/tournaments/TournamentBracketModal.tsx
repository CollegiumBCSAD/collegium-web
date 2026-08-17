"use client";

import { useEffect, useState } from "react";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import MatchCard from "@/components/tournaments/MatchCard";
import { BracketMatch, BracketRound, TournamentBracketModalProps } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";

const defaultRounds: BracketRound[] = [
  {
    name: "QUARTERFINALS",
    matches: [
      { id: "qf1", team1: { name: "UMak", code: "UMK", score: 1, isWinner: true }, team2: { name: "FEU Tamaraws", code: "FEU", score: 0 }, status: "COMPLETED" },
      { id: "qf2", team1: { name: "Ateneo Eagles", code: "ADMU", score: 1, isWinner: true }, team2: { name: "Mapúa Marauders", code: "MU", score: 0 }, status: "COMPLETED" },
      { id: "qf3", team1: { name: "UP Fighting", code: "UP", score: 1, isWinner: true }, team2: { name: "Polytechnic", code: "PUP", score: 0 }, status: "COMPLETED" },
      { id: "qf4", team1: { name: "UST Growlers", code: "UST", score: 1, isWinner: true }, team2: { name: "Adamson Falcons", code: "AdU", score: 0 }, status: "COMPLETED" },
    ],
  },
  {
    name: "SEMIFINALS",
    matches: [
      { id: "sf1", team1: { name: "UMak", code: "UMK", score: 1, isWinner: true }, team2: { name: "Mapúa Marauders", code: "MU", score: 0 }, status: "COMPLETED" },
      { id: "sf2", team1: { name: "UP Fighting", code: "UP", score: 1, isWinner: true }, team2: { name: "Adamson Falcons", code: "AdU", score: 0 }, status: "COMPLETED" },
    ],
  },
  {
    name: "GRAND FINALS",
    matches: [
      { id: "gf1", team1: { name: "UMak", code: "UMK", score: 1, isWinner: true }, team2: { name: "UP Fighting", code: "UP", score: 0 }, status: "COMPLETED" },
    ],
  },
];

export default function TournamentBracketModal({
  isOpen,
  onClose,
  tournamentId,
  title = "TOURNAMENT BRACKET",
  subtitle = "SINGLE ELIMINATION • 8 TEAMS",
}: TournamentBracketModalProps) {
  const [activeBoxScore, setActiveBoxScore] = useState<BracketMatch | null>(null);
  const [dynamicRounds, setDynamicRounds] = useState<BracketRound[]>([]);

  useEffect(() => {
    if (!isOpen || !tournamentId) return;
    let isMounted = true;
    tournamentsService
      .getBracket(tournamentId)
      .then((rounds) => {
        if (isMounted && Array.isArray(rounds) && rounds.length > 0) {
          setDynamicRounds(rounds);
        }
      })
      .catch(() => {
        // Fallback to default static rounds on API error
      });
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

  const displayRounds = dynamicRounds.length > 0 ? dynamicRounds : defaultRounds;

  const normalizedRounds = displayRounds.map((round, rIdx) => ({
    name:
      round.name ||
      (rIdx === displayRounds.length - 1
        ? "GRAND FINALS"
        : rIdx === displayRounds.length - 2
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

  const totalCols = normalizedRounds.length + 1;

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

          <div className="flex-1 overflow-x-auto p-6 sm:p-8">
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
