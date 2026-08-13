"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStoredTeams, joinLocalTeam, Team } from "@/lib/teams";
import { GAMES } from "@/lib/games";

function JoinTeamContent() {
  const searchParams = useSearchParams();
  const inviteCodeParam = searchParams.get("invite");

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [gameHandle, setGameHandle] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [userSession, setUserSession] = useState<{ displayName: string; email: string; university: string } | null>(null);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; isInstant: boolean; message: string } | null>(null);
  const [alreadyMemberInfo, setAlreadyMemberInfo] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let currentUser = {
      displayName: "Korbin Canlas",
      email: "canlas@umak.edu.ph",
      university: "University of Makati",
    };

    try {
      const storedUser = localStorage.getItem("collegium_user_session");
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
      }
    } catch {}

    setUserSession(currentUser);

    const loadedTeams = getStoredTeams();
    setTeams(loadedTeams);

    if (inviteCodeParam) {
      const found = loadedTeams.find((t) => t.inviteCode.toLowerCase() === inviteCodeParam.toLowerCase());
      if (found) {
        setSelectedTeam(found);
        const existing = found.members.find(
          (m) => m.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (existing) {
          if (existing.status === "ACCEPTED") {
            setAlreadyMemberInfo(`You are already an active verified athlete on ${found.name}.`);
          } else if (existing.status === "PENDING") {
            setAlreadyMemberInfo(`You already have a pending join request awaiting Captain approval for ${found.name}.`);
          }
        }
      }
    }
  }, [inviteCodeParam]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedTeam) {
      setError("Please select a team to join.");
      return;
    }
    if (!gameHandle.trim()) {
      setError("Please enter your exact in-game handle (Riot ID / MLBB ID).");
      return;
    }

    const res = joinLocalTeam(
      selectedTeam.id,
      inviteCodeParam || undefined,
      userSession?.email || "canlas@umak.edu.ph",
      userSession?.displayName || "Korbin Canlas",
      gameHandle.trim(),
      preferredRole
    );

    setResultMessage(res);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-xl bg-card-bg border border-raised-panel rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 border-b border-raised-panel pb-4">
          <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
            {userSession?.university || "University of Makati"} Circuit
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-foreground">
            {inviteCodeParam ? "Join Team via Invite" : "Browse & Join Squad"}
          </h1>
          <p className="font-sans text-xs text-secondary-text mt-1">
            {inviteCodeParam
              ? "Instant domain-verified join link detected."
              : "Select a squad under your university to submit a join request to the Captain."}
          </p>
        </div>

        {alreadyMemberInfo ? (
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-xl border bg-primary-brand/10 border-primary-brand/30">
              <span className="w-12 h-12 rounded-full bg-primary-brand/20 text-primary-brand inline-flex items-center justify-center text-xl font-bold mb-3">
                ℹ
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-foreground">
                Already Registered on Roster
              </h2>
              <p className="text-xs font-sans text-secondary-text mt-2 max-w-md mx-auto leading-relaxed">
                {alreadyMemberInfo}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/tournaments"
                className="flex-1 h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center text-center"
              >
                View Circuit Tournaments
              </Link>
              <button
                onClick={() => setAlreadyMemberInfo(null)}
                className="h-11 px-6 rounded-lg border border-raised-panel bg-transparent hover:bg-raised-panel text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Browse Other Squads
              </button>
            </div>
          </div>
        ) : resultMessage ? (
          <div className="space-y-6 text-center">
            <div className={`p-6 rounded-xl border ${resultMessage.success ? (resultMessage.isInstant ? "bg-success/10 border-success/30" : "bg-secondary-brand/10 border-secondary-brand/30") : "bg-error/10 border-error/30"}`}>
              <span className={`w-12 h-12 rounded-full inline-flex items-center justify-center text-xl font-bold mb-3 ${resultMessage.success ? (resultMessage.isInstant ? "bg-success/20 text-success" : "bg-secondary-brand/20 text-secondary-brand") : "bg-error/20 text-error"}`}>
                {resultMessage.success ? (resultMessage.isInstant ? "✓" : "⏳") : "!"}
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-foreground">
                {resultMessage.success ? (resultMessage.isInstant ? "Roster Entry Confirmed!" : "Request Submitted") : "Notice"}
              </h2>
              <p className="text-xs font-sans text-secondary-text mt-2 max-w-md mx-auto">
                {resultMessage.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/tournaments"
                className="flex-1 h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center text-center"
              >
                Go to Tournaments
              </Link>
              <button
                onClick={() => setResultMessage(null)}
                className="h-11 px-6 rounded-lg border border-raised-panel bg-transparent hover:bg-raised-panel text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Back to Team List
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans">
                {error}
              </div>
            )}

            {!inviteCodeParam && (
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-2">
                  Select University Squad
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {teams.length === 0 ? (
                    <p className="text-xs text-secondary-text">No active squads found for your university.</p>
                  ) : (
                    teams.map((t) => {
                      const isSel = selectedTeam?.id === t.id;
                      const game = GAMES[t.gameTitle];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setSelectedTeam(t);
                            const existing = t.members.find(
                              (m) => m.email.toLowerCase() === userSession?.email.toLowerCase()
                            );
                            if (existing) {
                              if (existing.status === "ACCEPTED") {
                                setAlreadyMemberInfo(`You are already an active athlete on ${t.name}.`);
                              } else if (existing.status === "PENDING") {
                                setAlreadyMemberInfo(`You already have a pending join request for ${t.name}.`);
                              }
                            }
                          }}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSel
                              ? `${game.borderColor} border-2 bg-background`
                              : "border-panel-border bg-background/50 hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={game.image} alt={game.name} className="w-8 h-8 rounded-md object-cover" />
                            <div>
                              <h4 className="font-display text-sm font-bold uppercase text-foreground">{t.name}</h4>
                              <span className="text-[10px] font-sans text-secondary-text">
                                Captain: {t.captainName} · {t.members.length} Members
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-sans font-bold text-primary-brand">
                            {isSel ? "Selected ✓" : "Select"}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {selectedTeam && (
              <div className="p-3.5 rounded-xl bg-background border border-panel-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-text block">
                    Target Squad
                  </span>
                  <h3 className="font-display text-base font-bold uppercase text-foreground">
                    {selectedTeam.name}
                  </h3>
                </div>
                <span className="text-xs font-sans font-bold px-2.5 py-1 rounded bg-primary-brand/10 text-primary-brand border border-primary-brand/20">
                  {GAMES[selectedTeam.gameTitle].name}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                  Your In-Game Tag
                </label>
                <input
                  type="text"
                  value={gameHandle}
                  onChange={(e) => setGameHandle(e.target.value)}
                  placeholder="Riot ID / MLBB ID"
                  className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                  Preferred Role / Position
                </label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Duelist, Jungler"
                  className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center cursor-pointer"
              >
                {inviteCodeParam ? "Instant Domain Join Roster" : "Submit Join Request to Captain"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text">Loading join flow...</div>}>
      <JoinTeamContent />
    </Suspense>
  );
}
