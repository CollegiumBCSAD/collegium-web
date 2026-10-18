"use client";

import { useMemo } from "react";
import { UserProfile, GameInfo, GameId, University, Tournament, NewsArticle, ScrimOffer, HomeDomainLookup, HomeMatchItem, HomeStat } from "@/types";
import { Team } from "@/lib/teams";
import PublicHeroBroadcast from "./PublicHeroBroadcast";
import HomeMatchesHub from "./HomeMatchesHub";
import HomeNewsHub from "./HomeNewsHub";
import HomeTournamentsWidget from "./HomeTournamentsWidget";
import HomeRankingsWidget from "./HomeRankingsWidget";

interface PublicEsportsHubProps {
  user: UserProfile | null;
  activeGame: GameId;
  selectedGameInfo: GameInfo | null;
  openGameSelector: () => void;
  selectGame: (gameId: GameId) => void;
  stats: HomeStat[];
  matches: HomeMatchItem[];
  articles: NewsArticle[];
  universities: University[];
  scrims?: ScrimOffer[];
  tournaments: Tournament[];
  teams: Team[];
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

// vlr.gg-style hub under the hero: matches in the main column; rankings, events
// and (only when the game has any) news in the rail.
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
  // An empty news column just wastes a third of the screen, so it only appears with content.
  const hasNews = articles.some((a) => a.gameId === activeGame || a.gameId === "general");
  const domains = useMemo<HomeDomainLookup>(
    () => Object.fromEntries(universities.map((u) => [u.id, u.domain])),
    [universities],
  );

  return (
    <div className="flex flex-1 flex-col game-theme-bg">
      <PublicHeroBroadcast
        activeGame={activeGame}
        selectedGameInfo={selectedGameInfo}
        openGameSelector={openGameSelector}
        stats={stats}
        tournaments={tournaments}
      />

      <div className="mx-auto grid w-full max-w-[1600px] items-start gap-5 px-4 pb-16 pt-4 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <HomeMatchesHub matches={matches} domains={domains} activeGame={activeGame} onOpenBoxScore={onOpenBoxScore} />

        <aside className="space-y-5">
          <HomeRankingsWidget activeGame={activeGame} />
          <HomeTournamentsWidget tournaments={tournaments} activeGame={activeGame} />
          {hasNews && <HomeNewsHub articles={articles} activeGame={activeGame} />}
        </aside>
      </div>
    </div>
  );
}
