"use client";

import { useMemo } from "react";
import { BracketTreeProps } from "@/types";
import { matchLabels, projectToFinal, slotCounts } from "@/lib/bracket";
import { CrownIcon, TrophyIcon } from "@/components/ui/Icons";
import BracketMatchCard from "./BracketMatchCard";

const GAP = 56; // px between round columns; connectors live in this gutter
const GAP_COMPACT = 36;
const LINE = "border-white/15";
const LINE_DONE = "border-primary-brand/70";

// Rounds are laid out as equal-height columns split into slots. Slot counts
// halve each round, so every match sits exactly between the pair feeding it,
// and elbows drawn in the gutter join them.
export default function BracketTree({
  rounds: inputRounds,
  onViewBoxScore,
  canReportResults,
  onReportResult,
  featuredMatchIds,
  projectToFinal: project,
  champion,
  compact,
}: BracketTreeProps) {
  const rounds = useMemo(() => (project ? projectToFinal(inputRounds) : inputRounds), [inputRounds, project]);
  const labels = useMemo(() => matchLabels(rounds), [rounds]);
  const slots = useMemo(() => slotCounts(rounds), [rounds]);

  const gap = compact ? GAP_COMPACT : GAP;
  const slotHeight = compact ? 128 : canReportResults ? 156 : 124;
  const height = Math.max(...slots) * slotHeight;
  const showChampion = champion !== undefined;

  return (
    <div className="flex min-w-max select-none" style={{ gap }}>
      {rounds.map((round, r) => {
        const count = slots[r];
        const halves = r + 1 < rounds.length && slots[r + 1] * 2 === count;
        const isLast = r === rounds.length - 1;
        const isFinal = isLast && round.matches.length === 1;
        const cells = Array.from({ length: count }, (_, i) => round.matches[i]);
        const pairs = halves
          ? Array.from({ length: count / 2 }, (_, k) => [cells[2 * k], cells[2 * k + 1]] as const)
          : cells.map((c) => [c, undefined] as const);

        return (
          <div key={`${round.name}-${r}`} className="flex flex-col">
            <div className="h-12 mb-2 flex flex-col items-center justify-center">
              <span
                className={`px-3 py-1 font-display text-xs font-black uppercase tracking-[0.2em] ${
                  isFinal ? "text-[var(--game-btn-text,#fff)] bg-primary-brand shadow-[0_0_20px_-4px_rgba(var(--game-glow-rgb),0.8)]" : "text-slate-200 bg-white/[0.05] border border-white/10"
                }`}
              >
                {round.name}
              </span>
              <span className="mt-1 text-[9px] font-mono uppercase tracking-widest text-slate-600">
                {round.isProjected ? "Pending" : `${round.matches.length} ${round.matches.length === 1 ? "match" : "matches"}`}
              </span>
            </div>

            <div className="flex flex-col" style={{ height }}>
              {pairs.map(([top, bottom], k) => {
                const done = top?.status === "COMPLETED" && (!bottom || bottom.status === "COMPLETED");
                return (
                  <div key={k} className="relative flex-1 flex flex-col">
                    {[top, bottom].slice(0, halves ? 2 : 1).map((match, j) => {
                      const idx = halves ? 2 * k + j : k;
                      return (
                        <div key={j} className="relative flex-1 flex items-center justify-center">
                          {/* stub into this match from the previous round */}
                          {r > 0 && match && (
                            <span aria-hidden className={`absolute top-1/2 border-t ${LINE}`} style={{ left: -gap / 2, width: gap / 2 }} />
                          )}
                          {match && (
                            <BracketMatchCard
                              match={match}
                              label={labels[r][idx] ?? ""}
                              isPlaceholder={round.isProjected}
                              isFeatured={Boolean(featuredMatchIds?.includes(match.id))}
                              canReport={canReportResults}
                              compact={compact}
                              onOpen={() => onViewBoxScore(match)}
                              onReport={() => onReportResult?.(match)}
                            />
                          )}
                          {/* straight run-out when the next round doesn't halve */}
                          {!halves && match && (!isLast || showChampion) && (
                            <span aria-hidden className={`absolute top-1/2 border-t ${LINE}`} style={{ right: -gap / 2, width: gap / 2 }} />
                          )}
                        </div>
                      );
                    })}
                    {/* elbow joining the pair to the next round */}
                    {halves && top && (
                      <span
                        aria-hidden
                        className={`absolute border-r ${bottom ? "border-y top-1/4 bottom-1/4" : "border-t top-1/4 h-1/4"} ${done ? LINE_DONE : LINE}`}
                        style={{ right: -gap / 2, width: gap / 2 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {showChampion && (
        <div className="flex flex-col">
          <div className="h-12 mb-2 flex flex-col items-center justify-center">
            <span
              className={`px-3 py-1 font-display text-xs font-black uppercase tracking-[0.2em] ${
                champion
                  ? "text-[#1A1205] bg-gradient-to-b from-amber-200 to-amber-400 shadow-[0_0_22px_-2px_rgba(251,191,36,0.85)]"
                  : "text-amber-300/70 bg-amber-400/5 border border-amber-400/20"
              }`}
            >
              Champion
            </span>
            <span
              className={`mt-1 text-[9px] font-mono uppercase tracking-widest ${
                champion ? "text-amber-300 [text-shadow:0_0_10px_rgba(251,191,36,0.7)]" : "text-slate-600"
              }`}
            >
              {champion ? "Crowned" : "Awaiting final"}
            </span>
          </div>
          <div className="relative flex items-center" style={{ height }}>
            <span
              aria-hidden
              className={`absolute top-1/2 border-t ${champion ? "border-amber-300/80 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : LINE}`}
              style={{ left: -gap / 2, width: gap / 2 }}
            />
            <div
              className={`relative w-56 overflow-hidden px-5 py-7 text-center border ${
                champion
                  ? "border-amber-300/70 bg-gradient-to-b from-amber-400/20 via-[#120F0A] to-[#0B0E17] shadow-[0_0_60px_-8px_rgba(251,191,36,0.65),inset_0_0_30px_-12px_rgba(251,191,36,0.5)]"
                  : "border-white/10 bg-gradient-to-b from-[#141A2A] to-[#0B0E17]"
              }`}
            >
              {champion && (
                <>
                  {/* halo behind the trophy and a bright rim along the top edge */}
                  <span aria-hidden className="absolute inset-x-0 -top-12 mx-auto h-32 w-32 rounded-full bg-amber-300/35 blur-3xl" />
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-100 to-transparent" />
                  <span aria-hidden className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                </>
              )}
              <span
                className={`relative mx-auto w-14 h-14 flex items-center justify-center rounded-full border ${
                  champion
                    ? "border-amber-300/70 bg-amber-400/20 text-amber-200 shadow-[0_0_28px_-2px_rgba(251,191,36,0.9)] animate-[pulse_3s_ease-in-out_infinite]"
                    : "border-white/10 bg-white/[0.04] text-slate-500"
                }`}
              >
                <TrophyIcon className="w-7 h-7" />
              </span>
              <p
                className={`relative mt-4 font-display text-lg font-black uppercase leading-tight ${
                  champion ? "text-white [text-shadow:0_0_18px_rgba(251,191,36,0.55)]" : "text-slate-500"
                }`}
              >
                {champion || "To be decided"}
              </p>
              <p
                className={`relative mt-1.5 flex items-center justify-center gap-1 text-[9px] font-mono uppercase tracking-widest ${
                  champion ? "text-amber-300/90" : "text-slate-500"
                }`}
              >
                {champion && <CrownIcon className="w-3 h-3 text-amber-300" />}
                {champion ? "Tournament champion" : "Winner of the grand final"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
