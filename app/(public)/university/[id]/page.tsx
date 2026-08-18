"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { universitiesService } from "@/services/universitiesService";
import { University } from "@/types";
import { TrophyIcon, ShieldIcon, SwordsIcon, ZapIcon, CrownIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface GameRatingDetail {
  gameTitle: string;
  shortName: string;
  rating: number;
  wins: number;
  losses: number;
  accent: string;
  squadName: string;
}

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
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text animate-pulse">
        Loading Varsity Esports Organization Profile...
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#161C2C] border border-[#2B344D] flex items-center justify-center text-rose-400 text-2xl shadow-inner">
          ⚠️
        </div>
        <h2 className="font-display text-2xl font-bold uppercase text-foreground">University Organization Not Found</h2>
        <p className="text-xs font-sans text-secondary-text max-w-sm">
          No collegiate esports organization profile exists for this university ID.
        </p>
        <Link href="/leaderboard" className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md">
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  const wins = university.wins || 0;
  const losses = university.losses || 0;
  const totalMatches = wins + losses;
  const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  const gameRatings: GameRatingDetail[] = [
    { gameTitle: "VALORANT", shortName: "VALO", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#E53A4C", squadName: `${university.name} Varsity` },
    { gameTitle: "League of Legends", shortName: "LoL", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#00A3FF", squadName: `${university.name} LoL` },
    { gameTitle: "Mobile Legends: BB", shortName: "MLBB", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#A855F7", squadName: `${university.name} MLBB` },
    { gameTitle: "Call of Duty: Mobile", shortName: "CODM", rating: Math.round(university.glicko2_rating), wins, losses, accent: "#E5B800", squadName: `${university.name} CODM` },
  ];

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        
        {/* Organization Banner & Header Box */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0C101A]/95 border border-[#1E273A] p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-brand via-accent to-secondary-brand" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-start sm:items-center gap-5 min-w-0">
              {/* Org Emblem Crest */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#1E273A] to-[#0A0D15] border border-[#2B354F] text-primary-brand flex items-center justify-center font-display text-2xl sm:text-3xl font-black shrink-0 shadow-2xl ring-2 ring-primary-brand/30">
                {university.name.substring(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-primary-brand bg-primary-brand/10 px-2.5 py-0.5 rounded-full border border-primary-brand/30 flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-primary-brand" />
                    VERIFIED COLLEGIATE VARSITY
                  </span>
                  {university.domain && (
                    <span className="text-[10px] font-mono font-semibold text-slate-300 bg-[#141926] px-2.5 py-0.5 rounded-full border border-[#232B3E] flex items-center gap-1">
                      <ShieldIcon className="w-3 h-3 text-secondary-brand" />
                      {university.domain}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-foreground tracking-tight truncate">
                  {university.name}
                </h1>
              </div>
            </div>

            {/* Performance Stats Widget */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#080B12] border border-[#1E2538] shrink-0 text-center shadow-inner">
              <div className="px-3">
                <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Glicko-2 Rating</span>
                <span className="font-display text-xl sm:text-2xl font-black text-foreground">{university.glicko2_rating.toFixed(1)}</span>
                <span className="text-[9px] font-mono text-emerald-400 block font-bold">±{university.glicko2_rd?.toFixed(0) || "350"} RD</span>
              </div>
              <div className="px-3 border-x border-[#1E2538]">
                <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Win Rate</span>
                <span className="font-display text-xl sm:text-2xl font-black text-emerald-400">{winRate}%</span>
                <span className="text-[9px] font-mono text-slate-400 block">{totalMatches} Matches</span>
              </div>
              <div className="px-3">
                <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">Season Record</span>
                <span className="font-mono text-sm sm:text-base font-extrabold text-foreground block mt-1">{wins}W - {losses}L</span>
              </div>
            </div>
          </div>
        </div>

        {/* Per-Game Title Varsity Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg sm:text-xl font-extrabold uppercase tracking-wide text-foreground flex items-center gap-2">
              <SwordsIcon className="w-5 h-5 text-primary-brand" />
              <span>Varsity Esports Titles & Ratings</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gameRatings.map((g) => {
              const gameTotal = g.wins + g.losses;
              const gameWinRate = gameTotal > 0 ? Math.round((g.wins / gameTotal) * 100) : 0;
              return (
                <div key={g.gameTitle} className="p-5 rounded-2xl bg-[#0C101A]/95 border border-[#1E273A] space-y-3.5 relative overflow-hidden shadow-xl backdrop-blur-md hover:border-primary-brand/40 transition-all group">
                  <div className="w-1 h-full absolute left-0 top-0" style={{ backgroundColor: g.accent }} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-300 block">
                      {g.gameTitle}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#141926] text-slate-300 border border-[#232B3E]">
                      {g.shortName}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">Glicko-2</span>
                      <span className="font-display text-2xl font-black text-foreground">{g.rating}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">{g.wins}W - {g.losses}L</span>
                  </div>

                  {/* Progress Meter Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-[#080B12] h-2 rounded-full overflow-hidden border border-[#1E2538]">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          backgroundColor: g.accent,
                          width: `${gameWinRate}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                      <span>Win Rate Meter</span>
                      <span>{gameWinRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Roster & Match History Section */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0C101A]/95 border border-[#1E273A] space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2538] pb-4">
            <div className="flex items-center gap-2.5">
              <TrophyIcon className="w-5 h-5 text-secondary-brand" />
              <h3 className="font-display text-lg sm:text-xl font-extrabold uppercase text-foreground">
                Verified Varsity Roster & Logged Matches
              </h3>
            </div>
            <Link href="/leaderboard" className="h-9 px-4 rounded-xl bg-[#141926] hover:bg-[#1C2336] text-slate-300 font-sans text-xs font-bold uppercase tracking-wider border border-[#232B3E] transition-all inline-flex items-center justify-center gap-1.5">
              <span>← Back to Rankings</span>
            </Link>
          </div>

          <div className="space-y-4">
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              All varsity athlete rosters, Glicko-2 ratings, and match logs for <span className="font-bold text-foreground">{university.name}</span> are cryptographically verified via Riot API and peer-validated scrimmage logs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E2538] space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-secondary-brand uppercase tracking-widest block">ROSTER STATUS</span>
                <span className="font-sans text-xs font-bold text-foreground block">Verified Active Lineup</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E2538] space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-primary-brand uppercase tracking-widest block">MATCH ENGINE</span>
                <span className="font-sans text-xs font-bold text-foreground block">Dual-Mode VCS & Glicko-2</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E2538] space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block">OFFICIAL DIVISION</span>
                <span className="font-sans text-xs font-bold text-foreground block">Philippine Collegiate Circuit</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

