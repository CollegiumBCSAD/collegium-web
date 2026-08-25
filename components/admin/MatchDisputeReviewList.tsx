"use client";

import { useState } from "react";
import { FlaggedMatch } from "@/types";

interface MatchDisputeReviewListProps {
  initialData: FlaggedMatch[];
}

export default function MatchDisputeReviewList({ initialData }: MatchDisputeReviewListProps) {
  const [matches, setMatches] = useState(initialData);

  const resolve = (id: string) => setMatches((prev) => prev.filter((m) => m.id !== id));

  if (matches.length === 0) {
    return <p className="text-sm font-mono text-neutral-400">No active match disputes.</p>;
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <div key={m.id} className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-base sm:text-lg font-bold text-white">
                {m.teamA} <span className="text-emerald-400 font-normal">vs</span> {m.teamB}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                  {m.game}
                </span>
                <span className="text-neutral-700">•</span>
                <span className="text-xs font-sans text-neutral-400">{m.detail}</span>
              </div>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-[10px] font-mono font-bold text-rose-300 uppercase">
              DISPUTED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-mono text-neutral-400 mb-1.5">{m.teamA} Score</p>
              <div className="rounded-xl border border-[#171717] bg-[#050505] px-4 py-2.5 text-base font-mono font-black text-white">
                {m.scoreA}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-neutral-400 mb-1.5">{m.teamB} Score</p>
              <div className="rounded-xl border border-[#171717] bg-[#050505] px-4 py-2.5 text-base font-mono font-black text-white">
                {m.scoreB}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#171717] bg-[#050505] p-4">
              <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase mb-1">
                {m.teamA} Claims:
              </p>
              <p className="text-xs font-sans text-neutral-300 leading-relaxed">&ldquo;{m.claimA}&rdquo;</p>
            </div>
            <div className="rounded-xl border border-[#171717] bg-[#050505] p-4">
              <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase mb-1">
                {m.teamB} Claims:
              </p>
              <p className="text-xs font-sans text-neutral-300 leading-relaxed">&ldquo;{m.claimB}&rdquo;</p>
            </div>
          </div>

          <div className="pt-3.5 border-t border-[#171717] flex justify-end gap-3">
            <button
              onClick={() => resolve(m.id)}
              className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer"
            >
              Confirm Original Result
            </button>
            <button
              onClick={() => resolve(m.id)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95"
            >
              Approve &amp; Resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
