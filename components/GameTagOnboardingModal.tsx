"use client";

import React, { useState } from "react";
import { GameId, GAMES } from "@/lib/games";

interface GameTagOnboardingModalProps {
  gameId: GameId;
  isOpen: boolean;
  onClose: () => void;
  onSave: (gameHandle: string, preferredRole: string) => void;
}

export default function GameTagOnboardingModal({
  gameId,
  isOpen,
  onClose,
  onSave,
}: GameTagOnboardingModalProps) {
  const game = GAMES[gameId];
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const roleOptions: Record<GameId, string[]> = {
    valo: ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"],
    lol: ["Top", "Jungle", "Mid", "ADC", "Support"],
    codm: ["Slayer", "Anchor", "Objective", "Sniper", "Flex"],
    ml: ["Exp Lane", "Gold Lane", "Mid Lane", "Roamer", "Jungler"],
  };

  const handlePlaceholder: Record<GameId, string> = {
    valo: "Riot ID e.g. TenZ#NA1",
    lol: "Riot ID e.g. Faker#KR1",
    codm: "CODM Tag e.g. Ghost#1234",
    ml: "MLBB ID e.g. 12345678 (9999)",
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle.trim()) {
      setError("Please enter your exact in-game handle.");
      return;
    }
    if (!role) {
      setError("Please select your primary role/position.");
      return;
    }

    try {
      const stored = localStorage.getItem("collegium_player_credentials");
      const credentials = stored ? JSON.parse(stored) : {};
      credentials[gameId] = { handle: handle.trim(), role };
      localStorage.setItem("collegium_player_credentials", JSON.stringify(credentials));
    } catch {}

    onSave(handle.trim(), role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0C0F17] border border-[#272B3A] rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-raised-panel pb-4 mb-5">
          <div className="flex items-center gap-3">
            <img src={game.image} alt={game.name} className="w-9 h-9 rounded-lg object-cover border border-white/20" />
            <div>
              <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-text block">
                Player Credentials
              </span>
              <h3 className="font-display text-base font-bold uppercase text-foreground">
                {game.name} Verification
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary-text hover:text-foreground text-sm font-bold">
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded bg-error/10 border border-error/30 text-error text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Exact In-Game Tag / Riot ID
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder={handlePlaceholder[gameId]}
              className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border focus:border-primary-brand text-foreground text-sm font-sans focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Primary Role / Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions[gameId].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`h-10 px-3 rounded-lg border text-xs font-sans font-semibold transition-all ${
                    role === r
                      ? "border-primary-brand bg-primary-brand/10 text-foreground"
                      : "border-panel-border bg-background text-secondary-text hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full h-11 rounded-lg bg-primary-brand hover:bg-primary-brand/90 text-foreground font-sans text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              Save Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
