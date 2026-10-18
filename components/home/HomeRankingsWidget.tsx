"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeRankingsWidgetProps, LeaderboardEntry } from "@/types";
import { universitiesService } from "@/services";
import { GAME_ID_TO_ENUM } from "@/lib/games";
import { GAME_ID_TO_DISPLAY, MEDALS, mapUniversitiesToLeaderboard } from "@/lib/rankings";
import HomePanel from "./HomePanel";
import HomeCrest from "./HomeCrest";

const TOP_N = 5;

/** The API returns one row per team; the board shows each school once, at its best team's rating. */
const bestPerUniversity = (entries: LeaderboardEntry[]) => {
  const seen = new Set<string>();
  return [...entries]
    .sort((a, b) => b.rating - a.rating)
    .filter((e) => !seen.has(e.id) && Boolean(seen.add(e.id)));
};

// Same source as /leaderboard: the server rates each school for the requested
// game, so wins/losses/streak are real rather than the all-games defaults.
export default function HomeRankingsWidget({ activeGame }: HomeRankingsWidgetProps) {
  const [loaded, setLoaded] = useState<{ game: string; entries: LeaderboardEntry[]; failed: boolean } | null>(null);
  const isLoading = loaded?.game !== activeGame;

  useEffect(() => {
    let cancelled = false;
    universitiesService
      .getUniversities(GAME_ID_TO_ENUM[activeGame])
      .then((unis) => {
        if (cancelled) return;
        const entries = bestPerUniversity(mapUniversitiesToLeaderboard(unis ?? [], GAME_ID_TO_DISPLAY[activeGame]));
        setLoaded({ game: activeGame, entries, failed: false });
      })
      .catch(() => !cancelled && setLoaded({ game: activeGame, entries: [], failed: true }));
    return () => {
      cancelled = true;
    };
  }, [activeGame]);

  const items = isLoading ? [] : loaded.entries.slice(0, TOP_N);

  return (
    <HomePanel title="Power Rankings" href="/leaderboard" hrefLabel="Full board">
      {isLoading ? (
        <ul aria-busy className="divide-y divide-white/[0.04]">
          {Array.from({ length: TOP_N }, (_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.05]" />
              <div className="h-3 flex-1 animate-pulse rounded bg-white/[0.05]" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="px-4 py-10 text-center text-xs text-slate-500">
          {loaded.failed ? "Rankings are unavailable right now." : "No rated universities yet."}
        </p>
      ) : (
        <ol className="divide-y divide-white/[0.04]">
          {items.map((e, i) => {
            const medal = MEDALS[i + 1];
            const played = (e.wins ?? 0) + (e.losses ?? 0) > 0;
            const streakColor = e.streak.endsWith("W") ? "text-emerald-400" : e.streak.endsWith("L") ? "text-rose-400" : "text-slate-500";
            return (
              <li key={e.id}>
                <Link
                  href={`/university/${e.id}`}
                  className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]"
                  style={i === 0 ? { background: `linear-gradient(90deg, rgba(${medal.rgb},0.10), transparent 70%)` } : undefined}
                >
                  <span
                    className="w-4 shrink-0 text-center font-display text-base font-black tabular-nums"
                    style={{ color: medal?.color ?? "#475569" }}
                  >
                    {i + 1}
                  </span>
                  <HomeCrest name={e.university} domain={e.domain} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-sans text-[13px] font-bold uppercase leading-tight text-slate-100 transition-colors group-hover:text-white">
                      {e.university}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-slate-500">
                      <span className={`font-bold ${streakColor}`}>{e.streak}</span>
                      <span className="text-slate-700">/</span>
                      <span>{played ? `${e.wins}–${e.losses} · ${e.winRate}%` : "Unplayed"}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-display text-lg font-black leading-none tabular-nums text-white">{e.rating.toFixed(0)}</span>
                    <span
                      className={`mt-1 block font-mono text-[8px] font-bold uppercase tracking-widest ${e.isProvisional ? "text-amber-400/70" : "text-slate-500"}`}
                      title={e.isProvisional ? "Provisional: still calibrating" : undefined}
                    >
                      {e.isProvisional ? "Prov." : "Rating"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </HomePanel>
  );
}
