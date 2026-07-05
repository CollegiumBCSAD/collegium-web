"use client";

import { mockLeaderboards } from "@/lib/mock/leaderboard";
import { useState } from "react";

export default function LeaderboardPage() {
  const games = ["VALORANT", "LEAGUE OF LEGENDS", "MOBILE LEGENDS: BANG BANG", "CALL OF DUTY: MOBILE"];
  const [selectedGame, setSelectedGame] = useState("VALORANT");

  const standings = mockLeaderboards[selectedGame] || [];

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
            RANKINGS PREVIEW
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
            Top universities shaping the circuit.
          </h1>
        </div>
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

      <div className="overflow-hidden rounded border border-raised-panel bg-card-bg">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="border-b border-raised-panel bg-background/50 text-2xs font-bold tracking-widest text-secondary-text uppercase">
                <th className="px-6 py-4 w-20">RANK</th>
                <th className="px-6 py-4">UNIVERSITY</th>
                <th className="px-6 py-4 text-right">RATING</th>
                <th className="px-6 py-4 text-right">WIN RATE</th>
                <th className="px-6 py-4 text-right">STREAK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-raised-panel text-sm font-semibold">
              {standings.map((entry) => (
                <tr key={entry.id} className="hover:bg-raised-panel/20 transition-colors">
                  <td className="px-6 py-4 font-display text-base text-secondary-text">
                    #{entry.rank}
                  </td>
                  <td className="px-6 py-4 text-foreground tracking-wide">
                    {entry.university}
                  </td>
                  <td className="px-6 py-4 text-right font-display text-base text-foreground">
                    {entry.rating.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right text-secondary-text">
                    {entry.winRate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-2xs font-bold ${
                        entry.streak.includes("W")
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {entry.streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
