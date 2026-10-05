"use client";

import React, { useState } from "react";
import { GameId } from "@/types";
import { GAMES, GAME_ID_TO_ENUM, GAME_LIST } from "@/lib/games";
import { authService } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { AlertTriangleIcon, LockIcon } from "@/components/ui/Icons";
import OnboardingGameCard from "./OnboardingGameCard";

const HANDLE_PLACEHOLDERS: Record<GameId, string> = {
  valo: "Riot ID e.g. TenZ#NA1",
  lol: "Riot ID e.g. Faker#KR1",
  codm: "CODM Tag e.g. Ghost#1234",
  ml: "MLBB ID e.g. 12345678 (9999)",
};

const HANDLE_LIMIT = 40;

/**
 * First-login step for athletes: pick the one title they'll compete in and
 * save their IGN for it. Saving the IGN is what marks the athlete as
 * onboarded (see deriveAthleteProfile); OnboardingScreenGate then routes on.
 */
export default function AthleteGameSelector() {
  const { refreshProfile } = useAuth();
  const { selectedGame, selectGame } = useGame();
  const [gameId, setGameId] = useState<GameId | null>(null);
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const game = gameId ? GAMES[gameId] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!gameId) {
      setError("Pick the title you compete in.");
      return;
    }
    if (!handle.trim()) {
      setError("Enter your exact in-game name so captains can verify you.");
      return;
    }

    setIsSaving(true);
    try {
      await authService.updateGameHandle(GAME_ID_TO_ENUM[gameId], handle.trim());
      if (selectedGame !== gameId) selectGame(gameId);
      const profile = await refreshProfile();
      if (!profile) {
        setError("Your title was saved, but we couldn't reload your profile. Refresh the page to continue.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't save your title. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-7">
      <div className="text-center space-y-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-primary-brand uppercase">
          Athlete Setup
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
          Pick Your Primary Title
        </h1>
        <p className="max-w-lg mx-auto text-xs sm:text-sm font-sans text-slate-400 leading-relaxed">
          Collegium athletes compete under a single esports title. Your squad, scrims, and ratings all follow this
          choice.
        </p>
      </div>

      <div role="radiogroup" aria-label="Primary esports title" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {GAME_LIST.map((g) => (
          <OnboardingGameCard key={g.id} gameId={g.id} isSelected={gameId === g.id} onSelect={setGameId} />
        ))}
      </div>

      <div className="max-w-xl mx-auto w-full rounded-2xl border border-[#1E293B] bg-[#0D121F]/95 p-5 sm:p-6 space-y-4 shadow-2xl">
        <div>
          <label htmlFor="onboarding-ign" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            {game ? `${game.shortName} In-Game Name` : "In-Game Name"}
          </label>
          <input
            id="onboarding-ign"
            type="text"
            value={handle}
            maxLength={HANDLE_LIMIT}
            disabled={!gameId}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={gameId ? HANDLE_PLACEHOLDERS[gameId] : "Select a title first"}
            className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-primary-brand text-white text-sm font-sans focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] font-sans text-amber-200/90 leading-relaxed">
          <LockIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
          <span>
            This locks your account to {game ? <strong className="text-white">{game.name}</strong> : "one title"}. You
            can browse every game, but you can only create or join squads in this one.
          </span>
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-sans flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-11 game-theme-btn rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50"
        >
          {isSaving ? "Saving…" : game ? `Lock In ${game.shortName} & Continue →` : "Continue →"}
        </button>
      </div>
    </form>
  );
}
