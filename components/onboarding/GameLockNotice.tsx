import React from "react";
import { GameLockNoticeProps } from "@/types";
import { GAMES } from "@/lib/games";
import { LockIcon } from "@/components/ui/Icons";

/** Explains why a roster action is blocked by the athlete's one-title lock. */
export default function GameLockNotice({ lockedGameId, action }: GameLockNoticeProps) {
  const game = GAMES[lockedGameId];

  return (
    <div role="alert" className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-start gap-3">
      <span className="w-8 h-8 shrink-0 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
        <LockIcon className="w-4 h-4" />
      </span>
      <div className="text-xs font-sans leading-relaxed">
        <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
          Title Locked · {game.shortName}
        </span>
        <p className="text-slate-300 mt-0.5">
          Your athlete account competes in <strong className="text-white">{game.name}</strong> only, so you
          can&apos;t {action}. Squads you create or join must be {game.shortName} squads.
        </p>
      </div>
    </div>
  );
}
