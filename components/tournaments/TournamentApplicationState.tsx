"use client";

import { useState, type CSSProperties } from "react";
import { TournamentApplicationStateProps } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { CheckCircleIcon, PlusIcon } from "@/components/ui/Icons";

// The viewer's relationship to a tournament: register, pending (with a
// two-step withdraw), or sanctioned. Hidden for organizers/admins and once
// the tournament is completed.
export default function TournamentApplicationState({
  tournament,
  onApply,
  onWithdraw,
  isApplied = false,
  isApplying = false,
}: TournamentApplicationStateProps) {
  const { user } = useAuth();
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  const isHost = Boolean(user?.id && (tournament.organizerId === user.id || tournament.organizer?.id === user.id));
  if (tournament.status === "COMPLETED" || user?.role === "ORGANIZER" || user?.role === "ADMIN" || isHost) return null;

  const application = (tournament.applications as Array<{ userId?: string; status?: string }> | undefined)?.find(
    (app) => app.status !== "REJECTED" && Boolean(user?.id && app.userId === user.id)
  );
  const status = application?.status || (isApplied ? "PENDING" : null);

  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-success/10 border border-success/30 text-success text-[11px] font-mono font-bold uppercase tracking-wider">
        <CheckCircleIcon className="w-4 h-4" />
        Squad sanctioned
      </span>
    );
  }

  if (status === "PENDING") {
    if (confirmWithdraw) {
      return (
        <span className="inline-flex items-center gap-2 h-10 pl-4 pr-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[11px] font-mono">
          Withdraw application?
          <button
            type="button"
            disabled={isApplying}
            onClick={() => {
              setConfirmWithdraw(false);
              onWithdraw?.(tournament);
            }}
            className="h-7 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase disabled:opacity-50"
          >
            {isApplying ? "…" : "Withdraw"}
          </button>
          <button
            type="button"
            onClick={() => setConfirmWithdraw(false)}
            className="h-7 px-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 text-[10px] font-bold uppercase"
          >
            Keep
          </button>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-3">
        <span className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[11px] font-mono font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Application pending
        </span>
        {onWithdraw && (
          <button
            type="button"
            disabled={isApplying}
            onClick={() => setConfirmWithdraw(true)}
            className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 hover:text-rose-400 transition-colors"
          >
            Withdraw
          </button>
        )}
      </span>
    );
  }

  if (!onApply) return null;
  return (
    <button
      type="button"
      disabled={isApplying}
      onClick={() => onApply(tournament)}
      className="game-theme-btn h-10 px-5 gap-2 text-xs disabled:opacity-50"
      // Same slanted button, recolored green: "join" reads differently from
      // the game-colored "view" actions next to it.
      style={{ "--primary-brand": "#10B981", "--game-glow-rgb": "16, 185, 129", "--game-btn-text": "#03170F" } as CSSProperties}
    >
      <PlusIcon className="w-4 h-4" />
      {isApplying ? "Registering…" : "Register squad"}
    </button>
  );
}
