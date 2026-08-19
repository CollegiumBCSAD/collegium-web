"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { TournamentCardSkeleton } from "@/components/ui/Skeleton";
import { TrophyIcon } from "@/components/ui/Icons";
import { Tournament } from "@/types";
import { tournamentsService } from "@/services";
import { useGame } from "@/context/GameContext";

export default function TournamentsPage() {
  const { selectedGameInfo } = useGame();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTournaments() {
      try {
        const data = await tournamentsService.getTournaments();
        if (isMounted) {
          setTournaments(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setTournaments([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTournaments();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="border-b border-[#1E2538] pb-6 mb-8 sm:mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold tracking-widest text-primary-brand uppercase">
                PHILIPPINE COLLEGIATE CIRCUIT
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground uppercase">
              OFFICIAL TOURNAMENTS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1">
              High-stakes bracketing, verified match logs, and real-time War Room operations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-sans font-bold text-slate-400 bg-[#121624] px-3.5 py-1.5 rounded-full border border-[#222B3F] flex items-center gap-2">
              <TrophyIcon className="w-4 h-4 text-primary-brand" />
              <span>{tournaments.length} Active Circuit{tournaments.length === 1 ? "" : "s"}</span>
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-6">
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-lg mx-auto space-y-4 rounded-2xl border border-[#1E2538] bg-[#0E121C]/80 p-10 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-[#161C2C] border border-[#2A344D] flex items-center justify-center text-primary-brand shadow-inner">
              <TrophyIcon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground uppercase tracking-wide">
                NO ACTIVE TOURNAMENTS FOUND
              </h3>
              <p className="font-sans text-xs sm:text-sm text-secondary-text leading-relaxed">
                There are currently no active or upcoming tournaments scheduled in the database. New collegiate circuits will be listed here as soon as they are published by organizers.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onSelect={setSelectedTournament}
              />
            ))}
          </div>
        )}
      </div>

      <TournamentBracketModal
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        tournamentId={selectedTournament?.id}
        title={selectedTournament?.title ? `${selectedTournament.title} BRACKET` : "TOURNAMENT BRACKET"}
        subtitle="SINGLE ELIMINATION"
      />
    </div>
  );
}

