"use client";

import { useState } from "react";
import { EventDocument, EventTeam, EventTeamStatus } from "@/types";
import { CheckCircleIcon, LockIcon } from "@/components/ui/Icons";
import EventDocumentLink from "./EventDocumentLink";
import { FIELD, MONO_LABEL, TEAM_STATUS, TEXT_ACTION } from "./eventSurfaces";

interface EventSquadReviewCardProps {
  eventId: string;
  team: EventTeam;
  documents: EventDocument[];
  /** Once the bracket exists, approved squads are seeded and can't be pulled. */
  bracketDrawn?: boolean;
  onReview: (
    teamId: string,
    status: EventTeamStatus,
    reviewNote?: string,
  ) => Promise<void>;
}

export default function EventSquadReviewCard({
  eventId,
  team,
  documents,
  bracketDrawn = false,
  onReview,
}: EventSquadReviewCardProps) {
  const [note, setNote] = useState(team.reviewNote ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [open, setOpen] = useState(false);

  const act = async (status: EventTeamStatus) => {
    if (status === "REJECTED" && !note.trim()) {
      setError("Tell the captain what to fix.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onReview(team.id, status, note.trim() || undefined);
      setRevoking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  };

  const status = TEAM_STATUS[team.status];
  const isApproved = team.status === "APPROVED";
  const isRejected = team.status === "REJECTED";
  // Show the note editor whenever a "send back" is on the table.
  const showNote =
    team.status === "PENDING" ||
    (isApproved && revoking && !bracketDrawn) ||
    isRejected;

  const docsFor = (playerId?: string) =>
    documents.filter((d) => d.rosterPlayerId === playerId).length;
  const totalDocs = team.roster.reduce((sum, p) => sum + docsFor(p.id), 0);
  const neededDocs = team.roster.length * 2;

  return (
    <article
      className={`relative overflow-hidden rounded-xl border bg-[#0B0F19] transition-colors ${
        open
          ? "border-white/[0.14] shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]"
          : "border-white/[0.07] hover:border-white/[0.14]"
      }`}
    >
      <span
        aria-hidden
        className={`absolute left-0 inset-y-0 w-[3px] z-10 ${status.bar}`}
      />

      {/* Compact summary row: click to expand the roster and review controls */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`squad-${team.id}`}
        className="group w-full flex items-center gap-3 sm:gap-4 pl-5 pr-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br from-white/[0.1] to-white/[0.02] font-display text-base font-black uppercase text-white">
          {team.name.charAt(0)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-base font-black uppercase leading-tight tracking-wide text-white">
            {team.name}
          </span>
          <span className="block truncate text-[11px] text-slate-500">
            {team.captainName} · {team.captainEmail}
          </span>
        </span>

        <span className="hidden md:flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.15em] text-slate-500 tabular-nums">
          <span>
            <span className="text-white font-bold">{team.roster.length}</span>{" "}
            players
          </span>
          <span>
            <span
              className={`font-bold ${totalDocs >= neededDocs ? "text-emerald-300" : "text-white"}`}
            >
              {totalDocs}/{neededDocs}
            </span>{" "}
            docs
          </span>
        </span>

        <span
          className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-[0.15em] ${status.chip}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full bg-current ${team.status === "PENDING" ? "animate-pulse" : ""}`}
          />
          {status.label}
        </span>

        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 shrink-0 text-slate-500 transition-transform duration-300 group-hover:text-white ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={`squad-${team.id}`}
          className="border-t border-white/[0.06] pt-4 animate-page-slide-in"
        >
          <p className="px-5 pb-3 text-xs text-slate-400 md:hidden">
            {team.roster.length} players · {totalDocs}/{neededDocs} documents
          </p>

          <div className="relative mx-4 overflow-x-auto rounded-xl border border-white/[0.06] bg-black/30">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className={`text-left pl-4 pr-3 py-2 ${MONO_LABEL}`}>
                    Player
                  </th>
                  <th className={`text-left pr-3 py-2 ${MONO_LABEL}`}>
                    Student no.
                  </th>
                  <th className={`text-left pr-3 py-2 ${MONO_LABEL}`}>IGN</th>
                  <th className={`text-left pr-4 py-2 ${MONO_LABEL}`}>
                    Documents
                  </th>
                </tr>
              </thead>
              <tbody>
                {team.roster.map((player, idx) => (
                  <tr
                    key={player.id ?? player.studentNumber}
                    className="border-t border-white/[0.04] first:border-t-0 hover:bg-white/[0.025] transition-colors"
                  >
                    <td className="pl-4 pr-3 py-2">
                      <span className="flex items-center gap-3">
                        <span className="w-5 text-[10px] font-mono tabular-nums text-slate-600">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="font-semibold text-white">
                          {player.fullName}
                        </span>
                        {player.isSubstitute && (
                          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-slate-400">
                            sub
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs tabular-nums text-slate-400">
                      {player.studentNumber}
                    </td>
                    <td className="py-2 pr-3 text-slate-300">{player.ign}</td>
                    <td className="py-2 pr-4">
                      <span className="flex flex-col gap-0.5">
                        <EventDocumentLink
                          eventId={eventId}
                          label="COR"
                          document={documents.find(
                            (d) =>
                              d.rosterPlayerId === player.id &&
                              d.kind === "COR",
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

          <div className="relative px-5 pt-4 pb-5 space-y-4">
            {/* Approved: locked-in banner instead of the review controls */}
            {isApproved && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-4 py-3">
                {bracketDrawn ? (
                  <LockIcon className="w-4 h-4 text-emerald-300 shrink-0" />
                ) : (
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300 shrink-0" />
                )}
                <p className="text-sm text-emerald-100/90">
                  {bracketDrawn
                    ? "Approved and seeded in the bracket. This squad is locked."
                    : "Approved. This squad will be seeded when you draw the bracket."}
                </p>
                {!bracketDrawn && !revoking && (
                  <button
                    type="button"
                    onClick={() => setRevoking(true)}
                    className={`ml-auto ${TEXT_ACTION} text-slate-400 hover:text-rose-300`}
                  >
                    Revoke approval
                  </button>
                )}
              </div>
            )}

            {isRejected && (
              <p className="rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3 text-sm text-rose-100/90">
                Sent back. It returns to review once the captain updates the
                squad.
              </p>
            )}

            {showNote && (
              <div>
                <label
                  htmlFor={`note-${team.id}`}
                  className={`block mb-1.5 ${MONO_LABEL}`}
                >
                  Note to the captain
                </label>
                <textarea
                  id={`note-${team.id}`}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. the COR for Player 3 is unreadable"
                  className={`${FIELD} resize-y`}
                />
              </div>
            )}

            {error && <p className="text-xs text-rose-300">{error}</p>}

            <div className="flex flex-wrap items-center gap-3">
              {(team.status === "PENDING" || isRejected) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act("APPROVED")}
                  className="tactical-btn-secondary h-10 px-6 gap-2 text-xs !text-emerald-200 !border-emerald-400/40 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  {isRejected ? "Approve anyway" : "Approve"}
                </button>
              )}
              {(team.status === "PENDING" ||
                (isApproved && revoking && !bracketDrawn)) && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act("REJECTED")}
                  className="tactical-btn-secondary h-10 px-6 text-xs !text-rose-200 !border-rose-400/40 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Send back
                </button>
              )}
              {isApproved && revoking && (
                <button
                  type="button"
                  onClick={() => {
                    setRevoking(false);
                    setError(null);
                  }}
                  className={`${TEXT_ACTION} text-slate-500 hover:text-white`}
                >
                  Cancel
                </button>
              )}
              <a
                href={`/events/team/${team.editToken}`}
                target="_blank"
                rel="noreferrer"
                className={`${TEXT_ACTION} text-slate-400 hover:text-white`}
                title={`Edit link for ${team.name} — send this to the captain if they lose theirs`}
              >
                Captain link ↗
              </a>
              <span className="ml-auto text-[10px] font-mono uppercase tracking-widest text-slate-600">
                Submitted {new Date(team.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
