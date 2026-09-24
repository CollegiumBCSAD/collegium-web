"use client";

import { UniversityDirectoryHeroProps } from "@/types";
import { GAMES } from "@/lib/games";
import UniversityCrestWall from "./UniversityCrestWall";

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

  const facts = [
    { value: universities.length, label: "Institutions" },
    { value: squads, label: "Varsity squads" },
    { value: matches, label: "Matches logged" },
  ];

  return (
    <section className="relative overflow-hidden border border-white/[0.06] bg-[#0B0E17]">
      <UniversityCrestWall universities={universities} />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-primary-brand" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14 max-w-2xl">
        <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-primary-brand">
          {"// Varsity Directory · "}
          {game.name}
        </span>
        <h1 className="mt-3 font-display text-4xl sm:text-5xl font-black uppercase text-white tracking-tight leading-[0.95]">
          Meet the
          <br />
          <span className="text-primary-brand">programs.</span>
        </h1>
        <p className="mt-4 text-sm font-sans text-slate-300/90 max-w-md leading-relaxed">
          Every accredited university fielding a {game.name} squad on Collegium. Find a school,
          scout its varsity roster, and follow its season.
        </p>

        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dd className="font-display text-2xl font-black text-white tabular-nums">{fact.value}</dd>
              <dt className="text-[9px] font-mono uppercase tracking-widest text-slate-400">{fact.label}</dt>
            </div>
          ))}
        </dl>

        <div className="relative mt-7 max-w-md">
          <svg
            aria-hidden
            className="absolute z-10 left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
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
            placeholder="Find a university, domain, or squad..."
            aria-label="Search universities"
            className="h-12 w-full pl-11 pr-10 bg-black/50 backdrop-blur-md border border-white/10 text-white text-sm font-sans focus:outline-none focus:border-primary-brand/70 placeholder:text-slate-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute z-10 right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
