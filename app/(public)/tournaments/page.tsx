"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { mockTournaments } from "@/lib/mock/tournaments";
import { Tournament } from "@/types";
import { tournamentsService } from "@/services";

export default function TournamentsPage() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>(mockTournaments);

  useEffect(() => {
    tournamentsService.getTournaments()
      .then((data) => {
        if (data && data.length > 0) setTournaments(data);
      })
      .catch(() => {
        // keep mock fallback
      });
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

        <div className="flex flex-col gap-6 sm:gap-8">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onSelect={setSelectedTournament}
            />
          ))}
        </div>
      </div>

      <TournamentBracketModal
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        tournamentId={selectedTournament?.id}
        title={selectedTournament?.title ? `${selectedTournament.title} BRACKET` : "TOURNAMENT BRACKET"}
        subtitle="SINGLE ELIMINATION • 8 TEAMS"
      />
    </div>
  );
}
