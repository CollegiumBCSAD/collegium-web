"use client";

import React, { useState } from "react";
import { GAME_LIST } from "@/lib/games";
import { GameId } from "@/types";

interface PostScrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    gameTitle: GameId;
    hostTeamName: string;
    format: string;
    rankRange: string;
    notes: string;
  }) => void;
}

export default function PostScrimModal({
  isOpen,
  onClose,
  onSubmit,
}: PostScrimModalProps) {
  const [formGame, setFormGame] = useState<GameId>("valo");
  const [formTeamName, setFormTeamName] = useState("");
  const [formFormat, setFormFormat] = useState("BO3");
  const [formRank, setFormRank] = useState("Ascendant+");
  const [formNotes, setFormNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeamName.trim()) return;

    onSubmit({
      gameTitle: formGame,
      hostTeamName: formTeamName.trim(),
      format: formFormat,
      rankRange: formRank,
      notes: formNotes,
    });

    setFormTeamName("");
    setFormNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-raised-panel pb-3">
          <h3 className="font-display text-lg font-bold uppercase text-foreground">
            Post Scrim Offer
          </h3>
          <button
            onClick={onClose}
            className="text-secondary-text hover:text-foreground text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Esports Title
            </label>
            <select
              value={formGame}
              onChange={(e) => setFormGame(e.target.value as GameId)}
              className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
            >
              {GAME_LIST.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Host Squad Name
            </label>
            <input
              type="text"
              required
              value={formTeamName}
              onChange={(e) => setFormTeamName(e.target.value)}
              placeholder="e.g. UMAK Herons Alpha"
              className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border text-foreground text-sm font-sans focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                Format
              </label>
              <input
                type="text"
                value={formFormat}
                onChange={(e) => setFormFormat(e.target.value)}
                placeholder="BO1 / BO3 / BO5"
                className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                Target Rank
              </label>
              <input
                type="text"
                value={formRank}
                onChange={(e) => setFormRank(e.target.value)}
                placeholder="e.g. Ascendant+"
                className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Notes / Rules
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Map veto preferences or warm-up objectives..."
              className="w-full p-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-raised-panel text-secondary-text hover:text-foreground text-xs font-bold uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-6 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground text-xs font-bold uppercase transition-all active:scale-[0.98] shadow-md shadow-primary-brand/20 cursor-pointer"
            >
              Publish Scrim Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
