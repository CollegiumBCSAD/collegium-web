"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GameId, GAMES } from "@/lib/games";
import { Team } from "@/types";
import { teamsService } from "@/services";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { PlusIcon, UsersIcon, ShieldIcon, AlertTriangleIcon, CheckCircleIcon, TrophyIcon } from "@/components/ui/Icons";

const GAME_SPECIFIC_PLACEHOLDERS: Record<string, { tag: string; role: string; squadName: string }> = {
  valo: {
    tag: "e.g. TenZ#NA1",
    role: "e.g. Duelist",
    squadName: "e.g. UMAK Herons",
  },
  lol: {
    tag: "e.g. Faker#KR1",
    role: "e.g. Mid Laner",
    squadName: "e.g. UMAK Herons",
  },
  ml: {
    tag: "e.g. 12345678 (1234)",
    role: "e.g. Jungler",
    squadName: "e.g. UMAK Herons",
  },
  codm: {
    tag: "e.g. Ghost#1234",
    role: "e.g. Main Slayer",
    squadName: "e.g. UMAK Herons",
  },
};

export default function CreateTeamPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedGame: globalGame } = useGame();
  const activeGame: GameId = globalGame || "valo";
  const activeGameInfo = GAMES[activeGame as keyof typeof GAMES] || GAMES.valo;
  const placeholders = GAME_SPECIFIC_PLACEHOLDERS[activeGame] || GAME_SPECIFIC_PLACEHOLDERS.valo;

  const gameTitleMap: Record<string, string> = {
    valo: "VALORANT",
    lol: "LOL",
    ml: "MLBB",
    codm: "CODM",
  };

  const [teamName, setTeamName] = useState("");
  const [gameHandle, setGameHandle] = useState(() => {
    const title = gameTitleMap[activeGame] || "VALORANT";
    return user?.gameHandles?.find((gh) => gh.gameTitle === title)?.handle || "";
  });
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
      setError(`Please enter your exact in-game tag (${placeholders.tag.split(" (")[0]}).`);
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
        gameTitle: (gameTitleMap[activeGame] || "VALORANT") as unknown as GameId,
        universityId: user.universityId,
        captainId: user.id,
        gameHandle: gameHandle.trim(),
        preferredRole: preferredRole.trim()
      })) as unknown as ServerTeamResponse;

      const mappedTeam: Team = {
        id: res.id,
        name: res.name,
        gameTitle: activeGame,
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
            className="flex-1 h-10 rounded-xl game-theme-btn text-xs font-mono font-black uppercase tracking-wider flex items-center justify-center gap-2 text-center shadow-md"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create Squad</span>
          </Link>
          <Link
            href="/team/join"
            className="flex-1 h-10 rounded-xl bg-transparent hover:bg-[#141A29] text-slate-400 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-center transition-colors"
          >
            <UsersIcon className="w-4 h-4" />
            <span>Join Squad</span>
          </Link>
        </div>

        {/* Header Title */}
        <div className="border-b border-[#1C2538] pb-4">
          <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-amber-400 block mb-1 flex items-center gap-1.5">
            <ShieldIcon className="w-4 h-4 text-amber-400" />
            {user?.university?.name || "University"} Varsity Hub
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-wider text-white">
            CREATE VARSITY SQUAD
          </h1>
          <p className="font-sans text-xs text-slate-400 mt-1 leading-relaxed">
            Establish a 5-man {activeGameInfo.name} varsity team under your university banner.
          </p>
        </div>

        {createdTeam ? (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-500/50 text-emerald-400 inline-flex items-center justify-center shadow-lg">
                <CheckCircleIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <h2 className="font-display text-xl font-black uppercase text-white tracking-wide">
                {createdTeam.name}
              </h2>
              <p className="text-xs font-sans text-slate-300">
                Official {GAMES[createdTeam.gameTitle].name} squad for {createdTeam.universityName}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#080C14] border border-[#1C2538] space-y-3">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Shareable Team Invite Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteUrl()}
                  className="flex-1 h-11 px-3.5 rounded-xl bg-[#141A29] border border-[#232D44] text-white text-xs font-mono select-all focus:outline-none"
                />
                <button
                  onClick={copyInviteLink}
                  className="h-11 px-5 rounded-xl game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider transition-transform active:scale-95 cursor-pointer shrink-0 shadow-md"
                >
                  {copied ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Send this link to teammates with a matching university domain for instant verified join.
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
                onClick={() => setCreatedTeam(null)}
                className="h-11 px-6 rounded-xl bg-[#141A29] text-slate-300 hover:text-white font-sans text-xs font-bold uppercase tracking-wider border border-[#232D44] transition-colors cursor-pointer"
              >
                Create Another Squad
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-sans leading-relaxed flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                Target Esports Title
              </label>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary-brand bg-[#141A29] shadow-lg shadow-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeGameInfo.image} alt={activeGameInfo.name} className="w-10 h-10 rounded-lg object-cover shadow ring-1 ring-white/10 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-black uppercase text-white tracking-wide">{activeGameInfo.name}</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary-brand/20 text-primary-brand border border-primary-brand/40">
                      ACTIVE TITLE
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-slate-400 block mt-0.5">{activeGameInfo.genre} • {activeGameInfo.publisher}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Custom Squad Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={placeholders.squadName}
                className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Captain In-Game Tag
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
                  Captain Role (Optional)
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
                className="w-full h-11 game-theme-btn text-xs font-extrabold uppercase tracking-wider transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
