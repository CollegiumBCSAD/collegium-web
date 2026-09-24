"use client";

import React from "react";
import { UserProfile, GameInfo, GameId, University, Tournament, NewsArticle, ScrimOffer } from "@/types";
import { Team } from "@/lib/teams";
import PublicHeroBroadcast from "./PublicHeroBroadcast";
import HomeMatchesHub, { HomeMatchItem } from "./HomeMatchesHub";
import HomeNewsHub from "./HomeNewsHub";
import HomeTournamentsWidget from "./HomeTournamentsWidget";
import HomeRankingsWidget from "./HomeRankingsWidget";

interface PublicEsportsHubProps {
  user: UserProfile | null;
  activeGame: GameId;
  selectedGameInfo: GameInfo | null;
  openGameSelector: () => void;
  selectGame: (gameId: GameId) => void;
  stats: { value: string; label: string }[];
  matches: HomeMatchItem[];
  articles: NewsArticle[];
  universities: University[];
  scrims?: ScrimOffer[];
  tournaments: Tournament[];
  teams: Team[];
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

export default function PublicEsportsHub({
  activeGame,
  selectedGameInfo,
  openGameSelector,
  stats,
  matches,
  articles,
  universities,
  tournaments,
  onOpenBoxScore,
}: PublicEsportsHubProps) {
  return (
    <div className="flex flex-col flex-1 game-theme-bg">
      {/* 1. Cinematic Hero with Orbital Radar & Featured Editorial News Dispatch */}
      <div className="animate-home-hero">
        <PublicHeroBroadcast
          activeGame={activeGame}
          selectedGameInfo={selectedGameInfo}
          openGameSelector={openGameSelector}
          stats={stats}
          articles={articles}
        />
      </div>

      {/* 2. Main Matches, News, and Circuit Sidebar */}
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8 pt-2 sm:pt-3 pb-8 sm:pb-12 space-y-10 animate-home-content">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left: Matches & News */}
          <div className="lg:col-span-8 space-y-8">
            <HomeMatchesHub
              matches={matches}
              activeGame={activeGame}
              onOpenBoxScore={onOpenBoxScore}
            />

            <HomeNewsHub
              articles={articles}
              activeGame={activeGame}
            />
          </div>

          {/* Right Rail: Power Rankings & Tournaments */}
          <div className="lg:col-span-4 space-y-6">
            <HomeRankingsWidget
              universities={universities}
              activeGame={activeGame}
            />

            <HomeTournamentsWidget
              tournaments={tournaments}
              activeGame={activeGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

