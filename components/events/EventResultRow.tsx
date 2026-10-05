"use client";

import { useCallback, useState } from "react";
import { EventBracketMatch, EventBracketTeam } from "@/types";
import { RotateCwIcon } from "@/components/ui/Icons";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface EventResultRowProps {
  match: EventBracketMatch;
  teams: EventBracketTeam[];
  onReport: (
    matchId: string,
    winnerId: string,
    scoreA: number,
    scoreB: number,
  ) => Promise<void>;
  /** Clears a reported result. Omit to hide the undo control. */
  onUndo?: (matchId: string) => Promise<void>;
  /** True once the winner has played their next match; undo that one first. */
  undoBlocked?: boolean;
}

const needed = (bestOf: number) => Math.floor(bestOf / 2) + 1;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

export default function EventResultRow({
  match,
  teams,
  onReport,
  onUndo,
  undoBlocked = false,
}: EventResultRowProps) {
  const toWin = needed(match.bestOf);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [undoError, setUndoError] = useState<string | null>(null);
  const closeConfirm = useCallback(() => {
    setConfirming(false);
    setUndoError(null);
  }, []);

  const nameOf = (id: string | null) =>
    id ? (teams.find((t) => t.id === id)?.name ?? "Unknown") : "TBD";

  const ready = !!match.teamAId && !!match.teamBId && !match.isBye;
  const done = !!match.winnerId;

  // A finished series: one side reached the target, the other is below it.
  const valid =
    Math.max(scoreA, scoreB) === toWin && Math.min(scoreA, scoreB) < toWin;
  const leader = !valid ? null : scoreA > scoreB ? "A" : "B";

  // Clicking a squad makes it the winner; the other keeps its games, capped.
  const pickWinner = (side: "A" | "B") => {
    setError(null);
    if (side === "A") {
      setScoreA(toWin);
      setScoreB((b) => Math.min(b, toWin - 1));
    } else {
      setScoreB(toWin);
      setScoreA((a) => Math.min(a, toWin - 1));
    }
  };

  const step = (side: "A" | "B", delta: number) => {
    setError(null);
    const set = side === "A" ? setScoreA : setScoreB;
    set((v) => Math.max(0, Math.min(toWin, v + delta)));
  };

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

  const undo = async () => {
    if (!onUndo) return;
    setBusy(true);
    setUndoError(null);
    try {
      await onUndo(match.id);
      setConfirming(false);
      setScoreA(0);
      setScoreB(0);
    } catch (err) {
      setUndoError(err instanceof Error ? err.message : "Could not undo it.");
    } finally {
      setBusy(false);
    }
  };

  const tag = (
    <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-slate-400">
      R{match.round}·{match.slot + 1}
    </span>
  );

  const side = (which: "A" | "B") => {
    const id = which === "A" ? match.teamAId : match.teamBId;
    const score = which === "A" ? scoreA : scoreB;
    const winning = leader === which;
    const losing = leader !== null && !winning;
    const name = nameOf(id);

    return (
      <div
        className={`flex items-center gap-2 rounded-xl border p-1.5 transition-all duration-200 ${
          which === "B" ? "flex-row-reverse" : ""
        } ${
          winning
            ? "border-primary-brand/60 bg-primary-brand/[0.12] shadow-[0_0_24px_-8px_rgba(var(--game-glow-rgb),0.8)]"
            : losing
              ? "border-white/[0.06] bg-black/30 opacity-70"
              : "border-white/10 bg-black/30"
        }`}
      >
        <button
          type="button"
          onClick={() => pickWinner(which)}
          disabled={busy}
          title={`${name} wins`}
          className={`group flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${
            which === "B" ? "flex-row-reverse text-right" : "text-left"
          } hover:bg-white/[0.05]`}
        >
          <span
            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg font-display text-xs font-black transition-colors ${
              winning
                ? "bg-primary-brand text-[var(--game-btn-text,#fff)]"
                : "bg-white/[0.06] text-slate-300 group-hover:bg-white/10"
            }`}
          >
            {initials(name)}
          </span>
          <span className="min-w-0">
            <span className={`block truncate text-sm font-semibold ${winning ? "text-white" : "text-slate-200"}`}>
              {name}
            </span>
            <span
              className={`block text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${
                winning ? "text-primary-brand" : "text-slate-600 group-hover:text-slate-400"
              }`}
            >
              {winning ? "Winner" : "Pick winner"}
            </span>
          </span>
        </button>

        {/* Stepper: only meaningful past a best of 1 */}
        {match.bestOf > 1 ? (
          <div className={`flex items-center gap-1 ${which === "B" ? "flex-row-reverse" : ""}`}>
            <button
              type="button"
              onClick={() => step(which, -1)}
              disabled={busy || score === 0}
              aria-label={`Lower ${name}'s score`}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/[0.06] active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              −
            </button>
            <span
              aria-live="polite"
              className={`w-8 text-center font-display text-2xl font-black tabular-nums leading-none ${
                winning ? "text-primary-brand" : "text-white"
              }`}
            >
              {score}
            </span>
            <button
              type="button"
              onClick={() => step(which, 1)}
              disabled={busy || score >= toWin}
              aria-label={`Raise ${name}'s score`}
              className="w-7 h-7 flex items-center justify-center rounded-md border border-white/10 text-slate-400 hover:text-white hover:border-white/25 hover:bg-white/[0.06] active:scale-90 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              +
            </button>
          </div>
        ) : (
          <span
            className={`w-8 text-center font-display text-2xl font-black tabular-nums leading-none ${
              winning ? "text-primary-brand" : "text-slate-600"
            }`}
          >
            {score}
          </span>
        )}
      </div>
    );
  };

  // Reported or waiting: a single compact line.
  if (done || !ready) {
    return (
      <div
        className={`rounded-xl border px-4 py-3 ${
          done ? "border-white/[0.06] bg-black/25" : "border-white/[0.04] bg-black/15"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            {tag}
            <span className={`truncate font-semibold ${done ? "text-slate-400" : "text-slate-500"}`}>
              {nameOf(match.teamAId)} <span className="text-slate-600">v</span> {nameOf(match.teamBId)}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
              {match.isBye ? "bye" : `Bo${match.bestOf}`}
            </span>
          </div>

          {done ? (
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Winner</span>
                {nameOf(match.winnerId)}
                {match.scoreA !== null && (
                  <span className="font-display font-black tabular-nums">
                    {match.scoreA}–{match.scoreB}
                  </span>
                )}
              </span>
              {onUndo && !match.isBye && (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  disabled={undoBlocked || busy}
                  title={undoBlocked ? "The next match already has a result. Undo that one first." : "Undo this result"}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 hover:text-amber-200 hover:border-amber-400/40 hover:bg-amber-500/10 disabled:opacity-35 disabled:pointer-events-none transition"
                >
                  <RotateCwIcon className="w-3 h-3 -scale-x-100" />
                  Undo
                </button>
              )}
            </span>
          ) : (
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
              {match.isBye ? "advances automatically" : "waiting on earlier round"}
            </span>
          )}
        </div>

        <ConfirmDialog
          isOpen={confirming}
          title="Undo result?"
          message={
            <>
              <span className="font-semibold text-white">{nameOf(match.winnerId)}</span>
              {match.scoreA !== null ? ` (${match.scoreA}-${match.scoreB})` : ""} will be removed as the
              winner of {nameOf(match.teamAId)} v {nameOf(match.teamBId)}. You can report it again right after.
            </>
          }
          details={[
            "The score for this match is cleared",
            "The winner is taken back out of the next round",
          ]}
          confirmLabel="Undo result"
          busyLabel="Undoing…"
          busy={busy}
          error={undoError}
          onConfirm={undo}
          onCancel={closeConfirm}
        />
      </div>
    );
  }

  // Playable: pick the winner (and series score) with taps, then report.
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3 sm:p-4 transition-colors hover:border-primary-brand/30">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          {tag}
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Up next
          </span>
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-slate-500">
          Best of {match.bestOf}
          {match.bestOf > 1 && ` · first to ${toWin}`}
        </span>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto] md:items-center">
        {side("A")}
        <span className="hidden md:block px-1 text-center font-display text-xs font-black uppercase text-slate-600">
          vs
        </span>
        {side("B")}
        <button
          type="button"
          onClick={submit}
          disabled={busy || !valid}
          className="game-theme-btn h-11 px-6 gap-2 text-xs disabled:opacity-35 disabled:pointer-events-none disabled:grayscale"
        >
          {busy ? "Saving…" : "Report"}
          {!busy && <span>→</span>}
        </button>
      </div>

      <p className="mt-2 min-h-[1rem] text-[11px] text-slate-500">
        {error ? (
          <span className="text-rose-300">{error}</span>
        ) : valid ? (
          <>
            <span className="text-white font-semibold">{nameOf(leader === "A" ? match.teamAId : match.teamBId)}</span>{" "}
            wins {Math.max(scoreA, scoreB)}–{Math.min(scoreA, scoreB)}. Report to advance them.
          </>
        ) : match.bestOf > 1 ? (
          `Tap the winning squad, then adjust the games with − / +. The winner needs ${toWin}.`
        ) : (
          "Tap the winning squad."
        )}
      </p>
    </div>
  );
}
