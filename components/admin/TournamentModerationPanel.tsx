"use client";

import { useState } from "react";
import { PendingTournamentPost, PendingTeamRegistration } from "@/types";

interface TournamentModerationPanelProps {
  initialTournaments: PendingTournamentPost[];
  initialRegistrations: PendingTeamRegistration[];
}

export default function TournamentModerationPanel({
  initialTournaments,
  initialRegistrations,
}: TournamentModerationPanelProps) {
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [registrations, setRegistrations] = useState(initialRegistrations);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-1">Pending Tournament Postings</h2>
        <p className="text-sm font-sans text-secondary-text mb-4">
          Set the bracket format and schedule before the event goes live.
        </p>
        {tournaments.length === 0 ? (
          <p className="text-sm font-sans text-secondary-text">No tournament postings awaiting approval.</p>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t) => (
              <div key={t.id} className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold text-foreground">{t.name}</p>
                    <span className="text-xs font-sans font-semibold text-primary-brand uppercase tracking-wide">
                      {t.game}
                    </span>
                    <p className="mt-1 text-xs font-sans text-secondary-text">{t.detail}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-[10px] border border-secondary-brand/70 bg-secondary-brand/20 text-[11px] font-sans font-semibold text-secondary-brand">
                    1 PENDING
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 text-[13px] font-sans text-foreground">
                  <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2">
                    <p className="text-[11px] text-secondary-text mb-1">Bracket Format</p>
                    {t.bracketFormat}
                  </div>
                  <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2">
                    <p className="text-[11px] text-secondary-text mb-1">Seeding</p>
                    {t.seeding}
                  </div>
                  <div className="rounded-[10px] border border-panel-border bg-background px-3 py-2">
                    <p className="text-[11px] text-secondary-text mb-1">Schedule Start</p>
                    {t.scheduleStart}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button className="px-4 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer">
                    Edit
                  </button>
                  <button
                    onClick={() => setTournaments((prev) => prev.filter((x) => x.id !== t.id))}
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
