"use client";

import { useCallback, useEffect, useState } from "react";
import { rostersService } from "@/services";
import { RosterChange, RosterChangeReviewPanelProps } from "@/types";
import { reasonLabel } from "./RosterChangeHistory";

// Organizer/admin queue of last-minute substitutions for one tournament.
export default function RosterChangeReviewPanel({ tournamentId, onReviewed }: RosterChangeReviewPanelProps) {
  const [changes, setChanges] = useState<RosterChange[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    rostersService.getTournamentChanges(tournamentId).then(setChanges).catch(() => setChanges([]));
  }, [tournamentId]);

  useEffect(load, [load]);

  const pending = changes.filter((c) => c.status === "PENDING");
  if (pending.length === 0) return null;

  const review = async (changeId: string, approve: boolean) => {
    setBusyId(changeId);
    setError("");
    try {
      await rostersService.reviewChange(changeId, approve, notes[changeId]);
      load();
      onReviewed?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not review the change.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="p-4 bg-[#0A0D18] border border-sky-500/30 rounded-xl space-y-3">
      <h4 className="font-display text-sm font-black uppercase text-white">
        Last-Minute Roster Changes <span className="text-sky-300">({pending.length})</span>
      </h4>
      {error && <p className="text-xs font-sans text-rose-400">{error}</p>}
      <ul className="space-y-2">
        {pending.map((c) => (
          <li key={c.id} className="p-3 rounded-lg bg-black/30 space-y-2">
            <div>
              <p className="text-xs font-sans text-white">
                <strong>{c.team.name}</strong>: {c.outUser.displayName} → {c.inUser.displayName}
              </p>
              <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                <span className="text-sky-300">{reasonLabel(c.reason)}</span> · filed by {c.requestedBy.displayName} ·{" "}
                {new Date(c.createdAt).toLocaleString()}
              </p>
              <p className="text-xs font-sans text-slate-300 mt-1 whitespace-pre-line">{c.details}</p>
            </div>
            <input
              value={notes[c.id] ?? ""}
              maxLength={500}
              onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
              placeholder="Note to the team (optional)"
              className="w-full h-8 px-2.5 rounded-md bg-black/40 border border-white/10 text-xs text-white font-sans focus:outline-none focus:border-sky-400"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => review(c.id, false)}
                className="h-8 px-3 rounded-md text-[11px] font-mono font-bold uppercase text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => review(c.id, true)}
                className="h-8 px-3 rounded-md text-[11px] font-mono font-bold uppercase text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
              >
                Approve Swap
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
