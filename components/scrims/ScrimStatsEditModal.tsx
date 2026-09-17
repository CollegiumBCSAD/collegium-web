"use client";

import React, { useState } from "react";
import { UniversityMatchHistoryEntry } from "@/types";
import { scrimsService } from "@/services/scrimsService";
import { AlertTriangleIcon, CheckCircleIcon, TrophyIcon } from "@/components/ui/Icons";

interface ScrimStatsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The University the currently signed-in athlete is viewing this ledger from. */
  universityId: string;
  universityName: string;
  match: UniversityMatchHistoryEntry;
  onStatsUpdated: () => void;
}

interface EditableStatRow {
  userId?: string | null;
  universityId: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
}

// Editable state is seeded once from `match` via lazy useState initializers
// rather than reset in an effect. The caller is expected to pass
// `key={match.id}` when rendering this modal, so React remounts it fresh -
// and reinitializes these lazy states - whenever a different match is opened
// for editing, instead of a stale row set leaking across matches.
export default function ScrimStatsEditModal({
  isOpen,
  onClose,
  universityId,
  universityName,
  match,
  onStatsUpdated,
}: ScrimStatsEditModalProps) {
  const opponentUniversityId = match.opponent?.id || "";
  const opponentName = match.opponent?.name || "Opponent";

  const [rows, setRows] = useState<EditableStatRow[]>(() =>
    (match.playerStats || []).map((p) => ({
      userId: p.userId,
      universityId: p.universityId || universityId,
      name: p.displayName || p.name,
      kills: p.kills ?? 0,
      deaths: p.deaths ?? 0,
      assists: p.assists ?? 0,
    }))
  );
  const [winnerUniversityId, setWinnerUniversityId] = useState<string>(() => {
    const weWon = match.result === "WIN" || match.result === "FORFEIT_WIN";
    return weWon ? universityId : opponentUniversityId || universityId;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const updateField = (idx: number, field: "kills" | "deaths" | "assists", val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: num } : r)));
  };

  const handleConfirmEdits = async () => {
    if (!match.scrimId) {
      setErrorMsg("This match log has no linked scrim to update.");
      return;
    }
    if (rows.length === 0) {
      setErrorMsg("No player stats available to update.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const loserUniversityId =
      winnerUniversityId === universityId ? opponentUniversityId : universityId;

    try {
      await scrimsService.finalizeScrim(match.scrimId, {
        winnerId: winnerUniversityId,
        loserId: loserUniversityId || undefined,
        players: rows.map((r) => ({
          userId: r.userId || undefined,
          universityId: r.universityId,
          name: r.name,
          kills: r.kills,
          deaths: r.deaths,
          assists: r.assists,
        })),
      });

      setSuccessMsg("Scrim match log successfully updated.");
      setTimeout(() => {
        onStatsUpdated();
        onClose();
      }, 800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update scrim match log.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in"
    >
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-[#0A0D18] border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-5 relative rounded-2xl text-white">
        <div className="flex items-center justify-between border-b border-[#182338] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
              {"// SCRIM MATCH LOG CORRECTION"}
            </span>
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide">
              {universityName} vs {opponentName}
            </h3>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Edit the already-logged combat stats or winner for this scrim, then confirm to commit the change.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141A29] hover:bg-[#1E293B] text-slate-400 hover:text-white border border-[#232D44] flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2 rounded-lg">
            <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center gap-2 rounded-lg">
            <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Winner Toggle */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Winning Squad
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setWinnerUniversityId(universityId)}
              className={`h-10 px-3 rounded-lg border text-xs font-display font-black uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                winnerUniversityId === universityId
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
                  : "bg-[#060912] text-slate-400 border-[#1E293B] hover:border-[#2A3B58]"
              }`}
            >
              {winnerUniversityId === universityId && <TrophyIcon className="w-3.5 h-3.5" />}
              {universityName}
            </button>
            <button
              type="button"
              disabled={!opponentUniversityId}
              onClick={() => opponentUniversityId && setWinnerUniversityId(opponentUniversityId)}
              className={`h-10 px-3 rounded-lg border text-xs font-display font-black uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                winnerUniversityId === opponentUniversityId && opponentUniversityId
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
                  : "bg-[#060912] text-slate-400 border-[#1E293B] hover:border-[#2A3B58]"
              }`}
            >
              {winnerUniversityId === opponentUniversityId && opponentUniversityId && (
                <TrophyIcon className="w-3.5 h-3.5" />
              )}
              {opponentName}
            </button>
          </div>
        </div>

        {/* Stats Editing Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_70px_70px_70px] gap-2 px-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            <span>Athlete</span>
            <span className="text-center">Kills</span>
            <span className="text-center">Deaths</span>
            <span className="text-center">Assists</span>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto">
            {rows.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-500 bg-[#060912] border border-dashed border-[#2A3550] rounded-lg">
                No combat stats were logged for this match.
              </div>
            ) : (
              rows.map((row, idx) => (
                <div
                  key={`${row.name}-${idx}`}
                  className="grid grid-cols-[1fr_70px_70px_70px] gap-2 p-2 bg-[#060912] border border-[#182338] rounded-lg items-center"
                >
                  <span className="font-sans text-xs font-bold text-white truncate pr-2">{row.name}</span>
                  <input
                    type="number"
                    min="0"
                    value={row.kills}
                    onChange={(e) => updateField(idx, "kills", e.target.value)}
                    className="h-9 px-2 bg-[#0A0D18] border border-[#1E293B] rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={row.deaths}
                    onChange={(e) => updateField(idx, "deaths", e.target.value)}
                    className="h-9 px-2 bg-[#0A0D18] border border-[#1E293B] rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="number"
                    min="0"
                    value={row.assists}
                    onChange={(e) => updateField(idx, "assists", e.target.value)}
                    className="h-9 px-2 bg-[#0A0D18] border border-[#1E293B] rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#182338]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 rounded text-xs font-mono uppercase cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleConfirmEdits}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            {isSaving ? "Confirming..." : "Confirm Edits"}
          </button>
        </div>
      </div>
    </div>
  );
}
