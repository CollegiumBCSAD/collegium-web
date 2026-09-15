"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services/universitiesService";
import { GameId, University, UniversityMatchHistoryEntry } from "@/types";
import { GAME_ID_TO_ENUM } from "@/lib/games";
import { getMockUniversity } from "@/lib/mock/universities";
import UniversityHeaderBanner from "@/components/university/UniversityHeaderBanner";
import UniversityGameCards from "@/components/university/UniversityGameCards";
import UniversityRosterSection from "@/components/university/UniversityRosterSection";

export default function UniversityProfilePage() {
  const params = useParams();
  const universityId = params?.id as string;
  const { selectedGame } = useGame();
  const activeGame = (selectedGame || "valo") as GameId;

  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<UniversityMatchHistoryEntry[]>([]);
  const [loadedMatchesKey, setLoadedMatchesKey] = useState<string | null>(null);

  const matchesKey = `${universityId}:${activeGame}`;
  const loadingMatches = loadedMatchesKey !== matchesKey;

  useEffect(() => {
    if (!universityId) return;
    let isMounted = true;

    universitiesService
      .getUniversityById(universityId)
      .then((data) => {
        if (isMounted) {
          setUniversity(data || getMockUniversity(universityId));
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          const fallback = getMockUniversity(universityId);
          setUniversity(fallback);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [universityId]);

  useEffect(() => {
    if (!universityId) return;
    let isMounted = true;

    universitiesService
      .getUniversityMatches(universityId, GAME_ID_TO_ENUM[activeGame])
      .then((data) => {
        if (!isMounted) return;
        setMatches(Array.isArray(data) ? data : []);
        setLoadedMatchesKey(matchesKey);
      })
      .catch(() => {
        if (!isMounted) return;
        setMatches([]);
        setLoadedMatchesKey(matchesKey);
      });

    return () => {
      isMounted = false;
    };
  }, [universityId, activeGame, matchesKey]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-slate-400 animate-pulse">
        Loading Varsity Esports Organization Profile...
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#141926] border border-[#232B3E] flex items-center justify-center text-rose-400 text-2xl shadow-xl">
          ⚠️
        </div>
        <h2 className="font-display text-2xl font-black uppercase text-white">University Organization Not Found</h2>
        <p className="text-xs font-sans text-slate-400 max-w-sm">
          No collegiate esports organization profile exists for this university ID.
        </p>
        <Link href="/leaderboard" className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-md">
          Return to Leaderboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative animate-page-slide-in">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        {/* Organization Header Banner Component */}
        <UniversityHeaderBanner university={university} />

        {/* Per-Game Title Ratings Cards Grid Component */}
        <UniversityGameCards university={university} />

        {/* Interactive Verified Rosters & Match Logs Component */}
        <UniversityRosterSection
          university={university}
          matches={matches}
          isLoadingMatches={loadingMatches}
        />
      </div>
    </div>
  );
}
