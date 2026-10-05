"use client";

import { useState } from "react";
import { EventBracketMatch, EventBracketTeam } from "@/types";

interface EventResultRowProps {
  match: EventBracketMatch;
  teams: EventBracketTeam[];
  onReport: (
    matchId: string,
    winnerId: string,
    scoreA: number,
    scoreB: number,
  ) => Promise<void>;
}

const needed = (bestOf: number) => Math.floor(bestOf / 2) + 1;

export default function EventResultRow({
  match,
  teams,
  onReport,
}: EventResultRowProps) {
  const [scoreA, setScoreA] = useState(needed(match.bestOf));
  const [scoreB, setScoreB] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameOf = (id: string | null) =>
    id ? (teams.find((t) => t.id === id)?.name ?? "Unknown") : "TBD";

  const ready = !!match.teamAId && !!match.teamBId && !match.isBye;
  const done = !!match.winnerId;

  const submit = async () => {
    if (!match.teamAId || !match.teamBId) return;
    setBusy(true);
    setError(null);
    try {
      const winnerId = scoreA > scoreB ? match.teamAId : match.teamBId;
      await onReport(match.id, winnerId, scoreA, scoreB);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-black/25 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="text-white/35 text-xs mr-2">
            R{match.round}·{match.slot + 1}
          </span>
          <span className={done ? "text-white/50" : "text-white"}>
            {nameOf(match.teamAId)} v {nameOf(match.teamBId)}
          </span>
          <span className="ml-2 text-xs text-white/30">
            {match.isBye ? "bye" : `Bo${match.bestOf}`}
          </span>
        </div>

        {done ? (
          <span className="text-sm text-emerald-200">
            {nameOf(match.winnerId)}
            {match.scoreA !== null && ` · ${match.scoreA}-${match.scoreB}`}
          </span>
        ) : ready ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              value={scoreA}
              onChange={(e) => setScoreA(Number(e.target.value))}
              aria-label="Score for the first squad"
              className="w-14 rounded-md bg-black/50 border border-white/10 px-2 py-1 text-sm text-white text-center tabular-nums"
            />
            <span className="text-white/30">–</span>
            <input
              type="number"
              min={0}
              value={scoreB}
              onChange={(e) => setScoreB(Number(e.target.value))}
              aria-label="Score for the second squad"
              className="w-14 rounded-md bg-black/50 border border-white/10 px-2 py-1 text-sm text-white text-center tabular-nums"
            />
            <button
              type="button"
              onClick={submit}
              disabled={busy || scoreA === scoreB}
              className="rounded-md bg-primary-brand px-3 py-1.5 text-xs text-[var(--game-btn-text,#fff)] hover:brightness-110 disabled:opacity-40 transition"
            >
              {busy ? "Saving…" : "Report"}
            </button>
          </div>
        ) : (
          <span className="text-xs text-white/25">
            {match.isBye ? "advances automatically" : "waiting on earlier round"}
          </span>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </div>
  );
}
