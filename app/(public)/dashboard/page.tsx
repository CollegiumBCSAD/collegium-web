"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { teamsService } from "@/services/teamsService";
import { GAMES } from "@/lib/games";
import AthleteProfileBanner from "@/components/dashboard/AthleteProfileBanner";
import TeamRosterCard from "@/components/dashboard/TeamRosterCard";
import OrganizerDashboardView from "@/components/dashboard/OrganizerDashboardView";
import CaptainRequestInbox from "@/components/CaptainRequestInbox";
import { TrophyIcon, SwordsIcon, UsersIcon, ShieldIcon, ClockIcon } from "@/components/ui/Icons";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded } = useAuth();
  const { selectedGame } = useGame();
  const activeGame = selectedGame || "valo";
  const activeGameInfo = GAMES[activeGame as keyof typeof GAMES] || GAMES.valo;

  const [allTeams, setAllTeams] = useState<Team[]>(() => getStoredTeams());

  const refreshTeams = () => {
    fetchTeamsApi().then((teams) => setAllTeams(teams));
  };

  useEffect(() => {
    refreshTeams();
  }, []);

  const handleCancelPendingRequest = async (teamId: string) => {
    if (!user) return;
    try {
      await teamsService.leaveTeam(teamId, user.id);
      refreshTeams();
    } catch {}
  };

  const userTeams = useMemo(() => {
    if (!user) return [];
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    return allTeams.filter((t) =>
      (myId && t.captainId === myId) ||
      (myName && t.captainName && t.captainName.toLowerCase().trim() === myName) ||
      t.members.some(
        (m) =>
          m.status === "ACCEPTED" &&
          ((myId && m.userId === myId) ||
            (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
            (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
      )
    );
  }, [user, allTeams]);

  // Strictly filter rosters to the selected game (no outside game rosters displayed)
  const userGameTeams = useMemo(() => {
    return userTeams.filter((t) => t.gameTitle === activeGame);
  }, [userTeams, activeGame]);

  const pendingUserTeams = useMemo(() => {
    if (!user) return [];
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    return allTeams.filter((t) =>
      t.members.some(
        (m) =>
          m.status === "PENDING" &&
          ((myId && m.userId === myId) ||
            (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
            (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
      )
    );
  }, [user, allTeams]);

  const pendingGameTeams = useMemo(() => {
    return pendingUserTeams.filter((t) => t.gameTitle === activeGame);
  }, [pendingUserTeams, activeGame]);

  const isCaptain = useMemo(() => {
    if (!user) return false;
    const myId = user.id;
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";
    return userTeams.some(
      (t) => (myId && t.captainId === myId) || (myName && t.captainName && t.captainName.toLowerCase().trim() === myName)
    );
  }, [user, userTeams]);

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoaded, isLoggedIn, router]);

  if (!isLoaded || !isLoggedIn || !user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-slate-400 animate-pulse">
        Loading Athlete Dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-10 px-4 sm:px-6 lg:px-10 relative">
      <div className="max-w-6xl mx-auto space-y-7 w-full">
        
        {/* Verification Alert Banner */}
        {user.status === "PENDING" && (
          <div 
            className="p-4 sm:p-5 bg-[#0A0D18] border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans shadow-lg relative"
            style={{
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
            }}
          >
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-mono font-bold text-amber-400 uppercase tracking-wider block">Account Verification Pending</span>
                <span className="text-slate-300">Your student email (@{user.university?.domain || "edu"}) is undergoing verification. Match participation requires active approval.</span>
              </div>
            </div>
            <span 
              className="px-3.5 py-1 bg-amber-950/60 text-amber-400 font-mono font-bold uppercase text-[10px] tracking-wider shrink-0 border border-amber-500/40"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              PENDING VERIFICATION
            </span>
          </div>
        )}

        {/* Hero Athlete Banner with Chamfered HUD Geometry */}
        <AthleteProfileBanner user={user} squadsCount={userGameTeams.length} />

        {user.role === "ORGANIZER" ? (
          <OrganizerDashboardView user={user} />
        ) : (
          /* 2-Column Dashboard Main Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
          
          {/* Left Column (Span 2): Squad Operations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Captain Console (Only rendered if Captain) */}
            {isCaptain && <CaptainRequestInbox />}

            {/* Pending Applications Box */}
            {pendingGameTeams.length > 0 && (
              <div 
                className="p-5 bg-[#0A0D18] border border-[#1E293B] space-y-4 shadow-xl relative"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                }}
              >
                <div className="flex items-center justify-between border-b border-[#182338] pb-2.5">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <h3 className="font-display text-sm font-black text-white uppercase tracking-wider">
                      Pending {activeGameInfo.name} Applications ({pendingGameTeams.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    AWAITING REVIEW
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingGameTeams.map((t) => {
                    const game = GAMES[t.gameTitle] || GAMES.valo;
                    return (
                      <div 
                        key={t.id} 
                        className="p-3.5 bg-[#060812] border border-[#182338] flex items-center justify-between gap-3 shadow-inner"
                        style={{
                          clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={game.image} alt={game.name} className="w-8 h-8 object-cover ring-1 ring-white/10 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-display text-xs font-bold uppercase text-white truncate">{t.name}</h4>
                            <span className="text-[10px] font-sans text-slate-400 truncate block">Captain: {t.captainName}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelPendingRequest(t.id)}
                          className="text-[10px] font-mono font-bold text-slate-400 hover:text-white px-2.5 py-1 bg-[#121929] border border-[#202C45] cursor-pointer transition-all shrink-0 active:scale-95"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Varsity Squads */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-[#1A253C] pb-2.5">
                <h2 className="font-display text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <SwordsIcon className="w-4 h-4 text-primary-brand" />
                  <span>{activeGameInfo.name} Varsity Squads</span>
                </h2>
                <span className="text-xs font-mono text-slate-400 font-bold">
                  {userGameTeams.length} Active {userGameTeams.length === 1 ? "Squad" : "Squads"}
                </span>
              </div>

              {userGameTeams.length === 0 ? (
                <div 
                  className="p-8 bg-[#0A0D18] border border-[#1E293B] text-center space-y-4 shadow-xl"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  <div className="w-12 h-12 bg-[#121929] text-slate-400 border border-[#202C45] flex items-center justify-center mx-auto text-xl shadow-inner">
                    <ShieldIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold uppercase text-white">No Active {activeGameInfo.name} Squad</h3>
                    <p className="text-xs font-sans text-slate-400 max-w-sm mx-auto mt-1">
                      You are not currently listed on a {activeGameInfo.name} roster. Switch game titles or establish a squad.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Link
                      href="/team/create"
                      className="h-9 px-5 game-theme-btn font-display text-xs font-black uppercase tracking-wider flex items-center justify-center shadow-lg transition-all active:scale-95"
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      Establish {activeGameInfo.shortName} Squad
                    </Link>
                    <Link
                      href="/team/join"
                      className="h-9 px-5 bg-[#141A2B] hover:bg-[#1C253B] text-slate-200 border border-[#222E48] font-display text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 shadow-md"
                      style={{
                        clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                      }}
                    >
                      Browse Teams
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  {userGameTeams.map((t) => (
                    <TeamRosterCard key={t.id} team={t} onRosterUpdated={refreshTeams} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Tactical Competitive Launchpad */}
          <div className="space-y-5">
            
            <div 
              className="p-5 sm:p-6 bg-[#090C16] border border-[#1E293B] space-y-4 shadow-2xl relative overflow-hidden"
              style={{
                clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
              }}
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-brand via-primary-brand/30 to-transparent" />

              <div className="border-b border-[#182338] pb-3 relative z-10">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary-brand block">
                  CIRCUIT ACCESS
                </span>
                <h3 className="font-display text-base font-black text-white uppercase tracking-wide mt-0.5">
                  Competitive Hub
                </h3>
              </div>

              <div className="space-y-2.5 relative z-10">
                <Link
                  href="/scrims"
                  className="w-full p-3.5 bg-[#050711] hover:bg-[#101626] border border-[#162034] hover:border-primary-brand/50 flex items-center justify-between transition-all group cursor-pointer shadow-inner"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 bg-[#0E1322] text-primary-brand border border-[#1E2942] flex items-center justify-center shrink-0 group-hover:border-primary-brand/60"
                      style={{
                        clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                      }}
                    >
                      <SwordsIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-white uppercase tracking-wide block group-hover:text-primary-brand transition-colors">
                          Practice Scrims
                        </span>
                        <span className="text-[8px] font-mono font-bold text-slate-300 bg-[#0E1322] px-1.5 py-0.2 border border-[#1E2942]">
                          LOBBIES
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                        Custom lobbies & match veto
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                </Link>

                <Link
                  href="/tournaments"
                  className="w-full p-3.5 bg-[#050711] hover:bg-[#101626] border border-[#162034] hover:border-primary-brand/50 flex items-center justify-between transition-all group cursor-pointer shadow-inner"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 bg-[#0E1322] text-slate-300 border border-[#1E2942] flex items-center justify-center shrink-0 group-hover:border-primary-brand/60"
                      style={{
                        clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                      }}
                    >
                      <TrophyIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-white uppercase tracking-wide block group-hover:text-primary-brand transition-colors">
                          Tournaments & Brackets
                        </span>
                        <span className="text-[8px] font-mono font-bold text-slate-300 bg-[#0E1322] px-1.5 py-0.2 border border-[#1E2942]">
                          BRACKETS
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                        Official collegiate circuit
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                </Link>

                <Link
                  href="/recruit"
                  className="w-full p-3.5 bg-[#050711] hover:bg-[#101626] border border-[#162034] hover:border-primary-brand/50 flex items-center justify-between transition-all group cursor-pointer shadow-inner"
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 bg-[#0E1322] text-slate-300 border border-[#1E2942] flex items-center justify-center shrink-0 group-hover:border-primary-brand/60"
                      style={{
                        clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)",
                      }}
                    >
                      <UsersIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display text-xs font-bold text-white uppercase tracking-wide block group-hover:text-primary-brand transition-colors">
                          Recruitment & LFT
                        </span>
                        <span className="text-[8px] font-mono font-bold text-slate-400 bg-[#0E1322] px-1.5 py-0.2 border border-[#1E2942]">
                          SCOUTING
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                        Find varsity teammates
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all">→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>
        )}

      </div>
    </div>
  );
}
