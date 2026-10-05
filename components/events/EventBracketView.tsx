"use client";

import type { CSSProperties, ReactNode } from "react";
import { EventBracket, EventBracketMatch } from "@/types";
import { CrownIcon, SwordsIcon, TrophyIcon } from "@/components/ui/Icons";

interface EventBracketViewProps {
  bracket: EventBracket;
}

const roundLabel = (round: number, totalRounds: number) => {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinals";
  if (fromEnd === 2) return "Quarterfinals";
  return `Round ${round}`;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

// Horizontal gap between columns is 3rem; feeder lines meet halfway.
const HALF_GAP = "1.5rem";
const FULL_GAP = "3rem";
const LIT = "bg-primary-brand shadow-[0_0_10px_var(--primary-brand)]";
const DIM = "bg-white/[0.12]";

/** Staggered entrance per column. */
const enter = (index: number): CSSProperties => ({
  animation: `pageSlideIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) ${index * 110}ms both`,
});

export default function EventBracketView({ bracket }: EventBracketViewProps) {
  const names = new Map(bracket.teams.map((team) => [team.id, team.name]));
  const seeds = new Map(bracket.teams.map((team) => [team.id, team.seed]));
  const rounds = [...new Set(bracket.matches.map((m) => m.round))].sort(
    (a, b) => a - b,
  );
  const totalRounds = rounds.length ? Math.max(...rounds) : 0;
  const final = bracket.matches.find((m) => m.round === totalRounds);
  const championId = final?.winnerId ?? null;
  const champion = championId ? (names.get(championId) ?? "Unknown squad") : null;

  const side = (match: EventBracketMatch, isTeamA: boolean) => {
    const id = isTeamA ? match.teamAId : match.teamBId;
    const score = isTeamA ? match.scoreA : match.scoreB;
    const won = !!match.winnerId && match.winnerId === id;
    const lost = !!match.winnerId && !!id && !won;
    const seed = id ? seeds.get(id) : null;
    const isChampion = won && id === championId && match.round === totalRounds;

    const label = id
      ? (names.get(id) ?? "Unknown squad")
      : match.isBye
        ? "Bye"
        : "TBD";

    return (
      <div
        className={`relative flex items-center gap-2.5 px-3 h-11 transition-colors ${
          won ? "bg-gradient-to-r from-primary-brand/25 via-primary-brand/[0.08] to-transparent" : ""
        }`}
      >
        {won && (
          <span aria-hidden className="absolute left-0 inset-y-0 w-[3px] bg-primary-brand shadow-[0_0_12px_var(--primary-brand)]" />
        )}
        <span
          className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md font-display text-[10px] font-black transition-colors ${
            !id
              ? "border border-dashed border-white/10 text-slate-700"
              : won
                ? "bg-primary-brand text-[var(--game-btn-text,#fff)] shadow-[0_0_14px_-2px_var(--primary-brand)]"
                : lost
                  ? "bg-white/[0.04] text-slate-600"
                  : "bg-white/[0.08] text-slate-200"
          }`}
        >
          {id ? initials(label) : "–"}
        </span>
        <span
          className={`flex-1 truncate text-sm ${
            !id
              ? "italic text-slate-600"
              : won
                ? "font-bold text-white"
                : lost
                  ? "text-slate-500 line-through decoration-white/20"
                  : "text-slate-200"
          }`}
        >
          {label}
          {seed != null && <span className="ml-1.5 text-[9px] font-mono not-italic text-slate-600">#{seed}</span>}
        </span>
        {isChampion && <CrownIcon className="w-3.5 h-3.5 shrink-0 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]" />}
        {score !== null && (
          <span
            className={`shrink-0 min-w-[1.5rem] text-right font-display text-xl font-black tabular-nums leading-none ${
              won ? "text-primary-brand drop-shadow-[0_0_8px_var(--primary-brand)]" : "text-slate-600"
            }`}
          >
            {score}
          </span>
        )}
      </div>
    );
  };

  if (bracket.matches.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 py-16 px-6 text-center">
        <SwordsIcon className="w-7 h-7 mx-auto text-slate-600" />
        <h3 className="mt-3 font-display text-lg font-black uppercase text-white">
          Bracket not drawn yet
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          The bracket has not been drawn yet. It appears once the organizer
          locks sign-ups.
        </p>
      </div>
    );
  }

  // Shared column header: big outlined index, label, progress.
  const header = (opts: {
    index: string;
    label: string;
    sub: string;
    tone: "brand" | "plain" | "gold" | "muted";
    icon?: ReactNode;
  }) => (
    <div className="mb-4">
      <div className="flex items-end gap-3">
        <span
          className={`font-display text-4xl font-black leading-none tabular-nums text-transparent ${
            opts.tone === "brand"
              ? "[-webkit-text-stroke:1px_var(--primary-brand)]"
              : opts.tone === "gold"
                ? "[-webkit-text-stroke:1px_rgba(252,211,77,0.8)]"
                : "[-webkit-text-stroke:1px_rgba(148,163,184,0.35)]"
          }`}
        >
          {opts.index}
        </span>
        <div className="min-w-0 pb-0.5">
          <h3
            className={`flex items-center gap-1.5 font-display text-sm font-black uppercase tracking-wide leading-none ${
              opts.tone === "brand"
                ? "text-primary-brand"
                : opts.tone === "gold"
                  ? "text-amber-300"
                  : opts.tone === "muted"
                    ? "text-slate-400"
                    : "text-white"
            }`}
          >
            {opts.icon}
            {opts.label}
          </h3>
          <span className="mt-1 block text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">
            {opts.sub}
          </span>
        </div>
      </div>
      <div
        className={`mt-3 h-px bg-gradient-to-r to-transparent ${
          opts.tone === "gold" ? "from-amber-300/40" : opts.tone === "brand" ? "from-primary-brand/50" : "from-white/15"
        }`}
      />
    </div>
  );

  return (
    <div className="relative rounded-2xl border border-white/[0.07] bg-[#090C14] bg-[radial-gradient(rgba(100,116,160,0.13)_1px,transparent_1px)] bg-[size:12px_12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_40px_-24px_rgba(0,0,0,0.9)]">
      {/* Ambient light, clipped to the panel so it never creates scroll */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <span className="absolute -left-24 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary-brand/10 blur-[90px]" />
        {champion && (
          <span className="absolute -right-16 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-400/10 blur-[100px]" />
        )}
      </div>

      {/* Scrolls sideways only when the screen is too narrow; otherwise centred */}
      <div className="relative overflow-x-auto overflow-y-hidden [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
        <div
          className="grid gap-12 justify-center p-6 sm:p-8"
          style={{
            gridTemplateColumns: `repeat(${rounds.length}, minmax(15rem, 22rem)) minmax(13rem, 18rem)`,
          }}
        >
          {rounds.map((round, idx) => {
            const isFirst = round === rounds[0];
            const isFinal = round === totalRounds;
            const matches = bracket.matches
              .filter((match) => match.round === round)
              .sort((a, b) => a.slot - b.slot);
            const played = matches.filter((m) => m.winnerId && !m.isBye).length;

            return (
              <section key={round} className="flex flex-col min-w-0" style={enter(idx)}>
                {header({
                  index: String(idx + 1).padStart(2, "0"),
                  label: roundLabel(round, totalRounds),
                  sub: `${played}/${matches.length} played`,
                  tone: isFinal ? "brand" : "plain",
                  icon: isFinal ? <CrownIcon className="w-3.5 h-3.5" /> : undefined,
                })}

                <div className="flex flex-1 flex-col">
                  {matches.map((match, i) => {
                    const isTop = i % 2 === 0;
                    const hasPair = matches.length > 1;
                    const done = !!match.winnerId;
                    const fed = !!match.teamAId || !!match.teamBId;
                    const live = !done && !!match.teamAId && !!match.teamBId && !match.isBye;

                    const card = (
                      <article
                        className={`relative w-full overflow-hidden rounded-xl bg-[#0B0F19] divide-y divide-white/[0.05] transition-all duration-300 ${
                          isFinal
                            ? "rounded-[11px]"
                            : `border ${
                                live
                                  ? "border-amber-400/30 shadow-[0_0_24px_-12px_rgba(251,191,36,0.6)]"
                                  : done
                                    ? "border-white/[0.08]"
                                    : "border-white/[0.06]"
                              } hover:border-white/25`
                        }`}
                      >
                        {side(match, true)}
                        {side(match, false)}
                        <p className="flex items-center justify-between px-3 py-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-600 bg-black/30">
                          <span>{match.isBye ? "Bye" : `Best of ${match.bestOf}`}</span>
                          <span
                            className={`flex items-center gap-1.5 ${
                              done ? "text-emerald-400/80" : live ? "text-amber-300" : ""
                            }`}
                          >
                            {live && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                            {done ? "Final score" : match.isBye ? "" : live ? "Up next" : "Waiting"}
                          </span>
                        </p>
                      </article>
                    );

                    return (
                      <div key={match.id} className="relative flex-1 flex items-center py-3">
                        {/* Line in from the previous round */}
                        {!isFirst && (
                          <span
                            aria-hidden
                            className={`absolute top-1/2 h-px transition-colors duration-500 ${fed ? LIT : DIM}`}
                            style={{ left: `-${HALF_GAP}`, width: HALF_GAP }}
                          />
                        )}
                        {/* Line out toward the next round; each match owns its half of the join */}
                        {!isFinal && (
                          <>
                            <span
                              aria-hidden
                              className={`absolute top-1/2 h-px transition-colors duration-500 ${done ? LIT : DIM}`}
                              style={{ right: `-${HALF_GAP}`, width: HALF_GAP }}
                            />
                            {hasPair && (
                              <span
                                aria-hidden
                                className={`absolute w-px transition-colors duration-500 ${done ? LIT : DIM} ${
                                  isTop ? "top-1/2 bottom-0" : "top-0 bottom-1/2"
                                }`}
                                style={{ right: `-${HALF_GAP}` }}
                              />
                            )}
                          </>
                        )}
                        {/* Final → champion */}
                        {isFinal && (
                          <span
                            aria-hidden
                            className={`absolute top-1/2 h-px ${
                              done ? "bg-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]" : DIM
                            }`}
                            style={{ right: `-${FULL_GAP}`, width: FULL_GAP }}
                          />
                        )}

                        {isFinal ? (
                          // Rotating light around the final's border.
                          <div className="relative w-full overflow-hidden rounded-xl p-px shadow-[0_0_40px_-12px_rgba(var(--game-glow-rgb),0.8)]">
                            <span
                              aria-hidden
                              className="absolute inset-[-150%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_65%,var(--primary-brand)_82%,rgba(255,255,255,0.9)_86%,var(--primary-brand)_90%,transparent_100%)]"
                            />
                            <span aria-hidden className="absolute inset-0 rounded-xl border border-primary-brand/30" />
                            {card}
                          </div>
                        ) : (
                          card
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* Champion */}
          <section className="flex flex-col min-w-0" style={enter(rounds.length)}>
            {header({
              index: "★",
              label: "Champion",
              sub: champion ? "Crowned" : "Awaiting final",
              tone: champion ? "gold" : "muted",
              icon: <TrophyIcon className="w-3.5 h-3.5" />,
            })}

            <div className="flex flex-1 items-center py-3">
              {champion ? (
                <div className="relative w-full overflow-hidden rounded-2xl border border-amber-300/40 bg-gradient-to-b from-amber-400/[0.14] via-[#0B0F19] to-[#0B0F19] px-5 py-6 text-center shadow-[0_0_50px_-14px_rgba(251,191,36,0.7)]">
                  <span aria-hidden className="absolute inset-x-0 -top-10 mx-auto h-24 w-24 rounded-full bg-amber-300/30 blur-2xl" />
                  <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
                  <div className="relative mx-auto w-14 h-14 flex items-center justify-center rounded-2xl border border-amber-300/50 bg-amber-400/15 text-amber-300 shadow-[0_0_24px_-4px_rgba(251,191,36,0.7)] animate-[pulse_3s_ease-in-out_infinite]">
                    <TrophyIcon className="w-7 h-7" />
                  </div>
                  <p className="relative mt-4 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-amber-300/90">
                    Champion
                  </p>
                  <p className="relative mt-1 font-display text-2xl font-black uppercase leading-tight text-white break-words drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]">
                    {champion}
                  </p>
                  {final && final.scoreA !== null && final.scoreB !== null && (
                    <p className="relative mt-2 text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Won the final{" "}
                      <span className="text-white font-bold">
                        {Math.max(final.scoreA, final.scoreB)}–{Math.min(final.scoreA, final.scoreB)}
                      </span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full rounded-2xl border border-dashed border-white/10 bg-black/20 px-5 py-6 text-center">
                  <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-slate-600">
                    <TrophyIcon className="w-7 h-7" />
                  </div>
                  <p className="mt-4 text-[9px] font-mono font-bold uppercase tracking-[0.3em] text-slate-500">
                    Champion
                  </p>
                  <p className="mt-1 font-display text-lg font-black uppercase text-slate-500">TBD</p>
                  <p className="mt-1 text-[10px] font-mono uppercase tracking-widest text-slate-600">
                    Decided in the final
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
