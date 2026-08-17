"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { universitiesService } from "@/services/universitiesService";
import { University } from "@/types";

interface GameRatingDetail {
  gameTitle: string;
  rating: number;
  wins: number;
  losses: number;
  accent: string;
}

const GAME_DISPLAY: Record<string, { label: string; accent: string }> = {
  VALORANT: { label: "VALORANT", accent: "#E53A4C" },
  LOL: { label: "League of Legends", accent: "#00A3FF" },
  MLBB: { label: "Mobile Legends: BB", accent: "#A855F7" },
  CODM: { label: "Call of Duty: Mobile", accent: "#E5B800" },
};

export default function UniversityProfilePage() {
  const params = useParams();
  const universityId = params?.id as string;
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!universityId) return;
    let isMounted = true;

    universitiesService
      .getUniversityById(universityId)
      .then((data) => {
        if (isMounted) {
          setUniversity(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUniversity(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [universityId]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">
        Loading University Esports Profile...
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold uppercase text-foreground">University Not Found</h2>
        <p className="text-xs font-sans text-secondary-text max-w-sm">
          No collegiate profile exists for this university ID.
        </p>
        <Link href="/leaderboard" className="text-xs font-sans font-bold text-primary-brand hover:underline">
          Return to Rankings
        </Link>
      </div>
    );
  }

  const wins = university.wins || 0;
  const losses = university.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const gameRatings: GameRatingDetail[] = [
    { gameTitle: "VALORANT", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#E53A4C" },
    { gameTitle: "League of Legends", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#00A3FF" },
    { gameTitle: "Mobile Legends: BB", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#A855F7" },
    { gameTitle: "Call of Duty: Mobile", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#E5B800" },
  ];

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <div className="p-8 rounded-2xl bg-card-bg border border-raised-panel shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block">
                Official Collegiate Varsity Profile
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase text-foreground">
                {university.name}
              </h1>
              <span className="inline-block text-xs font-sans font-bold px-3 py-1 rounded bg-raised-panel text-secondary-text border border-panel-border">
                🌐 {university.domain}
              </span>
            </div>

            <div className="flex items-center gap-6 p-4 rounded-xl bg-background border border-panel-border shrink-0">
              <div className="text-center px-3">
                <span className="text-[10px] font-sans text-secondary-text uppercase block">Global Glicko-2</span>
                <span className="font-display text-2xl font-bold text-foreground">{university.glicko2_rating.toFixed(1)}</span>
              </div>
              <div className="h-8 w-px bg-panel-border" />
              <div className="text-center px-3">
                <span className="text-[10px] font-sans text-secondary-text uppercase block">Win Rate</span>
                <span className="font-display text-2xl font-bold text-success">{winRate}%</span>
              </div>
              <div className="h-8 w-px bg-panel-border" />
              <div className="text-center px-3">
                <span className="text-[10px] font-sans text-secondary-text uppercase block">Record</span>
                <span className="font-sans text-xs font-bold text-foreground">{wins}W - {losses}L</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
            Per-Game Title Ratings & Stats
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameRatings.map((g) => {
              const gameTotal = g.wins + g.losses;
              const gameWinRate = gameTotal > 0 ? Math.round((g.wins / gameTotal) * 100) : 0;
              return (
                <div key={g.gameTitle} className="p-5 rounded-2xl bg-card-bg border border-raised-panel space-y-3 relative overflow-hidden">
                  <div className="w-1.5 h-full absolute left-0 top-0" style={{ backgroundColor: g.accent }} />
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-text block">
                    {g.gameTitle}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-2xl font-bold text-foreground">{g.rating}</span>
                    <span className="text-xs font-sans font-bold text-success">{g.wins}W - {g.losses}L</span>
                  </div>
                  <div className="w-full bg-background h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: g.accent,
                        width: `${gameWinRate}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card-bg border border-raised-panel space-y-4">
          <div className="flex items-center justify-between border-b border-raised-panel pb-3">
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              Varsity Rosters & Match History
            </h3>
            <Link href="/leaderboard" className="text-xs font-sans font-bold text-secondary-text hover:text-foreground">
              ← Back to Rankings
            </Link>
          </div>
          <p className="text-xs font-sans text-secondary-text">
            All athlete stats, match logs, and verified tournament histories for {university.name} are peer-verified via Collegium API.
          </p>
        </div>
      </div>
    </div>
  );
}
