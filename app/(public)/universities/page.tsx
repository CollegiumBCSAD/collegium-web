"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services/universitiesService";
import { GameId, University, UniversitySortKey } from "@/types";
import { GAMES, GAME_ID_TO_ENUM } from "@/lib/games";
import UniversityDirectoryCard from "@/components/university/UniversityDirectoryCard";
import UniversityDirectoryHero from "@/components/university/UniversityDirectoryHero";
import UniversityDirectoryToolbar from "@/components/university/UniversityDirectoryToolbar";
import { UniversityCardSkeleton } from "@/components/ui/Skeleton";

const GRID = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5";

export default function UniversitiesDirectoryPage() {
  const { selectedGame } = useGame();
  const activeGame = (selectedGame || "valo") as GameId;
  const game = GAMES[activeGame] || GAMES.valo;

  const [universities, setUniversities] = useState<University[]>([]);
  const [loadedGame, setLoadedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<UniversitySortKey>("name");

  const isLoading = loadedGame !== activeGame;

  useEffect(() => {
    let cancelled = false;

    universitiesService
      .getUniversities(GAME_ID_TO_ENUM[activeGame])
      .then((data) => {
        if (cancelled) return;
        setUniversities(Array.isArray(data) ? data : []);
        setLoadedGame(activeGame);
      })
      .catch(() => {
        if (cancelled) return;
        setUniversities([]);
        setLoadedGame(activeGame);
      });

    return () => {
      cancelled = true;
    };
  }, [activeGame]);

  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const initialOf = (university: University) => university.name.charAt(0).toUpperCase();

  const availableLetters = useMemo(
    () => Array.from(new Set(universities.map(initialOf))),
    [universities]
  );

  const visible = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const matches = universities.filter(
      (university) =>
        (!activeLetter || initialOf(university) === activeLetter) &&
        (!query ||
          university.name.toLowerCase().includes(query) ||
          university.domain.toLowerCase().includes(query) ||
          (university.teamName || "").toLowerCase().includes(query))
    );

    return [...matches].sort((a, b) =>
      sortKey === "rating"
        ? (b.glicko2_rating ?? 0) - (a.glicko2_rating ?? 0)
        : a.name.localeCompare(b.name)
    );
  }, [universities, searchQuery, sortKey, activeLetter]);

  const renderCard = (university: University, rank?: number) => (
    <UniversityDirectoryCard
      key={`${university.id}-${university.teamId ?? ""}`}
      university={university}
      gameShortName={game.shortName}
      rank={rank}
    />
  );

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative animate-page-slide-in">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <UniversityDirectoryHero
          gameId={activeGame}
          universities={universities}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <UniversityDirectoryToolbar
          sortKey={sortKey}
          onSortChange={setSortKey}
          resultCount={visible.length}
          availableLetters={availableLetters}
          activeLetter={activeLetter}
          onLetterChange={setActiveLetter}
        />

        {isLoading ? (
          <div className={GRID} aria-busy="true">
            {Array.from({ length: 6 }, (_, idx) => (
              <UniversityCardSkeleton key={idx} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 border border-dashed border-white/10 bg-black/20 text-center space-y-3">
            <h2 className="font-display text-lg font-black uppercase text-white">No programs found</h2>
            <p className="text-xs font-sans text-slate-400">
              {universities.length === 0
                ? `No university has a registered ${game.name} squad yet.`
                : "No school matches those filters."}
            </p>
            {universities.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveLetter(null);
                }}
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary-brand hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className={GRID}>
            {visible.map((university, idx) => renderCard(university, sortKey === "rating" ? idx + 1 : undefined))}
          </div>
        )}
      </div>
    </div>
  );
}
