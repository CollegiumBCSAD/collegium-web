"use client";

import React, { useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredTeams } from "@/lib/teams";
import AthleteProfileBanner from "@/components/dashboard/AthleteProfileBanner";
import TeamRosterCard from "@/components/dashboard/TeamRosterCard";
import DashboardShortcutTile from "@/components/dashboard/DashboardShortcutTile";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded } = useAuth();

  const userTeams = useMemo(() => {
    if (!user) return [];
    const allTeams = getStoredTeams();
    const myEmail = user.email.toLowerCase().trim();
    const myName = user.displayName.toLowerCase().trim();

    return allTeams.filter((t) =>
      t.members.some(
        (m) =>
          m.email.toLowerCase().trim() === myEmail ||
          m.displayName.toLowerCase().trim() === myName ||
          t.captainName.toLowerCase().trim() === myName
      )
    );
  }, [user]);

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
    <div className="flex flex-col flex-1 bg-gradient-to-b md:bg-gradient-to-r from-[#CC0000]/20 from-0% to-[#0A0C10] to-[50%] md:to-[40%] py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <AthleteProfileBanner user={user} />

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
                    className="h-10 px-4 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center shadow-md shadow-primary-brand/20 transition-all active:scale-[0.98]"
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
