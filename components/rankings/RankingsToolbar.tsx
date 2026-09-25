"use client";

import { RankingsSortOption, RankingsToolbarProps } from "@/types";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

const SORTS: { id: RankingsSortOption; label: string }[] = [
  { id: "rating", label: "Rating" },
  { id: "winRate", label: "Win %" },
  { id: "wins", label: "Wins" },
];

export default function RankingsToolbar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showAll,
  onToggleShowAll,
  canToggleShowAll,
  resultCount,
}: RankingsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <label className="relative block w-full lg:max-w-sm">
        <span className="sr-only">Search rankings</span>
        <svg aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search a team or university"
          className="h-11 w-full pl-11 pr-10 rounded-xl bg-[#090C14] border border-white/10 text-white text-sm font-sans focus:outline-none focus:border-primary-brand/70 placeholder:text-slate-600"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/5"
          >
            ✕
          </button>
        )}
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-500">Sort by</span>
        <SegmentedControl ariaLabel="Sort rankings" options={SORTS} value={sortBy} onChange={onSortChange} />
        {canToggleShowAll && <ToggleSwitch label="Include top 3" checked={showAll} onChange={onToggleShowAll} />}
        <span className="pl-1 text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500">
          <span className="text-white font-bold">{resultCount}</span> {resultCount === 1 ? "program" : "programs"}
        </span>
      </div>
    </div>
  );
}
