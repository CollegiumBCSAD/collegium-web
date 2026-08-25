"use client";

import { useState } from "react";
import { Tournament, PendingTeamRegistration } from "@/types";
import { adminService } from "@/services";

interface TournamentModerationPanelProps {
  initialTournaments: Tournament[];
  initialRegistrations: PendingTeamRegistration[];
}

export default function TournamentModerationPanel({
  initialTournaments,
  initialRegistrations,
}: TournamentModerationPanelProps) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [registrations, setRegistrations] = useState(initialRegistrations);

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
        {registrations.length === 0 ? (
          <p className="text-sm font-sans text-secondary-text">No team registrations awaiting approval.</p>
        ) : (
          <div className="space-y-3">
            {registrations.map((r) => (
              <div
                key={r.id}
                className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-foreground truncate">{r.teamName}</p>
                  <span className="text-xs font-sans font-semibold text-error uppercase tracking-wide">
                    {r.game}
                  </span>
                  <p className="mt-1 text-xs font-sans text-secondary-text">
                    {r.tournamentName} · {r.detail}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setRegistrations((prev) => prev.filter((x) => x.id !== r.id))}
                    className="px-4 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setRegistrations((prev) => prev.filter((x) => x.id !== r.id))}
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
