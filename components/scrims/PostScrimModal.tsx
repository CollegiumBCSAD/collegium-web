"use client";

import React, { useState, useEffect } from "react";
import { GAME_LIST } from "@/lib/games";
import { GameId } from "@/types";
import { getStoredTeams, Team } from "@/lib/teams";

interface PostScrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    gameTitle: GameId;
    teamId?: string;
    hostTeamName: string;
    format: string;
    rankRange: string;
    mapPreference?: string;
    notes: string;
  }) => void;
}

const MAP_OPTIONS = [
  "Ascent",
  "Haven",
  "Split",
  "Bind",
  "Sunset",
  "Lotus",
  "Pearl",
  "Summoner's Rift",
  "Erangel",
  "Bermuda",
];

export default function PostScrimModal({
  isOpen,
  onClose,
  onSubmit,
}: PostScrimModalProps) {
  const [userTeams] = useState<Team[]>(() => getStoredTeams());
  const [formGame, setFormGame] = useState<GameId>("valo");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [formTeamName, setFormTeamName] = useState("");
  const [formFormat, setFormFormat] = useState("BO3");
  const [formRank, setFormRank] = useState("Ascendant+");
  const [formMap, setFormMap] = useState("Ascent");
  const [formNotes, setFormNotes] = useState("");

  // Auto-select first team name if available
  useEffect(() => {
    if (userTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(userTeams[0].id);
      setFormTeamName(userTeams[0].name);
    }
  }, [userTeams, selectedTeamId]);

  // Modal lifecycle listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const found = userTeams.find((t) => t.id === teamId);
    if (found) {
      setFormTeamName(found.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeamName.trim()) return;

    onSubmit({
      gameTitle: formGame,
      teamId: selectedTeamId || undefined,
      hostTeamName: formTeamName.trim(),
      format: formFormat,
      rankRange: formRank,
      mapPreference: formMap,
      notes: formNotes,
    });

    setFormNotes("");
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-raised-panel pb-3">
          <h3 className="font-display text-lg font-bold uppercase text-foreground">
            Post Scrim Offer
          </h3>
          <button
            onClick={onClose}
            aria-label="Close Modal"
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
              Host Squad / Team
            </label>
            {userTeams.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
              >
                {userTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.universityName})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={formTeamName}
                onChange={(e) => setFormTeamName(e.target.value)}
                placeholder="e.g. UMAK Herons Alpha"
                className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border text-foreground text-sm font-sans focus:outline-none"
              />
            )}
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
              Map Preference
            </label>
            <select
              value={formMap}
              onChange={(e) => setFormMap(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
            >
              {MAP_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
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
