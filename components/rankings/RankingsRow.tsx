"use client";

import Link from "next/link";
import { RankingsRowProps } from "@/types";
import { MEDALS, PROVISIONAL_HINT, RANKINGS_GRID, getWinRateColor } from "@/lib/rankings";

export default function RankingsRow({ entry }: RankingsRowProps) {
  const medal = MEDALS[entry.rank];
  const winColor = getWinRateColor(entry.winRate);
  const streakTone = entry.streak.includes("W") ? "text-success" : entry.streak.includes("L") ? "text-rose-400" : "text-slate-500";

  return (
    <Link
      href={`/university/${entry.id}`}
      className={`group relative flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03] ${RANKINGS_GRID}`}
    >
      {medal && <span aria-hidden className="absolute left-0 inset-y-3 w-[3px] rounded-r-full" style={{ background: medal.color }} />}

      <span
        className="font-display text-3xl font-black leading-none tabular-nums text-transparent"
        style={{ WebkitTextStroke: medal ? `1.5px ${medal.color}` : "1px rgba(148,163,184,0.5)" }}
      >
        {String(entry.rank).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-display text-base font-black uppercase tracking-wide text-white truncate group-hover:text-primary-brand transition-colors">
            {entry.teamName || entry.university}
          </span>
          {medal && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: medal.color }}>
              Top 3
            </span>
          )}
          {entry.isProvisional && (
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500" title={PROVISIONAL_HINT}>
              Provisional
            </span>
          )}
        </div>
        <span className="block mt-0.5 text-xs font-sans text-slate-500 truncate">
          {entry.university} · {entry.game}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-xl font-black tabular-nums text-white">{entry.rating.toFixed(1)}</span>
        <span className="text-[10px] font-mono text-slate-500" title="Rating Deviation: the statistical uncertainty of the rating.">
          ±{Math.round(entry.rd ?? 350)}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <span className="block h-full rounded-full" style={{ width: `${Math.max(entry.winRate, 3)}%`, backgroundColor: winColor }} />
        </span>
        <span className="w-11 text-right font-mono text-sm font-bold tabular-nums" style={{ color: winColor }}>
          {entry.winRate}%
        </span>
      </div>

      <span className="font-mono text-sm tabular-nums text-slate-300">
        {entry.wins ?? 0}–{entry.losses ?? 0}
      </span>

      <span className={`font-mono text-sm font-bold ${streakTone}`}>{entry.streak}</span>

      <span className="hidden md:block text-slate-600 transition-all group-hover:text-primary-brand group-hover:translate-x-1">→</span>
    </Link>
  );
}
