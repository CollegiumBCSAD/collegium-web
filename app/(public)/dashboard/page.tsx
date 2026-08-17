"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { GAMES } from "@/lib/games";
import AthleteProfileBanner from "@/components/dashboard/AthleteProfileBanner";
import TeamRosterCard from "@/components/dashboard/TeamRosterCard";
import DashboardShortcutTile from "@/components/dashboard/DashboardShortcutTile";
import CaptainRequestInbox from "@/components/CaptainRequestInbox";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded } = useAuth();
  const [allTeams, setAllTeams] = useState<Team[]>(() => getStoredTeams());

  useEffect(() => {
    fetchTeamsApi().then((teams) => {
      setAllTeams(teams);
    });
  }, []);

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
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">
        Loading Athlete Dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        {user.status === "PENDING" && (
          <div className="p-4 rounded-2xl bg-secondary-brand/10 border border-secondary-brand/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-sans">
            <div className="flex items-center gap-3">
              <span className="text-lg">⏳</span>
              <div>
                <span className="font-bold text-secondary-brand uppercase tracking-wider block">Account Approval Pending</span>
                <span className="text-secondary-text">Your student email (@{user.university?.domain || "edu"}) is undergoing verification. Match participation requires active approval.</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-secondary-brand/20 text-secondary-brand font-extrabold uppercase text-[10px] tracking-wider shrink-0">
              PENDING VERIFICATION
            </span>
          </div>
        )}

        {(user.status === "REJECTED" || user.status === "SUSPENDED") && (
          <div className="p-4 rounded-2xl bg-error/10 border border-error/30 flex items-center gap-3 text-xs font-sans text-error">
            <span className="text-lg">🚨</span>
            <div>
              <span className="font-bold uppercase tracking-wider block">Account {user.status}</span>
              <span className="text-secondary-text">Your access to competitive matchmaking is currently restricted. Please contact league administrators.</span>
            </div>
          </div>
        )}

        <AthleteProfileBanner user={user} />

        {isCaptain && <CaptainRequestInbox />}

        {pendingUserTeams.length > 0 && (
          <div className="p-5 rounded-2xl bg-secondary-brand/10 border border-secondary-brand/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                  Pending Squad Join Requests ({pendingUserTeams.length})
                </h3>
              </div>
              <span className="text-[10px] font-sans font-extrabold px-2.5 py-1 rounded bg-secondary-brand/20 text-secondary-brand uppercase tracking-wider">
                Awaiting Captain Approval
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pendingUserTeams.map((t) => {
                const game = GAMES[t.gameTitle] || GAMES.valo;
                return (
                  <div key={t.id} className="p-3.5 rounded-xl bg-card-bg border border-panel-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={game.image} alt={game.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-display text-xs font-bold uppercase text-foreground">{t.name}</h4>
                        <span className="text-[10px] font-sans text-secondary-text">Captain: {t.captainName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-sans font-bold text-secondary-brand uppercase bg-secondary-brand/10 px-2.5 py-1 rounded border border-secondary-brand/20">
                      PENDING
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
                My Active Rosters
              </h2>
              <span className="text-xs font-sans text-secondary-text">
                {userTeams.length} Active {userTeams.length === 1 ? "Squad" : "Squads"}
              </span>
            </div>

            {userTeams.length === 0 ? (
              <div className="p-8 rounded-2xl bg-card-bg border border-raised-panel text-center space-y-4">
                <p className="text-xs font-sans text-secondary-text">
                  You are not currently listed on any active collegiate squad rosters.
                </p>
                <div className="flex justify-center gap-3">
                  <Link
                    href="/team/create"
                    className="h-10 px-4 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center shadow-md transition-all active:scale-[0.98]"
                  >
                    Establish Squad
                  </Link>
                  <Link
                    href="/team/join"
                    className="h-10 px-4 rounded-lg border border-raised-panel bg-gradient-to-r from-[#191D27] to-[#121520] hover:from-[#232836] hover:to-[#191D27] text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-all active:scale-[0.98]"
                  >
                    Browse University Teams
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTeams.map((t) => (
                  <TeamRosterCard key={t.id} team={t} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
              Circuit Shortcuts
            </h2>

            <div className="p-5 rounded-2xl bg-card-bg border border-raised-panel space-y-3">
              <DashboardShortcutTile
                href="/tournaments"
                icon="🏆"
                title="Tournaments"
                description="View active brackets & box scores"
              />
              <DashboardShortcutTile
                href="/scrims"
                icon="⚔️"
                title="Scrim Finder"
                description="Book practice matches"
              />
              <DashboardShortcutTile
                href="/recruit"
                icon="📢"
                title="LFT / LFP Board"
                description="Recruit athletes or find squads"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
