"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/context/GameContext";
import { universitiesService } from "@/services/universitiesService";
import { GameId, University } from "@/types";
import { GAMES, GAME_ID_TO_ENUM } from "@/lib/games";
import UniversityDirectoryCard from "@/components/university/UniversityDirectoryCard";

export default function UniversitiesDirectoryPage() {
  const { selectedGame } = useGame();
  const activeGame = (selectedGame || "valo") as GameId;
  const game = GAMES[activeGame] || GAMES.valo;

  const [universities, setUniversities] = useState<University[]>([]);
  const [loadedGame, setLoadedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return universities;
    return universities.filter(
      (university) =>
        university.name.toLowerCase().includes(query) ||
        university.domain.toLowerCase().includes(query) ||
        (university.teamName || "").toLowerCase().includes(query)
    );
  }, [universities, searchQuery]);

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative animate-page-slide-in">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        {/* Directory Header & Search */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-primary-brand block">
              {"// VARSITY ORGANIZATIONS"}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              University Directory
            </h1>
            <p className="text-xs font-sans text-slate-400 mt-1">
              Accredited collegiate esports programs competing in {game.name}.
            </p>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search universities or squads..."
            aria-label="Search universities"
            className="h-10 w-full lg:w-72 px-4 bg-[#060912] border border-[#1C2538] text-white text-xs font-sans focus:outline-none focus:border-primary-brand/60 placeholder:text-slate-600"
            style={{
              clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
            }}
          />
        </div>

        {isLoading ? (
          <div className="min-h-[40vh] flex items-center justify-center text-xs font-mono text-slate-400 animate-pulse">
            Loading varsity organizations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 bg-[#090C16] border border-dashed border-[#2A3550] text-center space-y-2">
            <h2 className="font-display text-base font-black uppercase text-white">
              No Organizations Found
            </h2>
            <p className="text-xs font-sans text-slate-400">
              {universities.length === 0
                ? `No university has a registered ${game.name} squad yet.`
                : "No university matches that search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((university, idx) => (
              <UniversityDirectoryCard
                key={`${university.id}-${university.teamId || idx}`}
                university={university}
                rank={searchQuery ? undefined : idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
