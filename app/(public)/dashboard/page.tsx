"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStoredTeams, Team } from "@/lib/teams";
import { GAMES } from "@/lib/games";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded } = useAuth();
  const [userTeams, setUserTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      router.push("/login");
      return;
    }

    if (user) {
      const allTeams = getStoredTeams();
      const myEmail = user.email.toLowerCase().trim();
      const myName = user.displayName.toLowerCase().trim();

      const myTeams = allTeams.filter((t) =>
        t.members.some(
          (m) =>
            m.email.toLowerCase().trim() === myEmail ||
            m.displayName.toLowerCase().trim() === myName ||
            t.captainName.toLowerCase().trim() === myName
        )
      );
      setUserTeams(myTeams);
    }
  }, [isLoaded, isLoggedIn, user, router]);

  if (!isLoaded || !isLoggedIn || !user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">
        Loading Athlete Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] py-10 px-4 sm:px-6 lg:px-10 bg-background">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-card-bg border border-raised-panel shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-brand/20 text-primary-brand border border-primary-brand/30 flex items-center justify-center font-display text-2xl font-bold uppercase">
              {user.displayName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-success px-2 py-0.5 rounded bg-success/10 border border-success/20">
                  ✓ Verified Athlete
                </span>
                <span className="text-[10px] font-sans font-bold uppercase text-secondary-brand px-2 py-0.5 rounded bg-secondary-brand/10 border border-secondary-brand/20">
                  {user.role}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">
                {user.displayName}
              </h1>
              <p className="font-sans text-xs text-secondary-text mt-0.5">
                {user.email} · {user.university?.name || "University of Makati"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/team/create"
              className="flex-1 md:flex-initial h-11 px-5 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center"
            >
              ➕ Create Squad
            </Link>
            <Link
              href="/team/join"
              className="flex-1 md:flex-initial h-11 px-5 rounded-lg border border-raised-panel bg-background hover:bg-raised-panel text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center"
            >
              🤝 Join Squad
            </Link>
          </div>
        </div>

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
                    className="h-10 px-4 rounded-lg bg-primary-brand text-foreground font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center font-bold"
                  >
                    Establish Squad
                  </Link>
                  <Link
                    href="/team/join"
                    className="h-10 px-4 rounded-lg border border-raised-panel text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center"
                  >
                    Browse University Teams
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userTeams.map((t) => {
                  const game = GAMES[t.gameTitle];
                  return (
                    <div
                      key={t.id}
                      className="p-5 rounded-2xl bg-card-bg border border-raised-panel hover:border-primary-brand/50 transition-all space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={game.image} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <h3 className="font-display text-base font-bold uppercase text-foreground">
                              {t.name}
                            </h3>
                            <span className="text-[10px] font-sans text-secondary-text">
                              Captain: {t.captainName}
                            </span>
                          </div>
                        </div>
                        <span
                          className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-full text-white"
                          style={{ backgroundColor: game.accentColor }}
                        >
                          {game.shortName}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-raised-panel flex items-center justify-between text-xs font-sans">
                        <span className="text-secondary-text">{t.members.length} Members</span>
                        <Link
                          href={`/team/join?invite=${t.inviteCode}`}
                          className="text-primary-brand font-semibold hover:underline"
                        >
                          Roster Details →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold uppercase tracking-wider text-foreground">
              Circuit Shortcuts
            </h2>

            <div className="p-5 rounded-2xl bg-card-bg border border-raised-panel space-y-3">
              <Link
                href="/tournaments"
                className="w-full p-3 rounded-xl bg-background border border-panel-border hover:border-primary-brand flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">🏆</span>
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase text-foreground">Tournaments</h4>
                    <span className="text-[10px] font-sans text-secondary-text">View active brackets & box scores</span>
                  </div>
                </div>
                <span className="text-xs text-secondary-text">→</span>
              </Link>

              <Link
                href="/scrims"
                className="w-full p-3 rounded-xl bg-background border border-panel-border hover:border-primary-brand flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">⚔️</span>
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase text-foreground">Scrim Finder</h4>
                    <span className="text-[10px] font-sans text-secondary-text">Book practice matches</span>
                  </div>
                </div>
                <span className="text-xs text-secondary-text">→</span>
              </Link>

              <Link
                href="/recruit"
                className="w-full p-3 rounded-xl bg-background border border-panel-border hover:border-primary-brand flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">📢</span>
                  <div>
                    <h4 className="font-display text-xs font-bold uppercase text-foreground">LFT / LFP Board</h4>
                    <span className="text-[10px] font-sans text-secondary-text">Recruit athletes or find squads</span>
                  </div>
                </div>
                <span className="text-xs text-secondary-text">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
