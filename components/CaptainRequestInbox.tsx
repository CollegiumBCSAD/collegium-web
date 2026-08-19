"use client";

import React, { useState, useEffect, useMemo } from "react";
import { teamsService } from "@/services/teamsService";
import { fetchTeamsApi, saveStoredTeams, Team, TeamMember } from "@/lib/teams";
import { JoinRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";

export default function CaptainRequestInbox() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [apiRequests, setApiRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamsApi().then((data) => {
      setTeams(data);
      setLoading(false);
    });
  }, []);

  const captainTeams = useMemo(() => {
    if (!user) return [];
    const myId = user.id;
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    return teams.filter(
      (t) =>
        (myId && t.captainId === myId) ||
        (myName && t.captainName && t.captainName.toLowerCase().trim() === myName)
    );
  }, [user, teams]);

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const activeTeam = useMemo(() => {
    if (captainTeams.length === 0) return null;
    if (selectedTeamId) {
      const found = captainTeams.find((t) => t.id === selectedTeamId);
      if (found) return found;
    }
    return captainTeams[0];
  }, [captainTeams, selectedTeamId]);

  useEffect(() => {
    if (!activeTeam || !user) return;
    let isMounted = true;

    teamsService
      .getJoinRequests(activeTeam.id, user.id)
      .then((reqs) => {
        if (isMounted && Array.isArray(reqs)) {
          setApiRequests(reqs);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTeam, user]);

  if (!activeTeam) return null;

  const pendingMembers = activeTeam.members.filter((m) => m.status === "PENDING");
  const acceptedMembers = activeTeam.members.filter((m) => m.status === "ACCEPTED");

  const handleDecision = async (memberId: string, accept: boolean) => {
    const status = accept ? "ACCEPTED" : "DECLINED";
    try {
      if (!user) throw new Error("Not authenticated");
      await teamsService.handleJoinRequest(activeTeam.id, memberId, user.id, status);
      setActionMessage(`Request ${accept ? "accepted" : "declined"} successfully.`);
    } catch {
      setActionMessage(`Updated request locally.`);
    }

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
    setApiRequests((prev) => prev.filter((r) => r.id !== memberId));

    fetchTeamsApi().then((fresh) => setTeams(fresh));

    setTimeout(() => setActionMessage(null), 3000);
  };

  return (
    <div className="w-full bg-[#0D121F]/90 border border-[#1E293B] rounded-3xl p-6 shadow-xl backdrop-blur-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2538] pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
            CAPTAIN ROSTER CONTROL
          </span>
          <h3 className="font-display text-lg font-bold uppercase text-white mt-0.5">
            {activeTeam.name} Roster Inbox
          </h3>
        </div>

        {captainTeams.length > 1 && (
          <div className="flex items-center gap-2">
            {captainTeams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamId(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
                  t.id === activeTeam.id
                    ? "bg-primary-brand text-white shadow-md"
                    : "bg-[#141A29] text-slate-400 border border-[#232D44] hover:text-white"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-sans text-slate-400">Active Roster:</span>
          <span className="text-xs font-mono font-bold text-white bg-[#141A29] px-3 py-1 rounded-full border border-[#232D44]">
            {acceptedMembers.length} Athletes
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-[#141A29] border border-[#232D44] text-xs font-sans font-bold text-slate-200 shadow-sm">
          {actionMessage}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Pending Join Requests ({pendingMembers.length + apiRequests.length})
          </h4>
          {loading && <span className="text-[10px] font-mono text-slate-400 animate-pulse">Syncing...</span>}
        </div>

        {pendingMembers.length === 0 && apiRequests.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#080C14] border border-[#1C2538] text-center">
            <p className="text-xs font-sans text-slate-400">
              No pending join requests. Share your team invite link to invite university peers!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingMembers.map((applicant: TeamMember) => (
              <div
                key={applicant.id}
                className="p-4 rounded-2xl bg-[#080C14] border border-[#1C2538] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-white uppercase">
                      {applicant.displayName}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#141A29] text-slate-300 border border-[#232D44]">
                      {applicant.gameHandle}
                    </span>
                  </div>
                  <div className="text-xs font-sans text-slate-400 flex items-center gap-3">
                    <span>{applicant.email}</span>
                    {applicant.preferredRole && (
                      <span className="text-slate-300 font-bold">
                        Role: {applicant.preferredRole}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDecision(applicant.id, true)}
                    className="h-8 px-4 rounded-xl game-theme-btn text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecision(applicant.id, false)}
                    className="h-8 px-4 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-slate-400 hover:text-white border border-[#232D44] text-xs font-sans font-bold uppercase transition-all cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 pt-4 border-t border-[#1E2538]">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Confirmed Varsity Lineup ({acceptedMembers.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {acceptedMembers.map((m) => (
            <div key={m.id} className="p-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between">
              <div>
                <span className="font-display text-xs font-bold text-white block">{m.displayName}</span>
                <span className="text-[10px] font-mono text-slate-400">{m.gameHandle} {m.preferredRole ? `· ${m.preferredRole}` : ""}</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-300 uppercase bg-[#141A29] px-2.5 py-0.5 rounded-full border border-[#232D44]">
                ACTIVE
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
