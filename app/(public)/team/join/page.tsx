"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Team, GameId } from "@/types";
import { GAMES } from "@/lib/games";
import { teamsService } from "@/services";
import { useAuth } from "@/context/AuthContext";

function JoinTeamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteCodeParam = searchParams.get("invite");
  const { user } = useAuth();

  const [teams, setTeams] = useState<Team[]>([]);
  const [inviteTeam, setInviteTeam] = useState<Team | null>(null);
  const [userSelectedTeam, setUserSelectedTeam] = useState<Team | null>(null);

  const [gameHandle, setGameHandle] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [resultMessage, setResultMessage] = useState<{ success: boolean; isInstant: boolean; message: string } | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const reverseGameTitleMap: Record<string, GameId> = useMemo(() => ({
    VALORANT: "valo",
    LOL: "lol",
    MLBB: "ml",
    CODM: "codm",
  }), []);

  interface RawServerTeam {
    id: string;
    name: string;
    gameTitle: string;
    universityId: string;
    captainId: string;
    captainName?: string;
    inviteCode: string;
    createdAt: string;
    university?: { name: string };
    members?: Array<{
      id: string;
      user?: { id?: string; displayName?: string; email?: string };
      gameHandle: string;
      preferredRole?: string;
      status: string;
      createdAt?: string;
    }>;
  }

  const mapServerTeam = useCallback((t: RawServerTeam): Team => ({
    id: t.id,
    name: t.name,
    gameTitle: reverseGameTitleMap[t.gameTitle] || (t.gameTitle as GameId),
    universityId: t.universityId,
    universityName: t.university?.name || "Unknown University",
    captainId: t.captainId,
    captainName: t.captainName || "Team Captain",
    inviteCode: t.inviteCode,
    createdAt: t.createdAt,
    members: t.members?.map((m) => ({
      id: m.id,
      userId: m.user?.id || "",
      displayName: m.user?.displayName || "",
      email: m.user?.email || "",
      gameHandle: m.gameHandle,
      preferredRole: m.preferredRole,
      status: m.status as "ACCEPTED" | "PENDING" | "DECLINED",
      joinedAt: m.createdAt || new Date().toISOString(),
    })) || [],
  }), [reverseGameTitleMap]);

  useEffect(() => {
    teamsService.getTeams()
      .then((data) => setTeams((data as unknown as RawServerTeam[]).map(mapServerTeam)))
      .catch(() => setTeams([]));
  }, [mapServerTeam]);

  useEffect(() => {
    if (inviteCodeParam) {
      teamsService.getTeamByInviteCode(inviteCodeParam)
        .then((data) => setInviteTeam(mapServerTeam(data as unknown as RawServerTeam)))
        .catch(() => setInviteTeam(null));
    }
  }, [inviteCodeParam, mapServerTeam]);

  const selectedTeam = userSelectedTeam || inviteTeam;

  const currentEmail = user?.email || "";

  const alreadyMemberInfo = useMemo(() => {
    if (!selectedTeam) return null;
    const existing = selectedTeam.members.find(
      (m) => m.email.toLowerCase() === currentEmail.toLowerCase()
    );
    if (existing) {
      if (existing.status === "ACCEPTED") {
        return `You are already an active verified athlete on ${selectedTeam.name}.`;
      } else if (existing.status === "PENDING") {
        return `You already have a pending join request awaiting Captain approval for ${selectedTeam.name}.`;
      }
    }
    return null;
  }, [selectedTeam, currentEmail]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
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
    if (!user?.id) {
      setError("You must be logged in to join a team.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await teamsService.joinTeam(selectedTeam.id, {
        userId: user.id,
        inviteCode: inviteCodeParam || undefined,
        gameHandle: gameHandle.trim(),
        preferredRole: preferredRole.trim(),
      });
      
      setResultMessage({
        success: res.success,
        isInstant: res.status === "ACCEPTED" || !!inviteCodeParam,
        message: res.message
      });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj?.response?.data?.message || errorObj?.message || "Failed to join team.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-12 game-theme-bg">
      <div className="w-full max-w-xl bg-card-bg border border-raised-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative min-h-[540px] flex flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 flex border border-panel-border rounded-xl bg-background p-1 gap-2">
            <Link
              href="/team/create"
              className="flex-1 h-10 rounded-lg bg-transparent hover:bg-raised-panel text-secondary-text hover:text-foreground text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center text-center transition-colors"
            >
              ➕ Create a Squad
            </Link>
            <Link
              href="/team/join"
              className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] text-foreground text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center text-center shadow-md shadow-primary-brand/20"
            >
              🤝 Join Existing Squad
            </Link>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 shrink-0 rounded-xl border border-panel-border bg-background hover:bg-raised-panel text-secondary-text hover:text-foreground flex items-center justify-center transition-colors cursor-pointer text-sm"
            title="Close window"
            aria-label="Close window"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-raised-panel pb-4">
          <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
            {user?.university?.name || "University of Makati"} Circuit
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
                href="/dashboard"
                className="flex-1 h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center text-center font-bold"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => setUserSelectedTeam(null)}
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
                href="/dashboard"
                className="flex-1 h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center text-center font-bold"
              >
                Go to Dashboard
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
                          onClick={() => setUserSelectedTeam(t)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isSel
                              ? `${game.borderColor} border-2 bg-background`
                              : "border-panel-border bg-background/50 hover:bg-background"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
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
                disabled={isLoading}
                className="w-full h-11 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-primary-brand/20 flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Submitting Request..." : inviteCodeParam ? "Instant Domain Join Roster" : "Submit Join Request to Captain"}
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
