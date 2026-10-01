"use client";

import { useState } from "react";
import { EventDocument, EventTeam, EventTeamStatus } from "@/types";
import EventDocumentLink from "./EventDocumentLink";

interface EventSquadReviewCardProps {
  eventId: string;
  team: EventTeam;
  documents: EventDocument[];
  onReview: (
    teamId: string,
    status: EventTeamStatus,
    reviewNote?: string,
  ) => Promise<void>;
}

const STATUS_PILL: Record<EventTeamStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-200 border-amber-400/30",
  APPROVED: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
  REJECTED: "bg-red-500/15 text-red-200 border-red-400/30",
};

export default function EventSquadReviewCard({
  eventId,
  team,
  documents,
  onReview,
}: EventSquadReviewCardProps) {
  const [note, setNote] = useState(team.reviewNote ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const act = async (status: EventTeamStatus) => {
    if (status === "REJECTED" && !note.trim()) {
      setError("Tell the captain what to fix.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onReview(team.id, status, note.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-base text-white">{team.name}</h3>
          <p className="text-xs text-white/40">
            {team.captainName} · {team.captainEmail}
          </p>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wider ${STATUS_PILL[team.status]}`}
        >
          {team.status}
        </span>
      </header>

      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm min-w-[460px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-white/35">
              <th className="text-left font-medium pb-2 pr-3">Player</th>
              <th className="text-left font-medium pb-2 pr-3">Student no.</th>
              <th className="text-left font-medium pb-2 pr-3">IGN</th>
              <th className="text-left font-medium pb-2">Documents</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            {team.roster.map((player) => (
              <tr
                key={player.id ?? player.studentNumber}
                className="border-t border-white/5"
              >
                <td className="py-2 pr-3">
                  {player.fullName}
                  {player.isSubstitute && (
                    <span className="ml-2 text-[10px] uppercase text-white/30">
                      sub
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 font-mono text-xs tabular-nums">
                  {player.studentNumber}
                </td>
                <td className="py-2 pr-3">{player.ign}</td>
                <td className="py-2">
                  <span className="flex flex-col gap-0.5">
                    <EventDocumentLink
                      eventId={eventId}
                      label="COR"
                      document={documents.find(
                        (d) =>
                          d.rosterPlayerId === player.id && d.kind === "COR",
                      )}
                    />
                    <EventDocumentLink
                      eventId={eventId}
                      label="School ID"
                      document={documents.find(
                        (d) =>
                          d.rosterPlayerId === player.id &&
                          d.kind === "SCHOOL_ID",
                      )}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label
        htmlFor={`note-${team.id}`}
        className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
      >
        Note to the captain
      </label>
      <textarea
        id={`note-${team.id}`}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="e.g. the COR for Player 3 is unreadable"
        className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary-brand/70 transition mb-3"
      />

      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => act("APPROVED")}
          className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 transition"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => act("REJECTED")}
          className="rounded-lg bg-red-500/15 border border-red-400/30 px-4 py-2 text-sm text-red-100 hover:bg-red-500/25 disabled:opacity-50 transition"
        >
          Send back
        </button>
        <a
          href={`/events/team/${team.editToken}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:bg-white/5 transition"
          title={`Edit link for ${team.name} — send this to the captain if they lose theirs`}
        >
          Open captain link
        </a>
      </div>

      <p className="mt-2 text-[11px] text-white/25">
        Submitted {new Date(team.createdAt).toLocaleString()}
      </p>
    </article>
  );
}
