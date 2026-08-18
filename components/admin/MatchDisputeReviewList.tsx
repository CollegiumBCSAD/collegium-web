"use client";

import { useState } from "react";
import { FlaggedMatch } from "@/types";

interface MatchDisputeReviewListProps {
  initialData: FlaggedMatch[];
}

export default function MatchDisputeReviewList({ initialData }: MatchDisputeReviewListProps) {
  const [matches, setMatches] = useState(initialData);

  const resolve = (id: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== id));
  };

  if (matches.length === 0) {
    return <p className="text-sm font-sans text-secondary-text">No flagged matches awaiting review.</p>;
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <div key={m.id} className="rounded-[10px] border border-error bg-card-bg px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-foreground">
                {m.teamA} <span className="text-secondary-text font-normal">vs</span> {m.teamB}
              </p>
              <span className="text-xs font-sans font-semibold text-primary-brand uppercase tracking-wide">
                {m.game}
              </span>
              <p className="mt-1 text-xs font-sans text-secondary-text">{m.detail}</p>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-md border border-error bg-error/10 text-[11px] font-sans font-bold text-error">
              DISPUTED
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[13px] font-sans text-secondary-text mb-1">{m.teamA} Score</p>
              <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2 text-sm font-sans text-foreground">
                {m.scoreA}
              </div>
            </div>
            <div>
              <p className="text-[13px] font-sans text-secondary-text mb-1">{m.teamB} Score</p>
              <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2 text-sm font-sans text-foreground">
                {m.scoreB}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-[10px] border border-panel-border bg-raised-panel px-4 py-3">
              <p className="text-[12px] font-sans font-bold text-secondary-text uppercase mb-1">
                {m.teamA} Claims
              </p>
              <p className="text-[13px] font-sans text-foreground">&ldquo;{m.claimA}&rdquo;</p>
            </div>
            <div className="rounded-[10px] border border-panel-border bg-raised-panel px-4 py-3">
              <p className="text-[12px] font-sans font-bold text-secondary-text uppercase mb-1">
                {m.teamB} Claims
              </p>
              <p className="text-[13px] font-sans text-foreground">&ldquo;{m.claimB}&rdquo;</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => resolve(m.id)}
              className="px-4 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
            >
              Confirm Original Result
            </button>
            <button
              onClick={() => resolve(m.id)}
              className="px-4 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
            >
              Approve &amp; Publish
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
