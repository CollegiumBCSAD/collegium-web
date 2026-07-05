"use client";

import { mockTournaments } from "@/lib/mock/tournaments";
import Link from "next/link";
import { useState } from "react";

export default function TournamentsPage() {
  const games = ["ALL", "VALORANT", "LEAGUE OF LEGENDS", "MOBILE LEGENDS: BANG BANG"];
  const [selectedGame, setSelectedGame] = useState("ALL");

  const filteredTournaments = selectedGame === "ALL"
    ? mockTournaments
    : mockTournaments.filter((t) => t.game === selectedGame);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
      <div className="mb-12">
        <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
          TOURNAMENTS
        </span>
        <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
          Fresh brackets and high-stakes events.
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-raised-panel pb-6 mb-8">
        {games.map((game) => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={`px-4 py-2 rounded text-xs font-bold tracking-wider uppercase transition-colors ${
              selectedGame === game
                ? "bg-primary-brand text-foreground"
                : "border border-raised-panel bg-card-bg text-secondary-text hover:text-foreground hover:bg-raised-panel"
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredTournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="flex flex-col justify-between rounded border border-raised-panel bg-card-bg p-6"
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="font-sans text-2xs font-extrabold tracking-wider text-secondary-text uppercase">
                  {tournament.game}
                </span>
                <span
                  className={`rounded px-2.5 py-0.5 font-sans text-3xs font-extrabold tracking-wide uppercase ${
                    tournament.status === "LIVE"
                      ? "bg-success/15 text-success"
                      : tournament.status === "UPCOMING"
                      ? "bg-primary-brand/10 text-primary-brand"
                      : "bg-raised-panel text-secondary-text"
                  }`}
                >
                  {tournament.status}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-wide text-foreground">
                {tournament.title}
              </h2>
              <div className="mt-6 flex flex-col gap-2 font-sans text-xs text-secondary-text">
                <span>{tournament.teamsCount}</span>
                <span>{tournament.info}</span>
                <span className="mt-2 font-semibold text-primary-brand">
                  {tournament.statusText}
                </span>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-raised-panel/50">
              <Link
                href={`/tournaments/${tournament.id}/bracket`}
                className="inline-flex w-full h-10 items-center justify-center rounded bg-raised-panel font-sans text-xs font-bold text-foreground transition-colors hover:bg-neutral-800"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
