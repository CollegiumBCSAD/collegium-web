"use client";

import { RankingsTableProps } from "@/types";
import { LeaderboardSkeletonRow } from "@/components/ui/Skeleton";
import { DOT_SURFACE } from "@/components/university/surface";
import { RANKINGS_GRID } from "@/lib/rankings";
import RankingsRow from "./RankingsRow";

const COLUMNS = ["Rank", "Team", "Rating", "Win rate", "W–L", "Streak", ""];

export default function RankingsTable({ entries, isLoading, title, gameDisplayName, searchQuery, onReset }: RankingsTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-black uppercase tracking-wide text-white">{title}</h2>
        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">{gameDisplayName}</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <LeaderboardSkeletonRow />
          <LeaderboardSkeletonRow />
          <LeaderboardSkeletonRow />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-14 px-6 text-center">
          <h3 className="font-display text-lg font-black uppercase text-white">No varsity programs found</h3>
          <p className="mt-2 text-sm font-sans text-slate-400">
            Nothing matched &quot;<span className="text-white font-mono">{searchQuery}</span>&quot; in the {gameDisplayName} division.
          </p>
          <button type="button" onClick={onReset} className="game-theme-btn mt-5 h-10 px-5 text-xs">
            Reset filters
          </button>
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl border border-white/[0.07] ${DOT_SURFACE} shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_24px_50px_-30px_rgba(0,0,0,0.95)]`}>
          <div className={`hidden md:grid px-5 py-3 border-b border-white/[0.06] bg-black/30 ${RANKINGS_GRID}`}>
            {COLUMNS.map((c) => (
              <span key={c || "go"} className="text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500">
                {c}
              </span>
            ))}
          </div>
          <div className="divide-y divide-white/[0.05]">
            {entries.map((entry) => (
              <RankingsRow key={`${entry.id}-${entry.rank}`} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
