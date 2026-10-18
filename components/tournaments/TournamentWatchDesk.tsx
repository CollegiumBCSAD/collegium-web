"use client";

import { TournamentStream, TournamentWatchDeskProps } from "@/types";
import TournamentStreamPlayer from "./TournamentStreamPlayer";

// 1 stream fills the desk; 2 sit side by side; 3+ wrap into a 2-wide grid.
const GRID: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-1 xl:grid-cols-2" };

/**
 * Every live broadcast at once, or just one: picking a stream hides the rest,
 * and "All streams" brings them back. Live streams come first.
 */
export default function TournamentWatchDesk({ streams, matchNames, focusId, onFocus }: TournamentWatchDeskProps) {
  const ordered = [...streams].sort((a, b) => Number(b.isLive) - Number(a.isLive));
  const focused = ordered.find((s) => s.id === focusId) ?? null;
  const visible = focused ? [focused] : ordered;
  const multi = ordered.length > 1;

  const nameOf = (s: TournamentStream, i: number) =>
    s.label || (s.matchId && matchNames[s.matchId]) || `Stream ${i + 1}`;

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {multi && (
        <div className="shrink-0 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => onFocus(null)}
            className={`h-8 px-3 shrink-0 border font-mono text-[10px] font-black uppercase tracking-widest transition-colors ${
              !focused ? "border-primary-brand bg-primary-brand/15 text-white" : "border-white/10 text-slate-400 hover:text-white hover:border-white/25"
            }`}
          >
            All streams · {ordered.length}
          </button>
          {ordered.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onFocus(s.id)}
              className={`h-8 px-3 shrink-0 flex items-center gap-2 border font-display text-[12px] font-black uppercase tracking-wide whitespace-nowrap transition-colors ${
                focused?.id === s.id
                  ? "border-primary-brand bg-primary-brand/15 text-white"
                  : "border-white/10 text-slate-300 hover:text-white hover:border-white/25"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${s.isLive ? "bg-rose-500 animate-pulse" : "bg-slate-600"}`} />
              {nameOf(s, i)}
            </button>
          ))}
        </div>
      )}

      <div
        className={`flex-1 min-h-0 grid gap-3 overflow-y-auto ${GRID[visible.length] ?? "grid-cols-1 xl:grid-cols-2"} ${
          visible.length <= 2 ? "auto-rows-fr" : ""
        }`}
      >
        {visible.map((s) => {
          const i = ordered.indexOf(s);
          return (
            <div key={s.id} className="min-h-0 flex flex-col border border-white/[0.06] bg-black/30">
              {multi && (
                <div className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.06] bg-[#0A0D18]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={`shrink-0 h-1.5 w-1.5 rounded-full ${s.isLive ? "bg-rose-500 animate-pulse" : "bg-slate-600"}`} />
                    <span className="truncate font-display text-sm font-black uppercase tracking-wide text-white">{nameOf(s, i)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onFocus(focused ? null : s.id)}
                    className="shrink-0 font-mono text-[10px] font-black uppercase tracking-widest text-primary-brand hover:text-white"
                  >
                    {focused ? "← All streams" : "Watch only this →"}
                  </button>
                </div>
              )}
              <TournamentStreamPlayer streamUrl={s.url} streamIsLive={s.isLive} className="flex-1 min-h-[200px]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
