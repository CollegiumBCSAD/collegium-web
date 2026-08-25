"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { TrophyIcon, ShieldIcon } from "@/components/ui/Icons";
import { tournamentsService } from "@/services/tournamentsService";

interface PostTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTournamentCreated: () => void;
}

export default function PostTournamentModal({
  isOpen,
  onClose,
  onTournamentCreated,
}: PostTournamentModalProps) {
  const { selectedGameInfo } = useGame();
  const [name, setName] = useState("");
  const [format, setFormat] = useState("Single Elimination");
  const [teamQuota, setTeamQuota] = useState("8 Universities");
  const [rules, setRules] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await tournamentsService.createTournament(name.trim());
      setName("");
      setRules("");
      onTournamentCreated();
      onClose();
    } catch {
      setErrorMsg("Failed to post tournament. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-lg bg-[#0A0E1A]/98 border border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)]" />

        <div className="flex items-center justify-between border-b border-[#182238] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <TrophyIcon className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
                // ORGANIZER PORTAL
              </span>
              <h3 className="font-display text-lg font-black uppercase text-white">
                Host Collegiate Tournament
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
            className="w-7 h-7 rounded-full bg-[#121828] border border-[#222E48] text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Tournament Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Philippine Collegiate Invitational — Season 2"
              className="w-full h-11 px-4 rounded-xl bg-[#060912] border border-[#1C2538] text-white text-xs font-sans focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Esports Title
              </label>
              <div className="w-full h-11 px-3.5 rounded-xl bg-[#060912] border border-[#1C2538] flex items-center justify-between">
                <span className="font-display text-xs font-black uppercase text-white tracking-wider">
                  {selectedGameInfo?.name || "VALORANT"}
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  ACTIVE
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Bracket Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#060912] border border-[#1C2538] text-white text-xs font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                <option value="Single Elimination">Single Elimination</option>
                <option value="Double Elimination">Double Elimination</option>
                <option value="Round Robin + Playoffs">Round Robin + Playoffs</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Participating Universities Quota
            </label>
            <select
              value={teamQuota}
              onChange={(e) => setTeamQuota(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#060912] border border-[#1C2538] text-white text-xs font-mono focus:border-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="8 Universities">8 Universities (Quarterfinals Bracket)</option>
              <option value="16 Universities">16 Universities (Round of 16 Bracket)</option>
              <option value="32 Universities">32 Universities (Open National Qualifier)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Tournament Rules & Schedule Notes
            </label>
            <textarea
              rows={2}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. Best of 3 Semi-Finals, BO5 Grand Finals. Official varsity rosters only..."
              className="w-full p-3 rounded-xl bg-[#060912] border border-[#1C2538] text-white text-xs font-mono focus:border-amber-500 focus:outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs font-sans text-amber-200/80">
            <ShieldIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Organizer Verification:</strong> Once submitted, your tournament is posted directly to Collegium for university team registrations and bracket seeding.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl bg-[#121828] text-slate-300 hover:text-white border border-[#222E48] text-xs font-mono font-bold uppercase cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <TrophyIcon className="w-4 h-4 text-black" />
              )}
              <span>Publish Tournament</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
