"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Team, GameId } from "@/types";
import { GAMES } from "@/lib/games";
import { teamsService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { PlusIcon, UsersIcon, ShieldIcon, AlertTriangleIcon } from "@/components/ui/Icons";

const GAME_SPECIFIC_PLACEHOLDERS: Record<string, { tag: string; role: string }> = {
  valo: {
    tag: "e.g. TenZ#NA1",
    role: "e.g. Duelist",
  },
  lol: {
    tag: "e.g. Faker#KR1",
    role: "e.g. Mid Laner",
  },
  ml: {
    tag: "e.g. 12345678 (1234)",
    role: "e.g. Jungler",
  },
  codm: {
    tag: "e.g. Ghost#1234",
    role: "e.g. Main Slayer",
  },
};

function JoinTeamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteCodeParam = searchParams.get("invite");
  const { user } = useAuth();
  const { selectedGame: globalGame } = useGame();
  const activeGame: GameId = globalGame || "valo";
  const activeGameInfo = GAMES[activeGame as keyof typeof GAMES] || GAMES.valo;
  const placeholders = GAME_SPECIFIC_PLACEHOLDERS[activeGame] || GAME_SPECIFIC_PLACEHOLDERS.valo;

  const [teams, setTeams] = useState<Team[]>([]);
  const [inviteTeam, setInviteTeam] = useState<Team | null>(null);
  const [userSelectedTeam, setUserSelectedTeam] = useState<Team | null>(null);

  const [gameHandle, setGameHandle] = useState(() => {
    const gameTitleMap: Record<string, string> = {
      valo: "VALORANT",
      lol: "LOL",
      ml: "MLBB",
      codm: "CODM",
    };
    const title = gameTitleMap[activeGame] || "VALORANT";
    return user?.gameHandles?.find((gh) => gh.gameTitle === title)?.handle || "";
  });
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

  const gameTeams = useMemo(() => {
    return teams.filter((t) => t.gameTitle === activeGame);
  }, [teams, activeGame]);

  const selectedTeam = userSelectedTeam || inviteTeam;

  const existingSquad = useMemo(() => {
    if (!user || teams.length === 0) return null;
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    return teams.find(
      (t) =>
        (myId && t.captainId === myId) ||
        (myName && t.captainName && t.captainName.toLowerCase().trim() === myName) ||
        t.members?.some(
          (m) =>
            m.status === "ACCEPTED" &&
            ((myId && m.userId === myId) ||
              (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
              (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
        )
    ) || null;
  }, [user, teams]);

  const alreadyMemberInfo = useMemo(() => {
    if (!selectedTeam || !user) return null;
    const currentEmail = user.email ? user.email.toLowerCase() : "";
    const currentId = user.id;

    const existing = selectedTeam.members.find(
      (m) =>
        (currentId && m.userId === currentId) ||
        (currentEmail && m.email && m.email.toLowerCase() === currentEmail) ||
        (user.displayName && m.displayName && m.displayName.toLowerCase() === user.displayName.toLowerCase())
    );

    if (existing) {
      if (existing.status === "ACCEPTED") {
        return "You are already an active athlete on this roster.";
      }
      if (existing.status === "PENDING") {
        return "Your application to join this squad is currently pending Captain review.";
      }
    }
    return null;
  }, [selectedTeam, user]);

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedTeam) {
      setError("Please select a varsity squad to join.");
      return;
    }
    if (!gameHandle.trim()) {
      setError(`Please enter your exact in-game tag (${placeholders.tag.split(" (")[0]}).`);
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
        gameHandle: gameHandle.trim(),
        preferredRole: preferredRole.trim(),
        inviteCode: inviteCodeParam || undefined,
      });

      const isInstant = res.status === "ACCEPTED" || Boolean(inviteCodeParam);
      setResultMessage({
        success: true,
        isInstant,
        message: res.message || (isInstant ? "Successfully joined roster!" : "Application sent to Team Captain."),
      });
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj?.response?.data?.message || errorObj?.message || "Failed to join team.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-8 sm:py-12 game-theme-bg min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-xl bg-[#0D121F]/98 border border-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative flex flex-col justify-between backdrop-blur-xl overflow-hidden">
        {/* Top Accent Gradient Border (Contained within modal) */}
        <div 
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background: `linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, var(--primary-brand) 70%, transparent 100%)`,
            boxShadow: `0 0 10px var(--primary-brand)`,
          }}
        />

        {/* Top Control Bar: Full-Width Tab Segmented Switcher + Aligned Close Button */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 grid grid-cols-2 p-1.5 rounded-2xl bg-[#080C14] border border-[#1C2538] gap-1.5 items-center">
            <Link
              href="/team/create"
              className="h-11 rounded-xl bg-transparent hover:bg-[#141A29] text-slate-400 hover:text-white text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center transition-all cursor-pointer"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Create Squad</span>
            </Link>
            <Link
              href="/team/join"
              className="h-11 game-theme-btn text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center w-full"
            >
              <UsersIcon className="w-4 h-4" />
              <span>Join Squad</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-12 h-12 rounded-2xl border border-[#232D44] bg-[#0E1424] hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 flex items-center justify-center text-base font-bold transition-all shrink-0 cursor-pointer shadow-md hover:border-rose-500/40 active:scale-95"
            title="Close window"
            aria-label="Close window"
          >
            ✕
          </button>
        </div>

        {/* Header Title */}
        <div className="border-b border-[#1C2538] pb-4">
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 block mb-1 flex items-center gap-1.5">
            <ShieldIcon className="w-4 h-4 text-amber-400" />
            {user?.university?.name || "University"} Varsity Hub
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            JOIN VARSITY ROSTER
          </h1>
          <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed">
            {inviteCodeParam
              ? "Instant domain-verified join link detected."
              : `Select an active ${activeGameInfo.name} squad under your university to submit a join request.`}
          </p>
        </div>

        {existingSquad ? (
          <div className="p-6 sm:p-8 rounded-2xl bg-[#080C14] border border-amber-500/40 text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 inline-flex items-center justify-center shadow-lg mx-auto">
              <ShieldIcon className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase block">
                ROSTER LIMIT ENFORCED
              </span>
              <h2 className="font-display text-xl font-black uppercase text-white mt-1">
                You Already Belong to a Squad
              </h2>
              <p className="text-xs font-sans text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                You are currently registered on <strong className="text-white">{existingSquad.name}</strong> ({GAMES[existingSquad.gameTitle]?.name || existingSquad.gameTitle}). Each collegiate player is strictly limited to <strong>1 varsity squad</strong>.
              </p>
              <p className="text-[11px] font-sans text-slate-400 max-w-md mx-auto mt-1">
                To join a different squad, you must first exit your current squad roster from your dashboard.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-11 px-6 game-theme-btn text-xs font-display font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Manage Squad on Dashboard</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ) : alreadyMemberInfo ? (
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
                className="flex-1 h-11 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider flex items-center justify-center text-center shadow-md"
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
                className="flex-1 h-11 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider flex items-center justify-center text-center shadow-md"
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
                  Select {activeGameInfo.name} Squad
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {gameTeams.length === 0 ? (
                    <p className="text-xs text-slate-400">No active {activeGameInfo.name} squads found for your university.</p>
                  ) : (
                    gameTeams.map((t) => {
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
                  placeholder={placeholders.tag}
                  className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors placeholder:text-slate-500 text-xs sm:text-sm"
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
                  placeholder={placeholders.role}
                  className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors placeholder:text-slate-500 text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 game-theme-btn text-xs font-extrabold uppercase tracking-wider transition-transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50"
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
