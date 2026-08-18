"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GAME_LIST, GameId, GAMES } from "@/lib/games";
import { Team } from "@/types";
import { teamsService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { PlusIcon, UsersIcon, ShieldIcon, AlertTriangleIcon, CheckCircleIcon, TrophyIcon } from "@/components/ui/Icons";

export default function CreateTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameId>("valo");
  const [teamName, setTeamName] = useState("");
  const [gameHandle, setGameHandle] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!teamName.trim()) {
      setError("Please enter a custom squad name.");
      return;
    }
    if (!gameHandle.trim()) {
      setError("Please enter your exact in-game handle (Riot ID / MLBB ID).");
      return;
    }

    if (!user?.id || !user?.universityId) {
      setError("You must be logged in with a verified university to create a team.");
      return;
    }

    setIsLoading(true);
    try {
      const gameTitleMap: Record<string, string> = {
        valo: "VALORANT",
        lol: "LOL",
        ml: "MLBB",
        codm: "CODM"
      };
      interface ServerTeamResponse {
        id: string;
        name: string;
        universityId: string;
        captainId: string;
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

      const res = (await teamsService.createTeam({
        name: teamName.trim(),
        gameTitle: (gameTitleMap[selectedGame] || "VALORANT") as unknown as GameId,
        universityId: user.universityId,
        captainId: user.id,
        gameHandle: gameHandle.trim(),
        preferredRole: preferredRole.trim()
      })) as unknown as ServerTeamResponse;

      const mappedTeam: Team = {
        id: res.id,
        name: res.name,
        gameTitle: selectedGame,
        universityId: res.universityId,
        universityName: res.university?.name || user.university?.name || "Unknown University",
        captainId: res.captainId,
        captainName: user.displayName,
        inviteCode: res.inviteCode,
        createdAt: res.createdAt,
        members: (res.members || []).map((m) => ({
          id: m.id,
          userId: m.user?.id || "",
          displayName: m.user?.displayName || "",
          email: m.user?.email || "",
          gameHandle: m.gameHandle,
          preferredRole: m.preferredRole,
          status: m.status as "ACCEPTED" | "PENDING" | "DECLINED",
          joinedAt: m.createdAt || new Date().toISOString(),
        })),
      };

      setCreatedTeam(mappedTeam);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setError(errorObj?.response?.data?.message || errorObj?.message || "Failed to create team.");
    } finally {
      setIsLoading(false);
    }
  };

  const getInviteUrl = () => {
    if (typeof window === "undefined" || !createdTeam) return "";
    return `${window.location.origin}/team/join?invite=${createdTeam.inviteCode}`;
  };

  const copyInviteLink = () => {
    const url = getInviteUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-12 game-theme-bg relative">
      <div className="w-full max-w-xl bg-[#0C101A]/95 border border-[#1E273A] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative min-h-[540px] flex flex-col justify-between backdrop-blur-xl">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-brand via-accent to-primary-brand rounded-t-2xl" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl border border-[#232D44] bg-[#121624] hover:bg-[#1A2236] text-secondary-text hover:text-foreground flex items-center justify-center transition-all z-10 cursor-pointer"
          title="Close window"
          aria-label="Close window"
        >
          ✕
        </button>

        {/* Tab Selector */}
        <div className="flex border border-[#232D44] rounded-xl bg-[#080B12] p-1 gap-2 pr-10">
          <Link
            href="/team/create"
            className="flex-1 h-10 rounded-lg bg-gradient-to-r from-primary-brand to-[#B91C1C] text-white text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-lg shadow-primary-brand/30"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Squad</span>
          </Link>
          <Link
            href="/team/join"
            className="flex-1 h-10 rounded-lg bg-transparent hover:bg-[#121624] text-secondary-text hover:text-foreground text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center transition-colors"
          >
            <UsersIcon className="w-4 h-4" />
            <span>Join Squad</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="border-b border-[#1E2538] pb-4">
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-secondary-brand block mb-1 flex items-center gap-1.5">
            <ShieldIcon className="w-4 h-4 text-secondary-brand" />
            {user?.university?.name || "University"} Varsity Hub
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-foreground">
            CREATE VARSITY SQUAD
          </h1>
          <p className="font-sans text-xs text-secondary-text mt-1 leading-relaxed">
            Establish a 5-man varsity team under your university banner. (Limit: 1 active squad per title).
          </p>
        </div>

        {createdTeam ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/50 text-emerald-400 inline-flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="font-display text-xl font-extrabold uppercase text-foreground tracking-wide">
                {createdTeam.name}
              </h2>
              <p className="text-xs font-sans text-slate-300">
                Official {GAMES[createdTeam.gameTitle].name} squad for {createdTeam.universityName}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E2538] space-y-3">
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-secondary-text">
                Shareable Team Invite Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteUrl()}
                  className="flex-1 h-11 px-3 rounded-xl bg-[#0F1420] border border-[#232D44] text-foreground text-xs font-mono select-all focus:outline-none"
                />
                <button
                  onClick={copyInviteLink}
                  className="h-11 px-5 rounded-xl bg-primary-brand hover:bg-primary-brand/90 text-white font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-md shadow-primary-brand/30"
                >
                  {copied ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
              <p className="text-[11px] font-sans text-slate-400">
                Send this link to teammates with a matching university domain for instant verified join.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/dashboard"
                className="flex-1 h-11 rounded-xl bg-primary-brand hover:bg-primary-brand/90 text-white font-sans text-xs font-extrabold uppercase tracking-wider transition-colors flex items-center justify-center text-center shadow-lg shadow-primary-brand/30"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={() => setCreatedTeam(null)}
                className="h-11 px-6 rounded-xl bg-[#141926] text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider border border-[#232D44] transition-colors cursor-pointer"
              >
                Create Another Squad
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-sans leading-relaxed flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-secondary-text mb-2">
                Target Esports Title
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GAME_LIST.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedGame === game.id
                        ? `${game.borderColor} border-2 bg-[#141926] shadow-lg shadow-black/40`
                        : "border-[#1E2538] bg-[#080B12] opacity-70 hover:opacity-100 hover:border-[#2C3752]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={game.image} alt={game.name} className="w-8 h-8 rounded-md object-cover mb-1 shadow" />
                    <span className="font-display text-xs font-bold uppercase">{game.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-secondary-text mb-1">
                Custom Squad Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. UMAK Herons Alpha"
                className="w-full h-11 px-4 rounded-xl bg-[#080B12] border border-[#1E2538] focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-secondary-text mb-1">
                  Captain In-Game Tag
                </label>
                <input
                  type="text"
                  value={gameHandle}
                  onChange={(e) => setGameHandle(e.target.value)}
                  placeholder="Riot ID / MLBB ID"
                  className="w-full h-11 px-4 rounded-xl bg-[#080B12] border border-[#1E2538] focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-secondary-text mb-1">
                  Captain Role (Optional)
                </label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Duelist, Jungler"
                  className="w-full h-11 px-4 rounded-xl bg-[#080B12] border border-[#1E2538] focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-brand to-[#B91C1C] hover:from-primary-brand/90 hover:to-[#991B1B] text-white font-sans text-xs font-extrabold uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-primary-brand/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <TrophyIcon className="w-4 h-4" />
                <span>{isLoading ? "Creating Squad..." : "Create Squad & Generate Invite Link"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

