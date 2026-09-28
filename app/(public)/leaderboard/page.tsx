"use client";

import { useState, useEffect, useMemo } from "react";
import { mockLeaderboards, LeaderboardEntry } from "@/lib/mock/leaderboard";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services";
import { GameId, RankingsSortOption } from "@/types";
import { GAME_ID_TO_ENUM } from "@/lib/games";
import { GAME_ID_TO_DISPLAY, mapUniversitiesToLeaderboard, normalizeMockEntries } from "@/lib/rankings";
import RankingsHero from "@/components/rankings/RankingsHero";
import RankingsPodium from "@/components/rankings/RankingsPodium";
import RankingsToolbar from "@/components/rankings/RankingsToolbar";
import RankingsTable from "@/components/rankings/RankingsTable";
import RankingsExplainer from "@/components/rankings/RankingsExplainer";

export default function LeaderboardPage() {
  const { selectedGame: globalGame, selectGame } = useGame();
  const activeGame = (globalGame || "valo") as GameId;
  const gameDisplayName = GAME_ID_TO_DISPLAY[activeGame] || "VALORANT";
  const enumValue = GAME_ID_TO_ENUM[activeGame] || "VALORANT";

  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [loadedGame, setLoadedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<RankingsSortOption>("rating");
  const [showAllInTable, setShowAllInTable] = useState<boolean>(false);

  const isLoading = loadedGame !== activeGame;

  useEffect(() => {
    let cancelled = false;

    universitiesService
      .getUniversities(enumValue)
      .then((universities) => {
        if (cancelled) return;
        if (universities && universities.length > 0) {
          setStandings(mapUniversitiesToLeaderboard(universities, gameDisplayName));
        } else {
          setStandings(normalizeMockEntries(mockLeaderboards[gameDisplayName] || [], gameDisplayName));
        }
      })
      .catch(() => {
        if (cancelled) return;
        setStandings(normalizeMockEntries(mockLeaderboards[gameDisplayName] || [], gameDisplayName));
      })
      .finally(() => {
        if (!cancelled) setLoadedGame(activeGame);
      });

    return () => {
      cancelled = true;
    };
  }, [activeGame, gameDisplayName, enumValue]);

  // Filter and sort standings
  const filteredStandings = useMemo(() => {
    let list = [...standings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (entry) => entry.university.toLowerCase().includes(q) || (entry.teamName && entry.teamName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === "winRate") return b.winRate - a.winRate;
      if (sortBy === "wins") return (b.wins ?? 0) - (a.wins ?? 0);
      return b.rating - a.rating;
    });

    return list;
  }, [standings, searchQuery, sortBy]);

  // When searching or re-sorting, the table shows every match and the podium
  // hides. Otherwise the top 3 sit on the podium and the table starts at rank 4
  // unless "include top 3" is on.
  const isSearchingOrSorting = searchQuery.trim().length > 0 || sortBy !== "rating";
  const podium = standings.slice(0, 3);
  const tableStandings = isSearchingOrSorting || showAllInTable ? filteredStandings : filteredStandings.slice(3);
  const tableTitle = isSearchingOrSorting ? "Search & sorted results" : showAllInTable ? "Full standings" : "Contenders · rank 4+";

  return (
    <div className="flex flex-col flex-1 game-theme-bg text-[#EDEEF2] relative animate-page-slide-in pb-16">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 space-y-12">
        <RankingsHero
          activeGame={activeGame}
          gameDisplayName={gameDisplayName}
          programCount={standings.length}
          onSelectGame={selectGame}
        />

        {!isLoading && standings.length >= 3 && !isSearchingOrSorting && (
          <RankingsPodium top={podium} gameDisplayName={gameDisplayName} />
        )}

        <div className="space-y-6">
          <RankingsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            showAll={showAllInTable}
            onToggleShowAll={() => setShowAllInTable(!showAllInTable)}
            canToggleShowAll={!isSearchingOrSorting}
            resultCount={filteredStandings.length}
          />

          <RankingsTable
            entries={tableStandings}
            isLoading={isLoading}
            title={tableTitle}
            gameDisplayName={gameDisplayName}
            searchQuery={searchQuery}
            onReset={() => {
              setSearchQuery("");
              setSortBy("rating");
            }}
          />
        </div>

        <RankingsExplainer />
      </div>
    </div>
  );
}
