"use client";

import { useEffect, useRef, useState } from "react";
import { BracketMatch, ParticipatingTeamDetail, ScannedPlayerRow } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { matchRows } from "@/lib/ocrMatch";
import { TrophyIcon, AlertTriangleIcon } from "@/components/ui/Icons";

interface PlayerRow {
  universityId: string;
  userId: string;
  name: string;
  kills: string;
  deaths: string;
  assists: string;
  extra?: Record<string, unknown>;
  scanIdx?: number;
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

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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
  const [players, setPlayers] = useState<PlayerRow[]>(() => [
    ...buildRows(match.team1.universityId, team1Roster),
    ...buildRows(match.team2.universityId, team2Roster),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanNotice, setScanNotice] = useState("");
  const [scannedRows, setScannedRows] = useState<ScannedPlayerRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const updateName = (idx: number, value: string) => {
    setPlayers((prev) => prev.map((p, i) => (i === idx ? { ...p, name: value } : p)));
  };

  const rowHasData = (p: PlayerRow) => Boolean(p.kills || p.deaths || p.assists);

  const team1Players = players
    .map((p, idx) => ({ ...p, idx }))
    .filter((p) => p.universityId === match.team1.universityId);
  const team2Players = players
    .map((p, idx) => ({ ...p, idx }))
    .filter((p) => p.universityId === match.team2.universityId);

  const missingRoster = team1Players.length === 0 || team2Players.length === 0;

  const applyScan = (scanned: ScannedPlayerRow[]) => {
    setScannedRows(scanned);
    const roster = players.map((p, index) => ({ index, ign: p.name }));
    const { assignments } = matchRows(scanned, roster);

    setPlayers((prev) =>
      prev.map((p, i) => {
        const hit = assignments.find((a) => a.index === i);
        if (!hit) return { ...p, scanIdx: undefined };
        return {
          ...p,
          scanIdx: hit.scanIndex,
          kills: String(hit.row.kills),
          deaths: String(hit.row.deaths),
          assists: String(hit.row.assists),
          extra: hit.row.extra,
        };
      })
    );

    const matchedCount = assignments.length;
    const leftover = scanned.length - matchedCount;
    const base = `Auto-matched ${matchedCount} of ${scanned.length} scanned player${scanned.length === 1 ? "" : "s"} by name.`;
    setScanNotice(
      leftover > 0
        ? `${base} For the rest, use each athlete's "from scan" picker to attach the right line.`
        : `${base} Review the stats and confirm.`
    );
  };

  // Attach a scanned line to a roster slot (or detach with scanIdx = null).
  // A one-to-one mapping: taking a line that another slot held clears that slot.
  const assignScanToRow = (rowIdx: number, scanIdx: number | null) => {
    setPlayers((prev) =>
      prev.map((p, i) => {
        if (scanIdx !== null && i !== rowIdx && p.scanIdx === scanIdx) {
          return { ...p, scanIdx: undefined, kills: "", deaths: "", assists: "", extra: undefined };
        }
        if (i !== rowIdx) return p;
        if (scanIdx === null) return { ...p, scanIdx: undefined };
        const row = scannedRows[scanIdx];
        return {
          ...p,
          scanIdx,
          kills: String(row.kills),
          deaths: String(row.deaths),
          assists: String(row.assists),
          extra: row.extra,
        };
      })
    );
  };

  const handleScanChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    setErrorMsg("");
    setScanNotice("");

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please choose an image file (PNG or JPG).");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMsg("That image is larger than 5MB. Please use a smaller screenshot.");
      return;
    }

    setIsScanning(true);
    try {
      const result = await tournamentsService.scanScreenshot(tournamentId, match.id, file);
      if (!result?.players || result.players.length === 0) {
        setErrorMsg("No players could be read from that screenshot. Try a clearer image.");
        return;
      }
      applyScan(result.players);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to scan the screenshot.");
    } finally {
      setIsScanning(false);
    }
  };

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
    if (filled.some((p) => !p.name.trim())) {
      setErrorMsg("Every player with stats needs an in-game name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");
    try {
      await tournamentsService.closeMatch(tournamentId, match.id, {
        winnerId,
        players: filled.map((p) => ({
          universityId: p.universityId,
          userId: p.userId ? p.userId : undefined,
          name: p.name.trim(),
          kills: Number(p.kills) || 0,
          deaths: Number(p.deaths) || 0,
          assists: Number(p.assists) || 0,
          extra: p.extra,
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

  const hasScan = scannedRows.length > 0;
  const gridCols = hasScan
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_3.25rem_3.25rem_3.25rem]"
    : "grid-cols-[1fr_3.75rem_3.75rem_3.75rem]";

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
          <div className={`grid ${gridCols} gap-2 px-1`}>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Athlete</span>
            {hasScan && (
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">From scan</span>
            )}
            {["K", "D", "A"].map((label) => (
              <span key={label} className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">
                {label}
              </span>
            ))}
          </div>

          <div className="space-y-2">
            {rows.map((p) => (
              <div key={p.idx} className="space-y-1">
                <div className={`grid ${gridCols} gap-2`}>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateName(p.idx, e.target.value)}
                    placeholder="In-game name"
                    aria-label="Player in-game name"
                    className="h-11 px-3 bg-[#060912] border border-[#1C2538] rounded-lg text-white text-sm font-sans truncate focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
                  />
                  {hasScan && (
                    <select
                      value={p.scanIdx ?? ""}
                      onChange={(e) => assignScanToRow(p.idx, e.target.value === "" ? null : Number(e.target.value))}
                      aria-label="Attach a scanned scoreboard line to this athlete"
                      className={`h-11 px-2 bg-[#060912] border text-xs rounded-lg focus:outline-none focus:border-amber-500 cursor-pointer truncate ${
                        p.scanIdx !== undefined ? "border-amber-500/50 text-amber-200" : "border-[#1C2538] text-slate-400"
                      }`}
                    >
                      <option value="">— from scan —</option>
                      {scannedRows.map((s, si) => {
                        const takenByOther = players.some((pp, pi) => pi !== p.idx && pp.scanIdx === si);
                        if (takenByOther) return null;
                        return (
                          <option key={si} value={si}>
                            {(s.ign || "(no name)") + ` · ${s.kills}/${s.deaths}/${s.assists}`}
                          </option>
                        );
                      })}
                    </select>
                  )}
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
                {p.extra && Object.keys(p.extra).length > 0 && (
                  <div className="flex flex-wrap gap-1 px-1">
                    {Object.entries(p.extra).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-[9px] font-mono text-slate-400 bg-[#0A0F1C] border border-[#1C2538] rounded px-1.5 py-0.5"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
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
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden"
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0A0D18] border border-amber-500/40 shadow-2xl p-6 sm:p-8 space-y-6 relative rounded-2xl text-white">
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

        {scanNotice && !errorMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs font-mono">
            {scanNotice}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleScanChange}
          className="hidden"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning || missingRoster}
          className="w-full h-9 flex items-center justify-center gap-2 border border-amber-500/40 bg-amber-500/5 text-amber-300 hover:bg-amber-500/10 text-[11px] font-mono font-bold uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-lg"
        >
          <span>{isScanning ? "Scanning screenshot..." : "Scan Screenshot (OCR)"}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderTeamColumn(match.team1.name, match.team1.universityId, team1Players)}
          {renderTeamColumn(match.team2.name, match.team2.universityId, team2Players)}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#182338]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Modal"
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
