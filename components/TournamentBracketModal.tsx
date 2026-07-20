"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MatchTeam {
  name: string;
  score: number;
  isWinner?: boolean;
}

interface BracketMatch {
  id: string;
  team1: MatchTeam;
  team2: MatchTeam;
}

interface TournamentBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export default function TournamentBracketModal({
  isOpen,
  onClose,
  title = "TOURNAMENT BRACKET",
  subtitle = "SINGLE ELIMINATION • 8 TEAMS",
}: TournamentBracketModalProps) {
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

  const qfMatches: BracketMatch[] = [
    {
      id: "qf1",
      team1: { name: "UMak", score: 1, isWinner: true },
      team2: { name: "FEU Tamaraws", score: 0 },
    },
    {
      id: "qf2",
      team1: { name: "Ateneo Eagles", score: 1, isWinner: true },
      team2: { name: "Mapúa Marauders", score: 0 },
    },
    {
      id: "qf3",
      team1: { name: "UP Fighting", score: 1, isWinner: true },
      team2: { name: "Polytechnic", score: 0 },
    },
    {
      id: "qf4",
      team1: { name: "UST Growlers", score: 1, isWinner: true },
      team2: { name: "Adamson Falcons", score: 0 },
    },
  ];

  const sfMatches: BracketMatch[] = [
    {
      id: "sf1",
      team1: { name: "UMak", score: 1, isWinner: true },
      team2: { name: "Mapúa Marauders", score: 0 },
    },
    {
      id: "sf2",
      team1: { name: "UP Fighting", score: 1, isWinner: true },
      team2: { name: "Adamson Falcons", score: 0 },
    },
  ];

  const gfMatch: BracketMatch = {
    id: "gf1",
    team1: { name: "UMak", score: 1, isWinner: true },
    team2: { name: "UP Fighting", score: 0 },
  };

  const champion = "University Of Makati";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-[#272B3A] bg-[#0C0F17] shadow-2xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#222636]">
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#272B3A] bg-[#141824] text-secondary-text transition-colors hover:text-foreground hover:bg-[#1C2234]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-6 sm:p-8">
          <div className="min-w-[960px] mx-auto">
            <div className="grid grid-cols-4 gap-8 mb-6 text-xs sm:text-sm font-bold tracking-wide text-foreground uppercase text-left pl-1">
              <div>QUARTERFINALS</div>
              <div>SEMIFINALS</div>
              <div>GRAND FINALS</div>
              <div>CHAMPION</div>
            </div>

            <div className="grid grid-cols-4 gap-8 items-center relative min-h-[480px]">
              <div className="flex flex-col justify-between h-full gap-4 py-2 z-10">
                {qfMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>

              <div className="flex flex-col justify-around h-full py-10 z-10">
                {sfMatches.map((m) => (
                  <MatchCard key={m.id} match={m} />
                ))}
              </div>

              <div className="flex flex-col justify-center h-full z-10">
                <MatchCard match={gfMatch} />
              </div>

              <div className="flex items-center justify-start z-10">
                <div className="flex items-center gap-2.5 rounded-lg border-2 border-[#EAB308] bg-[#141824] px-4 py-3 shadow-xl">
                  <span className="text-base">👑</span>
                  <span className="font-sans text-xs sm:text-sm font-bold text-foreground">
                    {champion}
                  </span>
                </div>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#3A4056] fill-none" strokeWidth="1.5">
                <path d="M 224 64 H 260 V 132 H 224 M 260 98 H 296" />
                <path d="M 224 336 H 260 V 404 H 224 M 260 370 H 296" />
                <path d="M 520 132 H 556 V 370 H 520 M 556 251 H 592" />
                <path d="M 816 251 H 888" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match }: { match: BracketMatch }) {
  return (
    <div className="w-52 sm:w-56 rounded-lg border border-[#272B3A] bg-[#121520] overflow-hidden shadow-xl flex flex-col">
      <div className="flex items-center justify-between px-3.5 py-2 font-sans text-xs font-bold text-foreground bg-[#1C202E] border-b border-[#222636]">
        <span className="truncate pr-2">{match.team1.name}</span>
        <span className="font-sans font-bold text-xs sm:text-sm text-foreground">
          {match.team1.score}
        </span>
      </div>

      <div className="flex items-center justify-between px-3.5 py-2 font-sans text-xs font-bold text-foreground bg-[#121520]">
        <span className="truncate pr-2">{match.team2.name}</span>
        <span className="font-sans font-bold text-xs sm:text-sm text-foreground">
          {match.team2.score}
        </span>
      </div>

      <Link
        href="/tournaments/1/box-score"
        className="w-full py-1.5 bg-[#E53A4C] hover:bg-[#D42D3F] text-foreground font-sans text-xs font-bold tracking-normal text-center transition-colors"
      >
        View
      </Link>
    </div>
  );
}
