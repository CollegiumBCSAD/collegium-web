"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GAME_LIST, GameId, GAMES } from "@/lib/games";
import { Team } from "@/types";
import { teamsService } from "@/services";
import { useAuth } from "@/context/AuthContext";

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
      const gameTitleMap: Record<string, GameId> = {
        valo: "valo",
        lol: "lol",
        ml: "ml",
        codm: "codm"
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
        gameTitle: gameTitleMap[selectedGame] as GameId,
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
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-12 game-theme-bg">
      <div className="w-full max-w-xl bg-card-bg border border-raised-panel rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative min-h-[540px] flex flex-col justify-between">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-lg border border-raised-panel bg-background hover:bg-raised-panel text-secondary-text hover:text-foreground flex items-center justify-center transition-colors z-10 cursor-pointer"
          title="Close window"
          aria-label="Close window"
        >
          ✕
        </button>

        <div className="flex border border-panel-border rounded-xl bg-background p-1 gap-2 pr-10">
          <Link
            href="/team/create"
            className="flex-1 h-10 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] text-foreground text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center text-center shadow-md shadow-primary-brand/20"
          >
            ➕ Create a Squad
          </Link>
          <Link
            href="/team/join"
            className="flex-1 h-10 rounded-lg bg-transparent hover:bg-raised-panel text-secondary-text hover:text-foreground text-xs font-sans font-bold uppercase tracking-wider flex items-center justify-center text-center transition-colors"
          >
            🤝 Join Existing Squad
          </Link>
        </div>

        <div className="border-b border-raised-panel pb-4">
          <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
            {user?.university?.name || "University of Makati"} Hub
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wider text-foreground">
            Create University Squad
          </h1>
          <p className="font-sans text-xs text-secondary-text mt-1">
            Establish a team squad under your university banner. (Limit: 1 active squad per game title).
          </p>
        </div>

        {createdTeam ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-center">
              <span className="w-10 h-10 rounded-full bg-success/20 text-success inline-flex items-center justify-center text-lg font-bold mb-2">
                ✓
              </span>
              <h2 className="font-display text-xl font-bold uppercase text-foreground">
                {createdTeam.name}
              </h2>
              <p className="text-xs font-sans text-secondary-text mt-1">
                Official {GAMES[createdTeam.gameTitle].name} squad for {createdTeam.universityName}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-background border border-panel-border space-y-3">
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text">
                Shareable Team Invite Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getInviteUrl()}
                  className="flex-1 h-11 px-3 rounded-lg bg-card-bg border border-panel-border text-foreground text-xs font-mono select-all focus:outline-none"
                />
                <button
                  onClick={copyInviteLink}
                  className="h-11 px-5 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
                >
                  {copied ? "Copied! ✓" : "Copy Link"}
                </button>
              </div>
              <p className="text-[11px] font-sans text-secondary-text">
                Send this link to teammates with a matching university email domain for instant verified join.
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
                onClick={() => setCreatedTeam(null)}
                className="h-11 px-6 rounded-lg bg-raised-panel text-secondary-text hover:text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Create Another Squad
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error text-xs font-sans leading-relaxed">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-2">
                Target Esports Title
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GAME_LIST.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelectedGame(game.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${selectedGame === game.id
                        ? `${game.borderColor} border-2 bg-card-bg`
                        : "border-panel-border bg-background opacity-70 hover:opacity-100"
                      }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={game.image} alt={game.name} className="w-8 h-8 rounded-md object-cover mb-1" />
                    <span className="font-display text-xs font-bold uppercase">{game.shortName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                Custom Squad Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. UMAK Herons Alpha"
                className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                  Captain In-Game Tag
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
                  Captain Role (Optional)
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
                {isLoading ? "Creating Squad..." : "Create Squad & Generate Invite Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
