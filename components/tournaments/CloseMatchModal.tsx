"use client";

import { useEffect, useState } from "react";
import { BracketMatch, ParticipatingTeamDetail } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { TrophyIcon, AlertTriangleIcon } from "@/components/ui/Icons";

interface PlayerRow {
  universityId: string;
  name: string;
  kills: string;
  deaths: string;
  assists: string;
}

interface CloseMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId: string;
  match: BracketMatch;
  team1Roster?: ParticipatingTeamDetail;
  team2Roster?: ParticipatingTeamDetail;
  onReported: () => void;
}

function buildRows(universityId: string | undefined, roster: ParticipatingTeamDetail | undefined): PlayerRow[] {
  if (!universityId) return [];
  if (roster && roster.members.length > 0) {
    return roster.members.map((m) => ({
      universityId,
      name: m.displayName,
      kills: "",
      deaths: "",
      assists: "",
    }));
  }
  return Array.from({ length: 5 }, () => ({ universityId, name: "", kills: "", deaths: "", assists: "" }));
}

export default function CloseMatchModal({
  isOpen,
  onClose,
  tournamentId,
  match,
  team1Roster,
  team2Roster,
  onReported,
}: CloseMatchModalProps) {
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset the form during render whenever a different match opens, instead
  // of in an effect — avoids a spurious extra render on every open.
  const [initializedForMatchId, setInitializedForMatchId] = useState<string | null>(null);
  if (isOpen && initializedForMatchId !== match.id) {
    setInitializedForMatchId(match.id);
    setPlayers([
      ...buildRows(match.team1.universityId, team1Roster),
      ...buildRows(match.team2.universityId, team2Roster),
    ]);
    setWinnerId(null);
    setErrorMsg("");
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const updateRow = (idx: number, field: "name" | "kills" | "deaths" | "assists", value: string) => {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = async () => {
    if (!winnerId) {
      setErrorMsg("Pick the winning team first.");
      return;
    }
    if (players.length === 0) {
      setErrorMsg("At least one player stat row is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await tournamentsService.closeMatch(tournamentId, match.id, {
        winnerId,
        players: players.map((p) => ({
          universityId: p.universityId,
          name: p.name.trim() || "Player",
          kills: Number(p.kills) || 0,
          deaths: Number(p.deaths) || 0,
          assists: Number(p.assists) || 0,
        })),
      });
      onReported();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to report the match result.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const team1Players = players
    .map((p, idx) => ({ ...p, idx }))
    .filter((p) => p.universityId === match.team1.universityId);
  const team2Players = players
    .map((p, idx) => ({ ...p, idx }))
    .filter((p) => p.universityId === match.team2.universityId);

  const renderTeamColumn = (teamName: string, universityId: string | undefined, rows: (PlayerRow & { idx: number })[]) => (
    <div className="flex-1 min-w-0 space-y-2">
      <button
        type="button"
        onClick={() => universityId && setWinnerId(universityId)}
        disabled={!universityId}
        className={`w-full flex items-center justify-between px-3 py-2 border text-left transition-colors cursor-pointer ${
          winnerId === universityId
            ? "bg-emerald-950/50 border-emerald-500/70 text-emerald-300"
            : "bg-[#0A0D18] border-[#1E293B] text-slate-300 hover:border-primary-brand/50"
        }`}
      >
        <span className="font-display text-xs font-black uppercase tracking-wide truncate">{teamName}</span>
        {winnerId === universityId && <TrophyIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
      </button>

      <div className="space-y-1.5">
        {rows.map((p) => (
          <div key={p.idx} className="grid grid-cols-[1fr_2.5rem_2.5rem_2.5rem] gap-1.5">
            <input
              value={p.name}
              onChange={(e) => updateRow(p.idx, "name", e.target.value)}
              placeholder="Player name"
              className="h-8 px-2 bg-[#060912] border border-[#1C2538] text-white text-[11px] font-sans rounded focus:outline-none focus:border-amber-500"
            />
            {(["kills", "deaths", "assists"] as const).map((field) => (
              <input
                key={field}
                type="number"
                min={0}
                value={p[field]}
                onChange={(e) => updateRow(p.idx, field, e.target.value)}
                placeholder={field[0].toUpperCase()}
                className="h-8 px-1 bg-[#060912] border border-[#1C2538] text-white text-[11px] font-mono text-center rounded focus:outline-none focus:border-amber-500"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-2xl bg-[#0A0D18] border border-amber-500/40 shadow-2xl p-6 space-y-5 relative rounded-2xl my-auto text-white">
        <div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
            {"// REPORT MATCH RESULT"}
          </span>
          <h3 className="font-display text-lg font-black uppercase text-white tracking-tight">
            {match.team1.name} vs {match.team2.name}
          </h3>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
            <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="button"
          disabled
          className="w-full h-9 flex items-center justify-center gap-2 border border-dashed border-[#2A3550] text-slate-500 text-[11px] font-mono font-bold uppercase tracking-wide cursor-not-allowed opacity-60"
        >
          <span>📷</span>
          <span>Scan Screenshot (OCR) — Coming Soon</span>
        </button>

        <div className="flex gap-3">
          {renderTeamColumn(match.team1.name, match.team1.universityId, team1Players)}
          {renderTeamColumn(match.team2.name, match.team2.universityId, team2Players)}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#182338]">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 bg-[#101524] hover:bg-[#1A233A] text-slate-300 hover:text-white border border-[#222E48] text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-10 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Confirm Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
