"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Team, GameId } from "@/types";
import { GAMES } from "@/lib/games";
import { teamsService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { PlusIcon, UsersIcon, ShieldIcon, AlertTriangleIcon } from "@/components/ui/Icons";

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

  const alreadyMemberInfo = useMemo(() => {
    if (!selectedTeam || !user) return null;
    const currentEmail = user.email ? user.email.toLowerCase() : "";
    const currentId = user.id;

    const existing = selectedTeam.members.find(
      (m) =>
        (currentId && m.userId === currentId) ||
        (currentEmail && m.email && m.email.toLowerCase() === currentEmail)
    );
    if (existing) {
      if (existing.status === "ACCEPTED") {
        return `You are already an active verified athlete on ${selectedTeam.name}.`;
      } else if (existing.status === "PENDING") {
        return `You already have a pending join request awaiting Captain approval for ${selectedTeam.name}.`;
      }
    }
    return null;
  }, [selectedTeam, user]);

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
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8 sm:py-12 game-theme-bg min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-xl bg-[#0D121F]/98 border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative flex flex-col justify-between backdrop-blur-xl">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-brand via-rose-500 to-primary-brand rounded-t-3xl" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-[#232D44] bg-[#141A29] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center text-sm font-bold transition-all z-10 cursor-pointer"
          title="Close window"
          aria-label="Close window"
        >
          ✕
        </button>

        {/* Tab Selector Switcher */}
        <div className="flex border border-[#1C2538] rounded-2xl bg-[#080C14] p-1 gap-2 pr-10">
          <Link
            href="/team/create"
            className="flex-1 h-10 rounded-xl bg-transparent hover:bg-[#141A29] text-slate-400 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Squad</span>
          </Link>
          <Link
            href="/team/join"
            className="flex-1 h-10 rounded-xl bg-gradient-to-r from-primary-brand to-rose-600 text-white text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-md shadow-red-950/40"
          >
            <UsersIcon className="w-4 h-4" />
            <span>Join Squad</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="border-b border-[#1C2538] pb-4">
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 block mb-1 flex items-center gap-1.5">
            <ShieldIcon className="w-4 h-4 text-amber-400" />
            {user?.university?.name || "University"} Circuit
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            {inviteCodeParam ? "JOIN TEAM VIA INVITE" : "BROWSE & JOIN SQUAD"}
          </h1>
          <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed">
            {inviteCodeParam
              ? "Instant domain-verified join link detected."
              : "Select a squad under your university to submit a join request to the Captain."}
          </p>
        </div>

        {alreadyMemberInfo ? (
          <div className="space-y-6 text-center">
            <div className="p-6 rounded-2xl bg-[#080C14] border border-[#1C2538]">
              <span className="w-12 h-12 rounded-full bg-primary-brand/20 text-primary-brand inline-flex items-center justify-center text-xl font-bold mb-3 border border-primary-brand/30">
                ℹ
              </span>
              <h2 className="font-display text-xl font-black uppercase text-white">
                Already Registered on Roster
              </h2>
              <p className="text-xs font-sans text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                {alreadyMemberInfo}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary-brand to-rose-600 hover:opacity-90 text-white font-sans text-xs font-extrabold uppercase tracking-wider flex items-center justify-center text-center shadow-md shadow-red-950/40"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => setUserSelectedTeam(null)}
                className="h-11 px-6 rounded-xl bg-[#141A29] text-slate-300 hover:text-white font-sans text-xs font-bold uppercase tracking-wider border border-[#232D44] transition-colors cursor-pointer"
              >
                Browse Other Squads
              </button>
            </div>
          </div>
        ) : resultMessage ? (
          <div className="space-y-6 text-center">
            <div className={`p-6 rounded-2xl border ${resultMessage.success ? (resultMessage.isInstant ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" : "bg-amber-950/40 border-amber-500/40 text-amber-400") : "bg-rose-950/40 border-rose-500/40 text-rose-400"}`}>
              <span className={`w-12 h-12 rounded-full inline-flex items-center justify-center text-xl font-bold mb-3 ${resultMessage.success ? (resultMessage.isInstant ? "bg-emerald-900/60 text-emerald-400 border border-emerald-500/50" : "bg-amber-900/60 text-amber-400 border border-amber-500/50") : "bg-rose-900/60 text-rose-400 border border-rose-500/50"}`}>
                {resultMessage.success ? (resultMessage.isInstant ? "✓" : "⏳") : "!"}
              </span>
              <h2 className="font-display text-xl font-black uppercase text-white">
                {resultMessage.success ? (resultMessage.isInstant ? "Roster Entry Confirmed!" : "Request Submitted") : "Notice"}
              </h2>
              <p className="text-xs font-sans text-slate-300 mt-2 max-w-md mx-auto">
                {resultMessage.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary-brand to-rose-600 hover:opacity-90 text-white font-sans text-xs font-extrabold uppercase tracking-wider flex items-center justify-center text-center shadow-md shadow-red-950/40"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => setResultMessage(null)}
                className="h-11 px-6 rounded-xl bg-[#141A29] text-slate-300 hover:text-white font-sans text-xs font-bold uppercase tracking-wider border border-[#232D44] transition-colors cursor-pointer"
              >
                Back to Team List
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoinSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-sans leading-relaxed flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!inviteCodeParam && (
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Select University Squad
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {teams.length === 0 ? (
                    <p className="text-xs text-slate-400">No active squads found for your university.</p>
                  ) : (
                    teams.map((t) => {
                      const isSel = selectedTeam?.id === t.id;
                      const game = GAMES[t.gameTitle];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setUserSelectedTeam(t)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${isSel
                              ? "border-primary-brand border-2 bg-[#141A29]"
                              : "border-[#1C2538] bg-[#080C14] hover:bg-[#141A29]"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={game.image} alt={game.name} className="w-8 h-8 rounded-md object-cover" />
                            <div>
                              <h4 className="font-display text-sm font-black uppercase text-white">{t.name}</h4>
                              <span className="text-[10px] font-mono text-slate-400">
                                Captain: {t.captainName} · {t.members.length} Members
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-mono font-bold text-primary-brand">
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
              <div className="p-3.5 rounded-2xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block">
                    Target Squad
                  </span>
                  <h3 className="font-display text-base font-black uppercase text-white">
                    {selectedTeam.name}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-primary-brand/15 text-primary-brand border border-primary-brand/30">
                  {GAMES[selectedTeam.gameTitle].name}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Your In-Game Tag
                </label>
                <input
                  type="text"
                  value={gameHandle}
                  onChange={(e) => setGameHandle(e.target.value)}
                  placeholder="Riot ID / MLBB ID"
                  className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Preferred Role / Position
                </label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Duelist, Jungler"
                  className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-brand to-rose-600 hover:opacity-90 text-white font-sans text-xs font-extrabold uppercase tracking-widest transition-transform active:scale-95 shadow-md shadow-red-950/40 flex items-center justify-center cursor-pointer disabled:opacity-50"
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
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-slate-400">Loading join flow...</div>}>
      <JoinTeamContent />
    </Suspense>
  );
}
