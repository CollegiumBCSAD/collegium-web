"use client";

import { EventBracket, EventBracketMatch } from "@/types";

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

export default function EventBracketView({ bracket }: EventBracketViewProps) {
  const names = new Map(bracket.teams.map((team) => [team.id, team.name]));
  const rounds = [...new Set(bracket.matches.map((m) => m.round))].sort(
    (a, b) => a - b,
  );
  const totalRounds = rounds.length ? Math.max(...rounds) : 0;

  const side = (match: EventBracketMatch, isTeamA: boolean) => {
    const id = isTeamA ? match.teamAId : match.teamBId;
    const score = isTeamA ? match.scoreA : match.scoreB;
    const won = !!match.winnerId && match.winnerId === id;

    const label = id
      ? (names.get(id) ?? "Unknown squad")
      : match.isBye
        ? "Bye"
        : "TBD";

    return (
      <div
        className={`flex items-center justify-between gap-3 px-3 py-2 ${
          won ? "bg-primary-brand/15" : ""
        }`}
      >
        <span
          className={`truncate text-sm ${
            id ? (won ? "text-white font-medium" : "text-white/70") : "text-white/30"
          }`}
        >
          {label}
        </span>
        {score !== null && (
          <span className="shrink-0 font-mono text-sm tabular-nums text-white/80">
            {score}
          </span>
        )}
      </div>
    );
  };

  if (bracket.matches.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm text-white/50">
          The bracket has not been drawn yet. It appears once the organizer
          locks sign-ups.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-5 min-w-max pb-2">
        {rounds.map((round) => (
          <section key={round} className="flex flex-col gap-3 w-60">
            <h3 className="font-display text-[11px] tracking-[0.16em] uppercase text-white/40">
              {roundLabel(round, totalRounds)}
            </h3>

            {bracket.matches
              .filter((match) => match.round === round)
              .map((match) => (
                <article
                  key={match.id}
                  className="rounded-lg border border-white/10 bg-black/30 overflow-hidden divide-y divide-white/5"
                >
                  {side(match, true)}
                  {side(match, false)}
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/25">
                    {match.isBye ? "Bye" : `Best of ${match.bestOf}`}
                  </p>
                </article>
              ))}
          </section>
        ))}
      </div>
    </div>
  );
}
