"use client";

import { TournamentMatchHistoryProps } from "@/types";

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

export default function TournamentMatchHistory({ rounds }: TournamentMatchHistoryProps) {
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
    <div className="mt-8 space-y-3">
      <h3 className="font-display text-sm font-black uppercase tracking-widest text-white">
        Match results
      </h3>
      {completed.length === 0 ? (
        <p className="text-xs font-sans text-slate-400">No completed matches yet.</p>
      ) : (
        completed.map(({ match, roundName, playedAt }) => (
          <div
            key={match.id}
            className="p-4 bg-[#050711] border border-[#182338] flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <span className="font-display text-sm font-bold uppercase text-white block truncate">
                {match.team1.name} vs {match.team2.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {roundName}
                {playedAt ? ` · ${formatPlayedAt(playedAt)}` : ""}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 border shrink-0 bg-emerald-950/60 text-emerald-400 border-emerald-500/40">
              {match.team1.name} won
            </span>
          </div>
        ))
      )}
    </div>
  );
}
