"use client";

import { UniversityDirectoryHeroProps } from "@/types";
import { GAMES } from "@/lib/games";
import UniversityTopTable from "./UniversityTopTable";
import UniversityMemberStrip from "./UniversityMemberStrip";

export default function UniversityDirectoryHero({
  gameId,
  universities,
  searchQuery,
  onSearchChange,
}: UniversityDirectoryHeroProps) {
  const game = GAMES[gameId] || GAMES.valo;
  const squads = universities.filter((u) => u.teamId).length;
  // Each tournament match counts once for the winner and once for the loser.
  const matches = Math.round(
    universities.reduce((sum, u) => sum + (u.wins ?? 0) + (u.losses ?? 0), 0) / 2
  );

  return (
    <section className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-end">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-mono font-bold uppercase tracking-[0.3em] text-slate-400">
            <span className="h-px w-8 bg-primary-brand" />
            Varsity Directory
            <span className="text-primary-brand">{game.shortName}</span>
          </p>
          <h1 className="mt-5 font-display font-black uppercase leading-[0.88] tracking-tight text-[3.25rem] sm:text-7xl">
            <span className="block text-white">Every program.</span>
            <span className="block text-transparent [-webkit-text-stroke:1.5px_var(--primary-brand)]">One directory.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] font-sans leading-relaxed text-slate-400">
            <span className="text-white font-semibold">{universities.length} institutions</span> field{" "}
            <span className="text-white font-semibold">{squads} varsity squads</span> in {game.name}, with{" "}
            <span className="text-white font-semibold">{matches} verified matches</span> on the books.
          </p>

          <label className="relative mt-7 block max-w-md">
            <span className="sr-only">Search universities</span>
            <svg
              aria-hidden
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search a school, domain, or squad"
              className="h-12 w-full pl-11 pr-10 rounded-xl bg-[#0E121C] border border-white/10 text-white text-sm font-sans focus:outline-none focus:border-primary-brand/70 placeholder:text-slate-600 [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            )}
          </label>
        </div>

        <UniversityTopTable universities={universities} />
      </div>

      <UniversityMemberStrip universities={universities} />
    </section>
  );
}
