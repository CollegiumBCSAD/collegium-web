"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { Tournament } from "@/types";
import { tournamentsService } from "@/services";

export default function TournamentsPage() {
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
        <div className="border-t border-raised-panel/50 pt-8 mb-8 sm:mb-10 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground uppercase">
              TOURNAMENTS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-primary-brand mt-1 font-normal tracking-tight">
              Fresh brackets and high-stakes events.
            </p>
          </div>
          <Link
            href="/tournaments"
            className="font-sans text-xs sm:text-sm font-medium text-secondary-text hover:text-foreground transition-colors pt-2"
          >
            See All
          </Link>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-primary-brand border-t-transparent rounded-full animate-spin" />
            <p className="font-sans text-xs font-semibold text-secondary-text tracking-wider uppercase">
              Loading Tournaments...
            </p>
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-lg mx-auto space-y-4 rounded-2xl border border-panel-border bg-card-bg/60 p-10 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-raised-panel border border-panel-border flex items-center justify-center text-3xl shadow-inner">
              🏆
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground uppercase tracking-wide">
                NO TOURNAMENTS FOUND
              </h3>
              <p className="font-sans text-xs sm:text-sm text-secondary-text leading-relaxed">
                There are currently no active or upcoming tournaments in the database. New collegiate circuits will be listed here as soon as they are scheduled.
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
