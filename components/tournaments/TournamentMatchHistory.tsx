"use client";

import { useState } from "react";
import { TournamentMatchHistoryProps } from "@/types";

const COLLAPSED_KEY = "collegium:matchHistory:collapsed";

function formatPlayedAt(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Remembered per browser so the panel stays out of the way once hidden.
function readCollapsed() {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function TournamentMatchHistory({ rounds }: TournamentMatchHistoryProps) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // Storage blocked: the toggle still works for this session.
      }
      return next;
    });
  };

  const completed = rounds
    .flatMap((round) =>
      round.matches
        .filter((match) => match.status === "COMPLETED")
        .map((match) => ({ match, roundName: round.name, playedAt: match.playedAt })),
    )
    .sort((a, b) => {
      const aTime = a.playedAt ? new Date(a.playedAt).getTime() : 0;
      const bTime = b.playedAt ? new Date(b.playedAt).getTime() : 0;
      return bTime - aTime;
    });

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={!collapsed}
        aria-controls="match-history-list"
        className="group w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-3">
          <h3 className="font-display text-sm font-black uppercase tracking-widest text-white">
            Match results
          </h3>
          <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-mono font-bold tabular-nums text-slate-400">
            {completed.length}
          </span>
        </span>
        <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors">
          {collapsed ? "Show" : "Hide"}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {!collapsed && (
        <div id="match-history-list" className="mt-3 space-y-2 animate-page-slide-in">
          {completed.length === 0 ? (
            <p className="text-xs font-sans text-slate-400">No completed matches yet.</p>
          ) : (
            completed.map(({ match, roundName, playedAt }) => {
              const team1Won =
                match.team1.isWinner ?? (match.team2.isWinner === undefined ? (match.team1.score ?? 0) >= (match.team2.score ?? 0) : !match.team2.isWinner);
              const winner = team1Won ? match.team1 : match.team2;
              const loser = team1Won ? match.team2 : match.team1;

              return (
                <div
                  key={match.id}
                  className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#0A0D16] pl-5 pr-4 py-3 flex items-center justify-between gap-4 hover:border-white/[0.14] transition-colors"
                >
                  <span aria-hidden className="absolute left-0 inset-y-0 w-[3px] bg-emerald-400/80" />
                  <div className="min-w-0">
                    <span className="block truncate font-display text-sm font-bold uppercase text-white">
                      {winner.name}
                      <span className="mx-2 text-slate-600 normal-case font-sans font-normal">def.</span>
                      <span className="text-slate-400">{loser.name}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
                      {roundName}
                      {playedAt ? ` · ${formatPlayedAt(playedAt)}` : ""}
                    </span>
                  </div>
                  <span className="shrink-0 font-display text-lg font-black tabular-nums leading-none">
                    <span className="text-emerald-400">{winner.score ?? "–"}</span>
                    <span className="mx-1 text-slate-600">–</span>
                    <span className="text-slate-500">{loser.score ?? "–"}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
