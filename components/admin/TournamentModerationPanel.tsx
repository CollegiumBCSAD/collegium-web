"use client";

import { useState } from "react";
import { Tournament, PendingSquadApplication } from "@/types";
import { adminService, tournamentsService } from "@/services";

interface TournamentModerationPanelProps {
  initialTournaments: Tournament[];
  initialApplications: PendingSquadApplication[];
}

export default function TournamentModerationPanel({
  initialTournaments,
  initialApplications,
}: TournamentModerationPanelProps) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [applications, setApplications] = useState(initialApplications);

  const handleApproveApplication = async (a: PendingSquadApplication) => {
    try {
      await tournamentsService.approveApplication(a.tournamentId, a.id);
      setApplications((prev) => prev.filter((x) => x.id !== a.id));
    } catch {
      window.alert("Failed to approve registration. Please try again.");
    }
  };

  const handleRejectApplication = async (a: PendingSquadApplication) => {
    try {
      await tournamentsService.rejectApplication(a.tournamentId, a.id);
      setApplications((prev) => prev.filter((x) => x.id !== a.id));
    } catch {
      window.alert("Failed to reject registration. Please try again.");
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminService.approveTournament(id);
      setTournaments((prev) => prev.filter((x) => x.id !== id));
    } catch {
      window.alert("Failed to approve tournament. Please try again.");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejecting this tournament (shown to the organizer):") || undefined;
    try {
      await adminService.rejectTournament(id, reason);
      setTournaments((prev) => prev.filter((x) => x.id !== id));
    } catch {
      window.alert("Failed to reject tournament. Please try again.");
    }
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-1">Pending Tournament Postings</h2>
        <p className="text-sm font-sans text-secondary-text mb-4">
          Review organizer-submitted tournaments before they go live.
        </p>
        {tournaments.length === 0 ? (
          <p className="text-sm font-sans text-secondary-text">No tournament postings awaiting approval.</p>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <div key={t.id} className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex items-center gap-3">
                    {t.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={t.image}
                        alt={t.title}
                        className="w-12 h-12 rounded-lg object-cover border border-panel-border shrink-0"
                      />
                    )}
                    <p className="font-display text-lg font-bold text-foreground truncate">{t.title}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-[10px] border border-secondary-brand/70 bg-secondary-brand/20 text-[11px] font-sans font-semibold text-secondary-brand">
                    PENDING
                  </span>
                </div>

                {(t.bracketFormat || t.teamQuota) && (
                  <div className="mt-4 grid grid-cols-2 gap-4 text-[13px] font-sans text-foreground">
                    <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2">
                      <p className="text-[11px] text-secondary-text mb-1">Bracket Format</p>
                      {t.bracketFormat || "Not specified"}
                    </div>
                    <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2">
                      <p className="text-[11px] text-secondary-text mb-1">University Quota</p>
                      {t.teamQuota ? `${t.teamQuota} universities` : "Not specified"}
                    </div>
                  </div>
                )}

                {t.rules && (
                  <div className="mt-3 rounded-[10px] border border-panel-border bg-background px-3 py-2 text-[13px] font-sans text-foreground">
                    <p className="text-[11px] text-secondary-text mb-1">Rules & Schedule Notes</p>
                    {t.rules}
                  </div>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => handleReject(t.id)}
                    className="px-4 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(t.id)}
                    className="px-4 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
                  >
                    Approve &amp; Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Pending Team Registrations</h2>
        {applications.length === 0 ? (
          <p className="text-sm font-sans text-secondary-text">No team registrations awaiting approval.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div
                key={a.id}
                className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-foreground truncate">{a.universityName}</p>
                  <span className="text-xs font-sans font-semibold text-error uppercase tracking-wide">
                    {a.gameTitle || "Unknown Game"}
                  </span>
                  <p className="mt-1 text-xs font-sans text-secondary-text">
                    {a.tournamentName} · Applied by {a.applicantName}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleRejectApplication(a)}
                    className="px-4 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveApplication(a)}
                    className="px-4 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
