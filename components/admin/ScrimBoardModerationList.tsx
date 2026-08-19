"use client";

import { useState } from "react";
import { ScrimBoardPost } from "@/types";
import { GAME_LIST } from "@/lib/games";

interface ScrimBoardModerationListProps {
  initialData: ScrimBoardPost[];
}

export default function ScrimBoardModerationList({ initialData }: ScrimBoardModerationListProps) {
  const [posts, setPosts] = useState(initialData);
  const [gameFilter, setGameFilter] = useState("All Games");

  const remove = (id: string) => setPosts((prev) => prev.filter((p) => p.id !== id));

  const filtered = posts.filter((p) => {
    if (gameFilter === "All Games") return true;
    return p.game.toLowerCase().includes(gameFilter.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {["All Games", ...GAME_LIST.map((g) => g.shortName)].map((game) => (
          <button
            key={game}
            onClick={() => setGameFilter(game)}
            className={`h-[46px] px-5 rounded-[10px] text-xs font-sans font-bold uppercase tracking-wide border transition-colors cursor-pointer ${
              gameFilter === game
                ? "bg-primary-brand/20 border-primary-brand text-foreground"
                : "border-panel-border text-secondary-text hover:text-foreground"
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm font-sans text-secondary-text">No pending or flagged posts.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5 flex items-start justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-display text-lg font-bold text-foreground">{post.teamName}</p>
                  <span className="text-xs font-sans font-semibold text-primary-brand uppercase tracking-wide">
                    {post.game}
                  </span>
                  {post.flagReason && (
                    <span className="px-2 py-0.5 rounded-md border border-secondary-brand/70 bg-secondary-brand/20 text-[10px] font-sans font-bold text-secondary-brand uppercase">
                      Flagged
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs font-sans text-secondary-text">
                  {post.detail}
                  {post.flagReason && ` · ${post.flagReason}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button className="px-3 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer">
                  Edit
                </button>
                <button
                  onClick={() => remove(post.id)}
                  className="px-3 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Remove
                </button>
                <button
                  onClick={() => remove(post.id)}
                  className="px-3 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
