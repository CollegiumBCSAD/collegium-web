"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { teamsService } from "@/services/teamsService";
import { GAMES } from "@/lib/games";
import AthleteProfileBanner from "@/components/dashboard/AthleteProfileBanner";
import TeamRosterCard from "@/components/dashboard/TeamRosterCard";
import CaptainRequestInbox from "@/components/CaptainRequestInbox";
import { TrophyIcon, SwordsIcon, UsersIcon, ShieldIcon, CheckCircleIcon, ZapIcon, ClockIcon, AlertTriangleIcon } from "@/components/ui/Icons";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded } = useAuth();
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
        Loading Athlete Profile...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-12 px-4 sm:px-6 lg:px-12 relative">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        
        {/* Verification Alert Banner */}
        {user.status === "PENDING" && (
          <div className="p-5 rounded-2xl bg-[#0D121F]/90 border border-[#1E293B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <span className="font-mono font-bold text-slate-200 uppercase tracking-wider block">Account Verification Pending</span>
                <span className="text-slate-400">Your student email (@{user.university?.domain || "edu"}) is undergoing verification. Match participation requires active approval.</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#141A29] text-slate-300 font-mono font-bold uppercase text-[10px] tracking-wider shrink-0 border border-[#232D44]">
              PENDING VERIFICATION
            </span>
          </div>
        )}

        {(user.status === "REJECTED" || user.status === "SUSPENDED") && (
          <div className="p-5 rounded-2xl bg-[#0D121F]/90 border border-rose-500/40 flex items-center gap-3 text-xs font-sans text-rose-400 shadow-xl backdrop-blur-md">
            <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider block">Account {user.status}</span>
              <span className="text-slate-300">Your access to competitive matchmaking is currently restricted. Please contact league administrators.</span>
            </div>
          </div>
        )}

        {/* Top Integrated Athlete Header */}
        <AthleteProfileBanner user={user} />

        {/* 2-Column Main Organized Dashboard Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Squad Operations (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Captain Roster Inbox Controls */}
            {isCaptain && <CaptainRequestInbox />}

            {/* Pending Squad Join Requests */}
            {pendingUserTeams.length > 0 && (
              <div className="p-6 rounded-3xl bg-[#0D121F]/90 border border-[#1E293B] space-y-4 shadow-xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <h3 className="font-display text-base font-bold uppercase tracking-wider text-white">
                      Pending Squad Join Requests ({pendingUserTeams.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-[#141A29] text-slate-300 uppercase tracking-wider border border-[#232D44]">
                    Awaiting Captain Approval
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pendingUserTeams.map((t) => {
                    const game = GAMES[t.gameTitle] || GAMES.valo;
                    return (
                      <div key={t.id} className="p-4 rounded-2xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={game.image} alt={game.name} className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="font-display text-xs font-bold uppercase text-white truncate">{t.name}</h4>
                            <span className="text-[10px] font-sans text-slate-400 truncate block">Captain: {t.captainName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCancelPendingRequest(t.id)}
                            className="text-[10px] font-mono font-bold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-[#141A29] border border-[#232D44] cursor-pointer transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Varsity Squad Roster Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                <h2 className="font-display text-base font-bold uppercase tracking-wide text-white flex items-center gap-2">
                  <SwordsIcon className="w-4 h-4 text-primary-brand" />
                  <span>My Active Varsity Squads</span>
                </h2>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {userTeams.length} Active {userTeams.length === 1 ? "Squad" : "Squads"}
                </span>
              </div>

              {userTeams.length === 0 ? (
                <div className="p-8 rounded-3xl bg-[#0D121F]/90 border border-[#1E293B] text-center space-y-4 shadow-xl backdrop-blur-md">
                  <div className="w-12 h-12 rounded-2xl bg-[#141A29] text-slate-400 border border-[#232D44] flex items-center justify-center mx-auto text-xl">
                    <ShieldIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold uppercase text-white">No Active Squad Roster</h3>
                    <p className="text-xs font-sans text-slate-400 max-w-md mx-auto mt-1">
                      You are not currently listed on any active collegiate squad rosters. Establish a squad or join your university team.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Link
                      href="/team/create"
                      className="h-10 px-5 rounded-xl game-theme-btn font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center shadow-lg transition-all active:scale-[0.98]"
                    >
                      Establish Squad
                    </Link>
                    <Link
                      href="/team/join"
                      className="h-10 px-5 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white border border-[#232D44] font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all active:scale-[0.98] shadow-md"
                    >
                      Browse University Teams
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userTeams.map((t) => (
                    <TeamRosterCard key={t.id} team={t} onRosterUpdated={refreshTeams} />
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Athlete Passport & Quick Links (Span 1) */}
          <div className="space-y-6">
            
            {/* Athlete Passport Evaluation Card */}
            <div className="p-6 rounded-3xl bg-[#0D121F]/90 border border-[#1E293B] space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-[#1E2538] pb-3">
                <ZapIcon className="w-4 h-4 text-slate-400" />
                <h3 className="font-display text-sm font-bold uppercase text-white tracking-wider">
                  Athlete Passport Evaluation
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">GLICKO-2 SCORE</span>
                  <span className="font-display text-base font-bold text-white">1500.0 <span className="text-[10px] font-mono text-slate-400">±350 RD</span></span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">INSTITUTION</span>
                  <span className="text-xs font-sans font-bold text-white truncate max-w-[150px]">{user.university?.name || "University of Makati"}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">LINEUP STATUS</span>
                  <span className="text-[10px] font-mono font-bold text-slate-300 uppercase bg-[#141A29] px-2.5 py-0.5 rounded-full border border-[#232D44] flex items-center gap-1">
                    <CheckCircleIcon className="w-3 h-3 text-slate-400" />
                    VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Competitive Circuit Shortcuts */}
            <div className="p-6 rounded-3xl bg-[#0D121F]/90 border border-[#1E293B] space-y-4 shadow-xl backdrop-blur-md">
              <h3 className="font-display text-sm font-bold uppercase text-white tracking-wider border-b border-[#1E2538] pb-3">
                Competitive Circuit Actions
              </h3>

              <div className="space-y-2.5">
                <Link
                  href="/scrims"
                  className="w-full h-11 px-4 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white border border-[#232D44] font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <SwordsIcon className="w-4 h-4 text-primary-brand" />
                    <span>Book Practice Scrim Match</span>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link
                  href="/tournaments"
                  className="w-full h-11 px-4 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white border border-[#232D44] font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <TrophyIcon className="w-4 h-4 text-slate-300" />
                    <span>View Tournament Brackets</span>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link
                  href="/recruit"
                  className="w-full h-11 px-4 rounded-xl bg-[#141A29] hover:bg-[#1F273D] text-white border border-[#232D44] font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all group"
                >
                  <span className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-slate-300" />
                    <span>Recruit / LFT Board</span>
                  </span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
