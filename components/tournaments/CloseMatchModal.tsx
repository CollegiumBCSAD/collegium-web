"use client";

import { useEffect, useState } from "react";
import { BracketMatch, ParticipatingTeamDetail } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { TrophyIcon, AlertTriangleIcon } from "@/components/ui/Icons";

interface PlayerRow {
  universityId: string;
  userId: string;
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
  if (!universityId || !roster) return [];
  return roster.members.map((m) => ({
    universityId,
    userId: m.userId,
    name: m.gameHandle || m.displayName || "Athlete",
    kills: "",
    deaths: "",
    assists: "",
  }));
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

  const sanitizeStat = (value: string) => value.replace(/[^\d]/g, "").slice(0, 3);

  const updateRow = (idx: number, field: "kills" | "deaths" | "assists", value: string) => {
    const next = sanitizeStat(value);
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: next } : p)));
  };

  const rowHasData = (p: PlayerRow) => Boolean(p.kills || p.deaths || p.assists);

  const team1Players = players
    .map((p, idx) => ({ ...p, idx }))
    .filter((p) => p.universityId === match.team1.universityId);
  const team2Players = players
    .map((p, idx) => ({ ...p, idx }))
    .filter((p) => p.universityId === match.team2.universityId);

  const missingRoster = team1Players.length === 0 || team2Players.length === 0;

  const handleSubmit = async () => {
    if (missingRoster) {
      setErrorMsg("Both teams need a registered roster before a result can be reported.");
      return;
    }
    if (!winnerId) {
      setErrorMsg("Pick the winning team first.");
      return;
    }

    const filled = players.filter(rowHasData);
    if (filled.length === 0) {
      setErrorMsg("Enter at least one player's stats before confirming.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await tournamentsService.closeMatch(tournamentId, match.id, {
        winnerId,
        players: filled.map((p) => ({
          universityId: p.universityId,
          userId: p.userId,
          name: p.name,
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

  const renderTeamColumn = (teamName: string, universityId: string | undefined, rows: (PlayerRow & { idx: number })[]) => (
    <div className="flex-1 min-w-0 space-y-3">
      <button
        type="button"
        onClick={() => universityId && rows.length > 0 && setWinnerId(universityId)}
        disabled={!universityId || rows.length === 0}
        className={`w-full flex items-center justify-between px-4 py-3 border text-left transition-colors ${
          rows.length === 0
            ? "bg-[#0A0D18] border-[#1E293B] text-slate-500 cursor-not-allowed"
            : winnerId === universityId
            ? "bg-emerald-950/50 border-emerald-500/70 text-emerald-300 cursor-pointer"
            : "bg-[#0A0D18] border-[#1E293B] text-slate-300 hover:border-primary-brand/50 cursor-pointer"
        }`}
      >
        <span className="font-display text-sm font-black uppercase tracking-wide truncate">{teamName}</span>
        {winnerId === universityId && <TrophyIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
      </button>

      {rows.length === 0 ? (
        <div className="p-4 bg-[#060912] border border-dashed border-[#2A3550] text-slate-500 text-xs font-mono text-center rounded-lg">
          No registered athletes for this team.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_3.75rem_3.75rem_3.75rem] gap-2 px-1">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Athlete</span>
            {["K", "D", "A"].map((label) => (
              <span key={label} className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">
                {label}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {rows.map((p) => (
              <div key={p.idx} className="grid grid-cols-[1fr_3.75rem_3.75rem_3.75rem] gap-2">
                <div className="h-11 px-3 flex items-center bg-[#060912] border border-[#1C2538] rounded-lg text-white text-sm font-sans truncate">
                  {p.name}
                </div>
                {(["kills", "deaths", "assists"] as const).map((field) => (
                  <input
                    key={field}
                    type="text"
                    inputMode="numeric"
                    value={p[field]}
                    onChange={(e) => updateRow(p.idx, field, e.target.value)}
                    placeholder="0"
                    className="h-11 px-1 bg-[#060912] border border-[#1C2538] text-white text-base font-mono font-bold text-center rounded-lg focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#0A0D18] border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6 relative rounded-2xl my-auto text-white">
        <div>
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-400 block">
            {"// REPORT MATCH RESULT"}
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white tracking-tight">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
