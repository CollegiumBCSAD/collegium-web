"use client";

import TournamentBracketModal from "@/components/TournamentBracketModal";
import { mockTournaments, Tournament } from "@/lib/mock/tournaments";
import Link from "next/link";
import { useState } from "react";

export default function TournamentsPage() {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b md:bg-gradient-to-r from-[#CC0000]/25 from-0% to-[#0A0C10] to-[50%] md:to-[40%] relative">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="border-t border-raised-panel/50 pt-8 mb-8 sm:mb-10 flex items-start justify-between">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground uppercase">
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
          {mockTournaments.map((tournament) => (
            <div
              key={tournament.id}
              className="group relative flex flex-col md:flex-row overflow-hidden rounded-xl border border-raised-panel bg-[#0E1119] transition-all hover:border-raised-panel/80 shadow-xl"
            >
              <div
                className={`w-full md:w-56 lg:w-64 h-40 md:h-auto shrink-0 relative overflow-hidden bg-gradient-to-b ${tournament.bgGradient}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0E1119] opacity-90 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0E1119] opacity-90 md:hidden" />
              </div>

              <div className="flex-1 p-5 sm:p-6 md:p-8 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <span className="font-sans text-xs sm:text-sm font-bold tracking-wider text-foreground uppercase">
                      {tournament.game}
                    </span>
                    <span className="font-sans text-2xs sm:text-xs font-bold tracking-wider text-secondary-text uppercase">
                      {tournament.status}
                    </span>
                  </div>

                  <h2 className="font-sans text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground">
                    {tournament.title}
                  </h2>

                  <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1 tracking-tight">
                    {tournament.statusText}
                  </p>

                  <ul className="mt-3 space-y-1 text-xs text-secondary-text font-sans tracking-tight">
                    {tournament.bulletPoints.map((pt) => (
                      <li key={pt} className="flex items-center gap-2">
                        <span className="text-secondary-text">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => setSelectedTournament(tournament)}
                    className="flex h-11 w-full items-center justify-center rounded-full border border-raised-panel bg-[#141824] text-xs sm:text-sm font-semibold tracking-normal text-foreground transition-all hover:bg-raised-panel hover:border-secondary-text/30 cursor-pointer"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TournamentBracketModal
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        title="TOURNAMENT BRACKET"
        subtitle="SINGLE ELIMINATION • 8 TEAMS"
      />
    </div>
  );
}
