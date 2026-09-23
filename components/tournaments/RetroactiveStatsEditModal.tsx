"use client";

import React, { useState } from "react";
import { BracketMatch } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { AlertTriangleIcon, CheckCircleIcon } from "@/components/ui/Icons";

interface RetroactiveStatsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  match: BracketMatch;
  onStatsUpdated: () => void;
}

interface EditableStatRow {
  userId?: string;
  universityId: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  combatScore?: number;
  headshotPct?: number;
  teamName?: string;
}

function buildInitialRows(match: BracketMatch): EditableStatRow[] {
  return (match.playerStats || []).map((p) => ({
    universityId: p.universityId || match.team1.universityId || "",
    name: p.name,
    kills: p.kills ?? 0,
    deaths: p.deaths ?? 0,
    assists: p.assists ?? 0,
    teamName:
      p.universityId === match.team1.universityId
        ? match.team1.name
        : p.universityId === match.team2.universityId
        ? match.team2.name
        : undefined,
  }));
}

export default function RetroactiveStatsEditModal({
  isOpen,
  onClose,
  tournamentId,
  match,
  onStatsUpdated,
}: RetroactiveStatsEditModalProps) {
  // Seeded once per mount; the parent keys this modal by match id so a
  // different match always gets a fresh set of rows.
  const [rows, setRows] = useState<EditableStatRow[]>(() => buildInitialRows(match));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");


  if (!isOpen) return null;

  const updateField = (idx: number, field: keyof EditableStatRow, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: num } : r))
    );
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      setErrorMsg("No player stats available to update.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await tournamentsService.updateMatchStats(tournamentId, match.id, {
        players: rows.map((r) => ({
          universityId: r.universityId,
          name: r.name,
          kills: r.kills,
          deaths: r.deaths,
          assists: r.assists,
          combatScore: r.combatScore,
          headshotPct: r.headshotPct,
        })),
      });

      setSuccessMsg("Match statistics successfully corrected and committed.");
      setTimeout(() => {
        onStatsUpdated();
        onClose();
      }, 800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update match statistics.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in"
    >
      <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-[#0A0D18] border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-5 relative rounded-2xl text-white">
        <div className="flex items-center justify-between border-b border-[#182338] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
              {"// RETROACTIVE STAT CORRECTION"}
            </span>
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide">
              {match.team1.name} vs {match.team2.name}
            </h3>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Modify combat stats post-match without disrupting existing bracket advancement.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#141A29] hover:bg-[#1E293B] text-slate-400 hover:text-white border border-[#232D44] flex items-center justify-center transition-colors cursor-pointer"
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

        {/* Stats Editing Table */}
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_80px_80px_80px] gap-2 px-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            <span>Athlete</span>
            <span className="text-center">Kills</span>
            <span className="text-center">Deaths</span>
            <span className="text-center">Assists</span>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {rows.map((row, idx) => (
              <div
                key={`${row.name}-${idx}`}
                className="grid grid-cols-[1fr_80px_80px_80px] gap-2 p-2 bg-[#060912] border border-[#182338] rounded-lg items-center"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-sans text-xs font-bold text-white block truncate">
                    {row.name}
                  </span>
                  {row.teamName && (
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {row.teamName}
                    </span>
                  )}
                </div>

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
            ))}
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
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-mono font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "Saving Stats..." : "Save Corrected Stats"}
          </button>
        </div>
      </div>
    </div>
  );
}
