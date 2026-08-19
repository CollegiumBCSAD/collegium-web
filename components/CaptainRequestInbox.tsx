"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { teamsService } from "@/services/teamsService";
import { fetchTeamsApi, saveStoredTeams, Team, TeamMember } from "@/lib/teams";
import { JoinRequest } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { GAMES } from "@/lib/games";
import { UsersIcon, ShieldIcon, CheckCircleIcon, CrownIcon, SwordsIcon, PlusIcon, ZapIcon } from "@/components/ui/Icons";

const DEFAULT_ROLES: Record<string, string[]> = {
  valo: ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"],
  lol: ["Top Laner", "Jungler", "Mid Laner", "Bot Laner", "Support"],
  ml: ["Jungler", "Mid Laner", "Gold Laner", "EXP Laner", "Roamer"],
  codm: ["Main Slayer", "SMG Entry", "Anchor", "Sniper / Flex", "Support"],
};

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

  const teamGame = activeTeam ? GAMES[activeTeam.gameTitle as keyof typeof GAMES] || GAMES.valo : GAMES.valo;
  const roleSlots = DEFAULT_ROLES[activeTeam?.gameTitle || "valo"] || DEFAULT_ROLES.valo;

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
  const totalSlots = 5;
  const emptySlotsCount = Math.max(0, totalSlots - acceptedMembers.length);

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
      setActionMessage(`Candidate ${accept ? "accepted" : "declined"} successfully.`);
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
    <div className="relative group">
      {/* 6-Sided Faceted Tactical War Room Console */}
      <div 
        className="relative overflow-hidden bg-[#0A0D18] border border-[#1E293B] shadow-2xl p-6 sm:p-7 space-y-6"
        style={{
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Dynamic Specular Top Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2.5px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 50%, transparent 100%)`,
            boxShadow: `0 0 14px var(--primary-brand)`,
          }}
        />

        {/* Squad Console Header & Tactical Team Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-[#182338] pb-5 relative z-10">
          
          {/* Active Squad Identity */}
          <div className="flex items-center gap-4 min-w-0">
            {/* 8-Sided Game Emblem */}
            <div 
              className="relative w-13 h-13 overflow-hidden shrink-0 border border-white/10 bg-[#060810] shadow-xl"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            >
              <Image src={teamGame.image} alt={teamGame.name} fill className="object-cover" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span 
                  className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-primary-brand/10 border border-primary-brand/30 text-primary-brand"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  WAR ROOM CONSOLE
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {teamGame.name} CIRCUIT
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wide truncate">
                {activeTeam.name} Lineup Command
              </h2>
            </div>
          </div>

          {/* Team Switcher Tabs & Quick Invite Link */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {captainTeams.length > 1 && (
              <div className="flex items-center gap-1.5 p-1 bg-[#060812] border border-[#182338]">
                {captainTeams.map((t) => {
                  const isActive = t.id === activeTeam.id;
                  const g = GAMES[t.gameTitle as keyof typeof GAMES] || GAMES.valo;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`px-3.5 py-1.5 text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? "game-theme-btn shadow-md scale-105"
                          : "bg-[#101626] text-slate-400 hover:text-white border border-[#1E293B]"
                      }`}
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.image} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                      <span>{t.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Quick 1-Click Invite Code Button */}
            <button
              type="button"
              onClick={handleCopyInvite}
              className="h-8.5 px-3.5 text-xs font-mono font-bold text-slate-300 hover:text-white bg-[#101626] hover:bg-[#1A253D] border border-[#22314E] transition-all cursor-pointer flex items-center gap-2 shadow-inner active:scale-95"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              <span className="text-slate-400">Invite:</span>
              <strong className="text-primary-brand font-mono">{activeTeam.inviteCode}</strong>
              <span className="text-[10px] text-slate-400 ml-1">({copiedInvite ? "✓ Copied" : "Copy"})</span>
            </button>
          </div>
        </div>

        {/* Action Status Toast */}
        {actionMessage && (
          <div className="p-3 bg-[#060812] border border-emerald-500/40 text-xs font-sans font-bold text-emerald-400 flex items-center gap-2 shadow-inner">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Tactical 5-Slot Varsity Lineup Grid */}
        <div className="space-y-3.5 relative z-10">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
              <ShieldIcon className="w-4 h-4 text-primary-brand" />
              <span>Active Lineup Matrix ({acceptedMembers.length} / {totalSlots} Active)</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              5v5 VARSITY ROSTER
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Render Confirmed Athletes */}
            {acceptedMembers.map((m, idx) => (
              <div 
                key={m.id} 
                className="p-4 bg-[#060812] border border-[#1E293B] shadow-inner flex items-center justify-between gap-3 hover:border-primary-brand/50 transition-all duration-200 group relative"
                style={{
                  clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Octagonal Avatar */}
                  <div 
                    className="w-10 h-10 bg-[#121929] text-white flex items-center justify-center font-display font-black text-xs border border-white/10 shrink-0 group-hover:border-primary-brand/60"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                    }}
                  >
                    {m.displayName.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-display text-xs font-bold uppercase text-white truncate group-hover:text-primary-brand transition-colors">
                        {m.displayName}
                      </span>
                      {idx === 0 && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      {m.gameHandle || "Athlete"}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircleIcon className="w-2.5 h-2.5 text-emerald-400" />
                      {roleSlots[idx] || "Starter"}
                    </span>
                  </div>
                </div>

                <span 
                  className="text-[9px] font-mono font-bold text-slate-300 bg-[#101626] px-2 py-0.5 border border-[#202C45] shrink-0"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  SLOT #{idx + 1}
                </span>
              </div>
            ))}

            {/* Render Vacant Open Roster Slots with Quick Recruit Action */}
            {Array.from({ length: emptySlotsCount }).map((_, i) => {
              const slotIdx = acceptedMembers.length + i;
              const expectedRole = roleSlots[slotIdx] || `Roster Slot ${slotIdx + 1}`;
              return (
                <div
                  key={`empty-${i}`}
                  onClick={handleCopyInvite}
                  className="p-4 bg-[#050711]/60 border border-dashed border-[#1E293B] hover:border-primary-brand/60 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer group hover:bg-[#0A0E1A]"
                  style={{
                    clipPath: "polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 bg-[#0A0D18] text-slate-500 group-hover:text-primary-brand flex items-center justify-center font-black text-sm border border-dashed border-[#202C45] group-hover:border-primary-brand/50 shrink-0 transition-colors"
                      style={{
                        clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                      }}
                    >
                      <PlusIcon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <span className="font-display text-xs font-bold uppercase text-slate-400 group-hover:text-white block truncate transition-colors">
                        Empty Slot #{slotIdx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block truncate group-hover:text-slate-300">
                        {expectedRole}
                      </span>
                    </div>
                  </div>

                  <span 
                    className="text-[9px] font-mono font-bold text-slate-400 group-hover:text-primary-brand bg-[#0C101E] px-2 py-0.5 border border-[#1A253C] group-hover:border-primary-brand/40 shrink-0 transition-colors"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    + Recruit
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Recruitment Applications Section */}
        <div className="space-y-3 pt-4 border-t border-[#182338] relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5 text-primary-brand" />
              <span>Recruitment Queue ({pendingMembers.length + apiRequests.length} Applicants)</span>
            </span>
            {loading && <span className="text-[10px] font-mono text-slate-500 animate-pulse">Scanning...</span>}
          </div>

          {pendingMembers.length === 0 && apiRequests.length === 0 ? (
            <div 
              className="p-4 bg-[#060812] border border-[#182338] flex items-center justify-between gap-4 shadow-inner"
              style={{
                clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
              }}
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-400 font-sans">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Scouting radar active. Share your squad code (<strong className="text-white font-mono">{activeTeam.inviteCode}</strong>) with classmates to recruit varsity starters.</span>
              </div>
              <button
                type="button"
                onClick={handleCopyInvite}
                className="text-[10px] font-mono font-bold text-slate-300 hover:text-white px-3 py-1 bg-[#101626] hover:bg-[#1A253D] border border-[#22314E] transition-colors cursor-pointer shrink-0"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                Copy Link
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingMembers.map((applicant: TeamMember) => (
                <div
                  key={applicant.id}
                  className="p-3.5 bg-[#060812] border border-[#182338] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-black text-white uppercase">
                        {applicant.displayName}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-300 bg-[#121929] px-2 py-0.5 border border-[#243350]">
                        {applicant.gameHandle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-sans truncate">
                      {applicant.email} {applicant.preferredRole ? `• Preferred Role: ${applicant.preferredRole}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(applicant.id, true)}
                      className="h-8 px-3.5 game-theme-btn text-xs font-display font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md"
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecision(applicant.id, false)}
                      className="h-8 px-3.5 bg-[#121929] hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-[#243350] text-xs font-display font-bold uppercase transition-all cursor-pointer active:scale-95"
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

      </div>
    </div>
  );
}
