"use client";

import React, { useState } from "react";
import { GameId } from "@/types";
import { GAME_LIST } from "@/lib/games";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { AlertTriangleIcon, LayoutGridIcon } from "@/components/ui/Icons";
import OnboardingGameCard from "./OnboardingGameCard";

const ORG_NAME_LIMIT = 80;

/** Registration stores the optional club name as "Lead Name [Club Name]". */
function orgNameFromDisplayName(displayName: string | undefined): string {
  return displayName?.match(/\[(.+)\]\s*$/)?.[1]?.trim() ?? "";
}

/**
 * First-login step for organizers. Unlike athletes there is no title lock:
 * the titles picked here only seed the console, and organizers can host any
 * title at any time.
 */
export default function OrganizerSetupForm() {
  const { user } = useAuth();
  const { selectGame } = useGame();
  const { completeOrganizerSetup } = useOnboarding();
  const [organizationName, setOrganizationName] = useState(() => orgNameFromDisplayName(user?.displayName));
  const [hostedGameIds, setHostedGameIds] = useState<GameId[]>([]);
  const [error, setError] = useState("");

  const allSelected = hostedGameIds.length === GAME_LIST.length;

  const toggleGame = (gameId: GameId) => {
    setHostedGameIds((prev) => (prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hostedGameIds.length === 0) {
      setError("Pick at least one title you plan to host. You can still host any title later.");
      return;
    }
    // Open the console on the first title they picked.
    selectGame(hostedGameIds[0]);
    completeOrganizerSetup({ hostedGameIds, organizationName: organizationName.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-7">
      <div className="text-center space-y-2">
        <span className="font-mono text-[10px] font-bold tracking-[0.25em] text-amber-400 uppercase">Organizer Setup</span>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
          Set Up Your Host Workspace
        </h1>
        <p className="max-w-lg mx-auto text-xs sm:text-sm font-sans text-slate-400 leading-relaxed">
          Organizers aren&apos;t tied to one game. Pick every title you plan to run events for, and switch between
          them anytime from the console.
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Titles you&apos;ll host · {hostedGameIds.length} selected
          </span>
          <button
            type="button"
            onClick={() => setHostedGameIds(allSelected ? [] : GAME_LIST.map((g) => g.id))}
            className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <LayoutGridIcon className="w-3.5 h-3.5" />
            {allSelected ? "Clear all" : "Select all"}
          </button>
        </div>
        <div role="group" aria-label="Titles you'll host" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {GAME_LIST.map((g) => (
            <OnboardingGameCard
              key={g.id}
              gameId={g.id}
              multi
              isSelected={hostedGameIds.includes(g.id)}
              onSelect={toggleGame}
            />
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full rounded-2xl border border-amber-500/30 bg-[#0D121F]/95 p-5 sm:p-6 space-y-4 shadow-2xl">
        <div>
          <label htmlFor="onboarding-org" className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Organization / Esports Club (Optional)
          </label>
          <input
            id="onboarding-org"
            type="text"
            value={organizationName}
            maxLength={ORG_NAME_LIMIT}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="e.g. UMAK Esports Alliance"
            className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] focus:border-amber-400 text-white text-sm font-sans focus:outline-none transition-colors"
          />
        </div>

        {error && (
          <div role="alert" className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-sans flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
        >
          Open Organizer Console →
        </button>
      </div>
    </form>
  );
}
