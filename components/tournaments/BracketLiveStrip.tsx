"use client";

import { BracketLiveStripProps, BracketMatch, TournamentStream } from "@/types";
import { matchLabels } from "@/lib/bracket";

type LiveEntry = { match: BracketMatch; label: string; round: string; stream?: TournamentStream };

/**
 * One calm "what's happening now" line above the bracket: every live match by
 * its bracket number (so it can be found in the tree), the ones on a stream
 * first with a one-click Watch, and a key for the markers used on the cards.
 */
export default function BracketLiveStrip({ mainRounds, losersRounds, streams, onWatch, onOpenMatch }: BracketLiveStripProps) {
  const liveStreams = streams.filter((s) => s.isLive);
  const streamFor = (matchId: string) => liveStreams.find((s) => s.matchId === matchId);

  const collect = (rounds: BracketLiveStripProps["mainRounds"], prefix: string): LiveEntry[] => {
    const labels = matchLabels(rounds);
    return rounds.flatMap((round, r) =>
      round.matches.flatMap((match, i) => {
        const stream = streamFor(match.id);
        if (match.status !== "LIVE" && !stream) return [];
        return [{ match, label: `${prefix}${labels[r][i]}`, round: round.name, stream }];
      }),
    );
  };

  const live = [...collect(mainRounds, ""), ...collect(losersRounds, "LB ")].sort(
    (a, b) => Number(Boolean(b.stream)) - Number(Boolean(a.stream)),
  );
  if (live.length === 0 && liveStreams.length === 0) return null;

  return (
    <div className="shrink-0 z-20 border-b border-white/[0.06] bg-[#0B0F1A] px-4 sm:px-6 md:px-8 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-rose-300 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          Live now
          {live.length > 0 && <span className="text-slate-500">· {live.length}</span>}
        </span>

        <ul className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {live.map(({ match, label, round, stream }) => (
            <li key={match.id} className="shrink-0">
              <button
                type="button"
                onClick={() => (stream ? onWatch(stream.id) : onOpenMatch(match))}
                title={stream ? `Watch ${match.team1.name} vs ${match.team2.name}` : `${round} · open match details`}
                className={`flex items-center gap-2 h-8 pl-1 pr-3 border text-left transition-colors ${
                  stream
                    ? "border-primary-brand/60 bg-primary-brand/15 hover:bg-primary-brand/25"
                    : "border-white/10 bg-white/[0.03] hover:border-white/25"
                }`}
              >
                <span
                  className={`h-6 px-1.5 flex items-center font-mono text-[10px] font-black ${
                    stream ? "bg-primary-brand text-[var(--game-btn-text,#fff)]" : "bg-white/[0.08] text-slate-300"
                  }`}
                >
                  {label}
                </span>
                <span className="font-display text-[12px] font-black uppercase tracking-wide text-white whitespace-nowrap">
                  {match.team1.name}
                  <span className="mx-1.5 font-mono text-[10px] font-bold text-slate-500">vs</span>
                  {match.team2.name}
                </span>
                {stream && (
                  <span className="font-mono text-[9px] font-black uppercase tracking-widest text-primary-brand whitespace-nowrap">
                    ▶ Watch
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden xl:flex items-center gap-3 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 bg-primary-brand" /> On stream
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Live
            </span>
          </span>
          {streams.length > 0 && (
            <button type="button" onClick={() => onWatch()} className="game-theme-btn !rounded-none h-8 px-4 gap-2 text-[11px]">
              {liveStreams.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />}
              {liveStreams.length > 1 ? `Watch ${liveStreams.length} streams` : "Watch stream"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
