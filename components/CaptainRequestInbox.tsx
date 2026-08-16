"use client";

import React, { useState } from "react";
import { getStoredTeams, saveStoredTeams, Team, TeamMember } from "@/lib/teams";

export default function CaptainRequestInbox() {
  const [teams, setTeams] = useState<Team[]>(() => getStoredTeams());
  const [activeTeam, setActiveTeam] = useState<Team | null>(() => {
    const loaded = getStoredTeams();
    return loaded.length > 0 ? loaded[0] : null;
  });

  if (!activeTeam) return null;

  const pendingMembers = activeTeam.members.filter((m) => m.status === "PENDING");
  const acceptedMembers = activeTeam.members.filter((m) => m.status === "ACCEPTED");

  const handleDecision = (memberId: string, accept: boolean) => {
    const updatedTeams = teams.map((t) => {
      if (t.id === activeTeam.id) {
        const updatedMembers = t.members.map((m) => {
          if (m.id === memberId) {
            return { ...m, status: accept ? ("ACCEPTED" as const) : ("DECLINED" as const) };
          }
          return m;
        });
        return { ...t, members: updatedMembers };
      }
      return t;
    });

    setTeams(updatedTeams);
    saveStoredTeams(updatedTeams);

    const newActive = updatedTeams.find((t) => t.id === activeTeam.id) || null;
    setActiveTeam(newActive);
  };

  return (
    <div className="w-full bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-raised-panel pb-4">
        <div>
          <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block">
            Team Captain Roster Control
          </span>
          <h3 className="font-display text-xl font-bold uppercase text-foreground">
            {activeTeam.name} Inbox
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-secondary-text">Active Roster:</span>
          <span className="text-xs font-display font-bold text-foreground bg-background px-2.5 py-1 rounded border border-panel-border">
            {acceptedMembers.length} Athletes
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text">
          Pending Roster Join Requests ({pendingMembers.length})
        </h4>

        {pendingMembers.length === 0 ? (
          <div className="p-6 rounded-xl bg-background/50 border border-panel-border text-center">
            <p className="text-xs font-sans text-secondary-text">
              No pending join requests. Share your team invite link to invite university peers!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMembers.map((applicant: TeamMember) => (
              <div
                key={applicant.id}
                className="p-4 rounded-xl bg-background border border-panel-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-foreground uppercase">
                      {applicant.displayName}
                    </span>
                    <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-primary-brand/10 text-primary-brand border border-primary-brand/20">
                      {applicant.gameHandle}
                    </span>
                  </div>
                  <div className="text-xs font-sans text-secondary-text flex items-center gap-3">
                    <span>{applicant.email}</span>
                    {applicant.preferredRole && (
                      <span className="text-foreground font-semibold">
                        Role: {applicant.preferredRole}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecision(applicant.id, true)}
                    className="h-9 px-4 rounded-lg bg-success/20 hover:bg-success/30 text-success border border-success/30 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecision(applicant.id, false)}
                    className="h-9 px-4 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-raised-panel">
        <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text">
          Confirmed Roster ({acceptedMembers.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {acceptedMembers.map((m) => (
            <div key={m.id} className="p-3 rounded-lg bg-background/50 border border-panel-border/60 flex items-center justify-between">
              <div>
                <span className="font-display text-xs font-bold text-foreground block">{m.displayName}</span>
                <span className="text-[10px] font-sans text-secondary-text">{m.gameHandle} {m.preferredRole ? `· ${m.preferredRole}` : ""}</span>
              </div>
              <span className="text-[10px] font-sans font-bold text-success uppercase">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
