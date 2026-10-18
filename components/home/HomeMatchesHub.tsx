"use client";

import { useEffect, useMemo, useState } from "react";
import { HomeMatchesHubProps, HomeMatchItem } from "@/types";
import { matchesService } from "@/services/matchesService";
import { GAME_ID_TO_ENUM } from "@/lib/games";
import HomePanel from "./HomePanel";
import HomeMatchRow from "./HomeMatchRow";
import HomePagination from "./HomePagination";

export type { HomeMatchItem };

type StatusTab = "ALL" | "LIVE" | "UPCOMING" | "RESULTS";

const TABS: StatusTab[] = ["ALL", "LIVE", "UPCOMING", "RESULTS"];
const PAGE_SIZE = 10;
const API_STATUS = { ALL: undefined, LIVE: "LIVE", UPCOMING: "UPCOMING", RESULTS: "COMPLETED" } as const;

// Bracket matches often carry their date only as a "10/11/2026" timeLabel.
const matchDate = (m: HomeMatchItem) => {
  const d = new Date(m.playedAt ?? m.timeLabel ?? "");
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Consecutive matches that share a day sit under one date header, as on vlr.gg. */
const groupByDay = (matches: HomeMatchItem[]) => {
  const groups: { label: string; items: HomeMatchItem[] }[] = [];
  for (const m of matches) {
    const d = matchDate(m);
    const label =
      m.status === "LIVE"
        ? "Live now"
        : d
          ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
          : "Date to be announced";
    const last = groups[groups.length - 1];
    if (last?.label === label) last.items.push(m);
    else groups.push({ label, items: [m] });
  }
  return groups;
};

export default function HomeMatchesHub({ matches: fallback = [], domains, activeGame, onOpenBoxScore }: HomeMatchesHubProps) {
  const [tab, setTab] = useState<StatusTab>("ALL");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<{ key: string; matches: HomeMatchItem[]; total: number; pages: number } | null>(null);

  const key = `${activeGame}|${tab}|${page}`;
  const isLoading = result?.key !== key;

  useEffect(() => {
    let cancelled = false;

    // Used when the matches API is down or empty: page through the bracket data
    // the home page already loaded.
    const fromProps = () => {
      const status = API_STATUS[tab];
      const filtered = fallback.filter(
        (m) =>
          (!m.gameId || m.gameId === activeGame) &&
          (!m.matchMode || m.matchMode === "TOURNAMENT") &&
          (!status || m.status === status),
      );
      const start = (page - 1) * PAGE_SIZE;
      return {
        key,
        matches: filtered.slice(start, start + PAGE_SIZE),
        total: filtered.length,
        pages: Math.ceil(filtered.length / PAGE_SIZE) || 1,
      };
    };

    matchesService
      // Home only shows tournament matches; scrims live on the athlete's /scrims page.
      .getMatches({ page, limit: PAGE_SIZE, gameTitle: GAME_ID_TO_ENUM[activeGame], status: API_STATUS[tab], matchMode: "TOURNAMENT" })
      .then((res) =>
        res?.matches?.length
          ? { key, matches: res.matches, total: res.total, pages: res.totalPages || Math.ceil(res.total / PAGE_SIZE) || 1 }
          : fromProps(),
      )
      .catch(fromProps)
      .then((next) => !cancelled && setResult(next));

    return () => {
      cancelled = true;
    };
  }, [activeGame, tab, page, key, fallback]);

  const groups = useMemo(() => groupByDay(result?.matches ?? []), [result]);

  const tabs = (
    <div className="flex items-center gap-0.5 rounded-lg bg-black/30 p-0.5" role="tablist" aria-label="Match status">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={tab === t}
          onClick={() => {
            setTab(t);
            setPage(1);
          }}
          className={`rounded-md px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
            tab === t ? "bg-white/[0.08] text-white" : "text-slate-500 hover:text-slate-200"
          }`}
        >
          {t === "LIVE" && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary-brand align-middle" />}
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <HomePanel title="Matches" live badge={result ? `${result.total}` : undefined} actions={tabs}>
      {isLoading ? (
        <div aria-busy className="divide-y divide-white/[0.04]">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-3 w-10 animate-pulse rounded bg-white/[0.05]" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-2/3 animate-pulse rounded bg-white/[0.05]" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-white/[0.05]" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-display text-base font-black uppercase tracking-wider text-slate-300">
            No {tab !== "ALL" ? tab.toLowerCase() : ""} matches
          </p>
          <p className="mt-1 text-xs text-slate-500">Fixtures appear here as tournament brackets are seeded.</p>
        </div>
      ) : (
        groups.map((g) => (
          <div key={g.label}>
            <h3 className="flex items-center justify-between border-y border-white/[0.04] bg-white/[0.02] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 first:border-t-0">
              <span className={g.label === "Live now" ? "text-primary-brand" : ""}>{g.label}</span>
              <span className="text-slate-600">
                {g.items.length} {g.items.length === 1 ? "match" : "matches"}
              </span>
            </h3>
            {g.items.map((m) => (
              <HomeMatchRow key={m.id} match={m} domains={domains} onOpenBoxScore={onOpenBoxScore} />
            ))}
          </div>
        ))
      )}

      <HomePagination page={page} totalPages={result?.pages ?? 1} total={result?.total ?? 0} onChange={setPage} />
    </HomePanel>
  );
}
