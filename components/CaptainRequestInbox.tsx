"use client";

import React, { useState, useEffect, useMemo } from "react";
import { teamsService } from "@/services/teamsService";
import { fetchTeamsApi, saveStoredTeams, Team, TeamMember } from "@/lib/teams";
import { JoinRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { UsersIcon, ShieldIcon, CheckCircleIcon, CrownIcon } from "@/components/ui/Icons";

export default function CaptainRequestInbox() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [apiRequests, setApiRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

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

  const handleCopyInvite = () => {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/team/join?invite=${activeTeam.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handleDecision = async (memberId: string, accept: boolean) => {
    const status = accept ? "ACCEPTED" : "DECLINED";
    try {
      if (!user) throw new Error("Not authenticated");
      await teamsService.handleJoinRequest(activeTeam.id, memberId, user.id, status);
      setActionMessage(`Request ${accept ? "accepted" : "declined"} successfully.`);
    } catch {
      setActionMessage(`Updated request.`);
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
    <div className="relative">
      {/* 6-Sided Faceted Terminal Frame */}
      <div 
        className="relative overflow-hidden bg-[#0A0D18] border border-[#1C253D] p-5 sm:p-6 shadow-2xl space-y-5"
        style={{
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}
      >
        {/* Top Highlight Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, var(--primary-brand) 70%, transparent 100%)`,
          }}
        />

        {/* Header Bar: Squad Title, Active Team Switcher & Invite Code */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#162034] pb-3.5 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span 
                className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary-brand bg-primary-brand/10 px-2 py-0.5 border border-primary-brand/30"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                CAPTAIN CONSOLE
              </span>
              <span className="text-xs font-mono text-slate-400">
                Lineup: <strong className="text-white">{acceptedMembers.length} Athletes</strong>
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white uppercase tracking-wide mt-1">
              {activeTeam.name} Roster Control
            </h2>
          </div>

          {/* Team Switcher Tabs & Quick Invite Button */}
          <div className="flex flex-wrap items-center gap-2">
            {captainTeams.length > 1 && (
              <div className="flex items-center gap-1 p-0.5 bg-[#050711] border border-[#162034]">
                {captainTeams.map((t) => {
                  const isActive = t.id === activeTeam.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`px-3 py-1 text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                        isActive
                          ? "game-theme-btn shadow-sm font-black"
                          : "bg-[#0E1322] text-slate-400 hover:text-white border border-[#1A2338]"
                      }`}
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyInvite}
              className="px-3 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-[#0E1322] hover:bg-[#161F34] border border-[#1E2942] transition-colors cursor-pointer flex items-center gap-1.5"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              <span>{copiedInvite ? "✓ Link Copied" : `Invite: ${activeTeam.inviteCode}`}</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-[#050711] border border-emerald-500/40 text-xs font-sans font-bold text-emerald-400 flex items-center gap-2 shadow-inner">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Pending Applicants Section */}
        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5 text-primary-brand" />
              <span>Pending Applications ({pendingMembers.length + apiRequests.length})</span>
            </span>
            {loading && <span className="text-[10px] font-mono text-slate-500 animate-pulse">Syncing...</span>}
          </div>

          {pendingMembers.length === 0 && apiRequests.length === 0 ? (
            <div 
              className="p-4 bg-[#050711] border border-[#162034] text-center shadow-inner"
              style={{
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              }}
            >
              <p className="text-xs text-slate-400 font-sans">
                No pending applications. Share squad invite code <strong className="text-white font-mono">{activeTeam.inviteCode}</strong> to recruit athletes.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingMembers.map((applicant: TeamMember) => (
                <div
                  key={applicant.id}
                  className="p-3.5 bg-[#050711] border border-[#162034] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-black text-white uppercase">
                        {applicant.displayName}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-[#0E1322] px-2 py-0.5 border border-[#1E2942]">
                        {applicant.gameHandle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans truncate">
                      {applicant.email} {applicant.preferredRole ? `• Role: ${applicant.preferredRole}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(applicant.id, true)}
                      className="h-7.5 px-3 game-theme-btn text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md"
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(applicant.id, false)}
                      className="h-7.5 px-3 bg-[#0E1322] hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-[#1E2942] text-xs font-display font-bold uppercase transition-all cursor-pointer active:scale-95"
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmed Varsity Lineup */}
        <div className="space-y-2.5 pt-3 border-t border-[#162034] relative z-10">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <ShieldIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>Confirmed Lineup ({acceptedMembers.length})</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {acceptedMembers.map((m) => (
              <div 
                key={m.id} 
                className="p-3 bg-[#050711] border border-[#162034] flex items-center justify-between gap-2 shadow-inner hover:border-primary-brand/40 transition-colors"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-8 h-8 bg-[#0E1322] text-white flex items-center justify-center font-black text-xs border border-white/10 shrink-0"
                    style={{
                      clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                    }}
                  >
                    {m.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="font-sans text-xs font-bold text-white block truncate">{m.displayName}</span>
                    <span className="text-[10px] font-mono text-slate-400 truncate block">
                      {m.gameHandle || "Athlete"} {m.preferredRole ? `· ${m.preferredRole}` : ""}
                    </span>
                  </div>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-300 bg-[#0E1322] px-2 py-0.5 border border-[#1E2942] shrink-0">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
