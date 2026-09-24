"use client";

import React, { useState, useRef } from "react";
import { ScrimOffer } from "@/types";
import { scrimsService } from "@/services/scrimsService";
import {
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  TrophyIcon,
  CrownIcon,
} from "@/components/ui/Icons";

interface CandidateAthlete {
  userId: string;
  displayName: string;
  gameHandle: string;
  teamId: string;
  teamName: string;
  role?: string;
}

interface ScrimPlayerRow {
  rawIgn: string;
  selectedUserId: string;
  resolvedName: string;
  selectedUniversityId?: string;
  kills: number;
  deaths: number;
  assists: number;
  combatScore?: number;
  confidence: number;
  isHighConfidence: boolean;
  suggestedCandidates: Array<{ candidate: CandidateAthlete; confidence: number }>;
}

interface ScrimOcrIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  scrim: ScrimOffer;
  onFinalized: () => void;
}

export default function ScrimOcrIngestModal({
  isOpen,
  onClose,
  scrim,
  onFinalized,
}: ScrimOcrIngestModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parsed Scan Data
  const [players, setPlayers] = useState<ScrimPlayerRow[]>([]);
  const [winnerTeamId, setWinnerTeamId] = useState<string>("");
  const [allCandidates, setAllCandidates] = useState<CandidateAthlete[]>([]);
  const [hostTeamInfo, setHostTeamInfo] = useState<{ id: string; name: string; universityId: string } | null>(null);
  const [opponentTeamInfo, setOpponentTeamInfo] = useState<{ id: string; name: string; universityId: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a PNG or JPG scoreboard screenshot.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setErrorMsg(null);

    // Automatically trigger OCR scan upon file selection
    setIsScanning(true);
    try {
      const result = await scrimsService.scanScrim(scrim.id, file);

      setHostTeamInfo(result.hostTeam);
      if (result.opponentTeam) setOpponentTeamInfo(result.opponentTeam);

      // Collect all unique candidates from suggestions
      const candidateMap = new Map<string, CandidateAthlete>();
      const rows: ScrimPlayerRow[] = (result.players || []).map((p) => {
        if (p.resolution.matchedCandidate) {
          candidateMap.set(p.resolution.matchedCandidate.userId, p.resolution.matchedCandidate);
        }
        (p.resolution.suggestedCandidates || []).forEach((sc) => {
          candidateMap.set(sc.candidate.userId, sc.candidate);
        });

        const matched = p.resolution.matchedCandidate;
        const uniId =
          matched?.teamId === result.hostTeam.id
            ? result.hostTeam.universityId
            : result.opponentTeam?.universityId || result.hostTeam.universityId;

        return {
          rawIgn: p.resolution.rawIgn || p.extracted.ign || "Player",
          selectedUserId: matched?.userId || "",
          resolvedName: matched?.gameHandle || matched?.displayName || p.resolution.rawIgn,
          selectedUniversityId: uniId,
          kills: p.extracted.kills || 0,
          deaths: p.extracted.deaths || 0,
          assists: p.extracted.assists || 0,
          combatScore: p.extracted.extra?.combatScore ? Number(p.extracted.extra.combatScore) : undefined,
          confidence: p.resolution.confidence || 0,
          isHighConfidence: p.resolution.isHighConfidence,
          suggestedCandidates: p.resolution.suggestedCandidates || [],
        };
      });

      setAllCandidates(Array.from(candidateMap.values()));
      setPlayers(rows);

      // Default winner to host team
      setWinnerTeamId(result.hostTeam.id);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "OCR scanning failed. Please ensure scoreboard image is clear.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectCandidate = (idx: number, userId: string) => {
    const candidate = allCandidates.find((c) => c.userId === userId);
    setPlayers((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        if (!candidate) {
          return { ...p, selectedUserId: "", resolvedName: p.rawIgn };
        }
        const uniId =
          candidate.teamId === hostTeamInfo?.id
            ? hostTeamInfo.universityId
            : opponentTeamInfo?.universityId || hostTeamInfo?.universityId;

        return {
          ...p,
          selectedUserId: candidate.userId,
          resolvedName: candidate.gameHandle || candidate.displayName,
          selectedUniversityId: uniId,
        };
      })
    );
  };

  const handleUpdateStat = (idx: number, field: "kills" | "deaths" | "assists", val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setPlayers((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: num } : p))
    );
  };

  const handleFinalize = async () => {
    if (!winnerTeamId) {
      setErrorMsg("Please select the winning squad.");
      return;
    }

    if (players.length === 0) {
      setErrorMsg("Please upload and scan a scoreboard first.");
      return;
    }

    setIsFinalizing(true);
    setErrorMsg(null);

    const loserTeamId =
      winnerTeamId === hostTeamInfo?.id
        ? opponentTeamInfo?.id || undefined
        : hostTeamInfo?.id;

    try {
      await scrimsService.finalizeScrim(scrim.id, {
        winnerId: winnerTeamId,
        loserId: loserTeamId,
        players: players.map((p) => ({
          userId: p.selectedUserId || undefined,
          universityId: p.selectedUniversityId || hostTeamInfo?.universityId,
          name: p.resolvedName || p.rawIgn,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          combatScore: p.combatScore,
        })),
      });

      onFinalized();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to finalize scrim match log.");
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in"
    >
      <div className="w-full max-w-6xl max-h-[92vh] overflow-hidden bg-[#080C16] border border-cyan-500/40 shadow-2xl rounded-2xl flex flex-col text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#182338] bg-[#0A0E1A] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-cyan-400">
                {"// SCRIM TELEMETRY INGESTION PIPELINE"}
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                {scrim.gameTitle}
              </span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wide">
              {scrim.hostTeamName} vs {scrim.opponentTeamName || "Opponent Squad"} — Official Match Log
            </h3>
            <p className="text-xs font-sans text-slate-400 mt-0.5">
              Scoreboard OCR parses athlete IGNs and maps stats directly into your dedicated team scrim history ledger.
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

        {/* Modal Body: Split into Screenshot Preview & Parsed Mapping Table */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          {/* Left Column: Image Upload & Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[300px] border-2 border-dashed border-[#232F4A] hover:border-cyan-500/60 rounded-xl bg-[#060912] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                  <ShieldIcon className="w-6 h-6" />
                </div>
                <h4 className="font-display text-sm font-bold uppercase text-white">
                  Upload Scoreboard Screenshot
                </h4>
                <p className="text-xs font-sans text-slate-400 mt-1 max-w-xs">
                  Upload post-match scoreboard (PNG/JPG). Our AI fuzzy engine automatically maps extracted IGNs to roster profiles.
                </p>
                <span className="mt-4 px-4 py-2 rounded-lg bg-[#141A29] text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold uppercase">
                  Select Screenshot
                </span>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 flex-1">
                <div className="relative flex-1 min-h-[280px] bg-[#04060C] border border-[#182338] rounded-xl overflow-hidden flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Scoreboard Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-mono text-cyan-300 font-bold uppercase animate-pulse">
                        Analyzing Scoreboard with OCR...
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#232D44] text-xs font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Upload Different Screenshot
                </button>
              </div>
            )}

            {/* Scrim Notice */}
            <div className="p-3 bg-[#060912] border border-[#182338] rounded-xl text-[11px] font-mono text-slate-400 space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                <span>Isolated Scrim Ledger</span>
              </div>
              <p className="font-sans text-[11px] text-slate-400 leading-relaxed">
                Stats recorded here are saved under <code className="text-amber-300">SCRIM</code> mode and will never bleed into tournament championship rating periods.
              </p>
            </div>
          </div>

          {/* Right Column: Parsed Mapping & Match Settings (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2 rounded-lg">
                <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Winner Squad Selector */}
            <div className="p-4 bg-[#0A0D18] border border-[#182338] rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Select Winning Squad
                </span>
                <span className="text-[9px] font-mono text-cyan-400">Match Decider</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => hostTeamInfo && setWinnerTeamId(hostTeamInfo.id)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                    winnerTeamId === hostTeamInfo?.id
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm"
                      : "bg-[#060912] border-[#182338] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Host</span>
                    <span className="font-display text-sm font-black uppercase text-white truncate block">
                      {scrim.hostTeamName}
                    </span>
                  </div>
                  {winnerTeamId === hostTeamInfo?.id && (
                    <TrophyIcon className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => opponentTeamInfo && setWinnerTeamId(opponentTeamInfo.id)}
                  className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-center justify-between ${
                    winnerTeamId === opponentTeamInfo?.id
                      ? "bg-emerald-950/40 border-emerald-500 text-white shadow-sm"
                      : "bg-[#060912] border-[#182338] text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 block uppercase">Challenger</span>
                    <span className="font-display text-sm font-black uppercase text-white truncate block">
                      {scrim.opponentTeamName || "Opponent"}
                    </span>
                  </div>
                  {winnerTeamId === opponentTeamInfo?.id && (
                    <TrophyIcon className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Athletes Fuzzy Mapping Table */}
            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Parsed Athletes ({players.length})
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  Confidence Threshold: 85%
                </span>
              </div>

              {players.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0D18] border border-dashed border-[#182338] rounded-xl text-center text-slate-500 text-xs font-mono">
                  <span>No scoreboard scanned yet. Upload screenshot on the left to begin.</span>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                  {players.map((p, idx) => {
                    const isHigh = p.confidence >= 85;
                    // Hide candidates already mapped to a different OCR row
                    // so the same athlete can't be assigned to two rows at
                    // once - but keep this row's own current pick visible.
                    const takenElsewhere = new Set(
                      players
                        .filter((_, i) => i !== idx)
                        .map((pp) => pp.selectedUserId)
                        .filter(Boolean)
                    );
                    const availableCandidates = allCandidates.filter(
                      (c) => c.userId === p.selectedUserId || !takenElsewhere.has(c.userId)
                    );

                    return (
                      <div
                        key={`${p.rawIgn}-${idx}`}
                        className="p-3 bg-[#0A0D18] border border-[#182338] hover:border-cyan-500/30 rounded-xl space-y-2 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-400 font-bold">
                              OCR: <strong className="text-white">{p.rawIgn}</strong>
                            </span>
                          </div>

                          {/* Confidence Score Badge */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                                isHigh
                                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                                  : "bg-amber-950/60 text-amber-300 border-amber-500/40 animate-pulse"
                              }`}
                            >
                              {p.confidence}% Match
                            </span>
                            {!isHigh && (
                              <span className="text-[9px] font-mono text-amber-400 hidden sm:inline">
                                Review Candidate
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Candidate Dropdown & Combat Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_55px_55px_55px] gap-2 items-center">
                          {/* Candidate Selector */}
                          <select
                            value={p.selectedUserId}
                            onChange={(e) => handleSelectCandidate(idx, e.target.value)}
                            aria-label={`Roster match for ${p.rawIgn}`}
                            className={`h-9 px-2 bg-[#060912] border text-xs rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer ${
                              isHigh
                                ? "border-emerald-500/40 text-emerald-200"
                                : "border-amber-500/40 text-amber-200"
                            }`}
                          >
                            <option value="">— Unmatched ({p.rawIgn}) —</option>
                            {availableCandidates.map((c) => (
                              <option key={c.userId} value={c.userId}>
                                {c.gameHandle || c.displayName} ({c.teamName})
                              </option>
                            ))}
                          </select>

                          {/* K / D / A Inputs */}
                          <input
                            type="number"
                            min="0"
                            value={p.kills}
                            onChange={(e) => handleUpdateStat(idx, "kills", e.target.value)}
                            placeholder="K"
                            title="Kills"
                            aria-label="Kills"
                            className="h-9 px-1 bg-[#060912] border border-[#182338] rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                          />
                          <input
                            type="number"
                            min="0"
                            value={p.deaths}
                            onChange={(e) => handleUpdateStat(idx, "deaths", e.target.value)}
                            placeholder="D"
                            title="Deaths"
                            aria-label="Deaths"
                            className="h-9 px-1 bg-[#060912] border border-[#182338] rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                          />
                          <input
                            type="number"
                            min="0"
                            value={p.assists}
                            onChange={(e) => handleUpdateStat(idx, "assists", e.target.value)}
                            placeholder="A"
                            title="Assists"
                            aria-label="Assists"
                            className="h-9 px-1 bg-[#060912] border border-[#182338] rounded text-center text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0A0E1A] border-t border-[#182338] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isFinalizing || isScanning || players.length === 0}
            onClick={handleFinalize}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-black rounded-lg text-xs font-mono font-black uppercase tracking-wider transition-all disabled:opacity-40 shadow-lg shadow-cyan-950/50 cursor-pointer flex items-center gap-2"
          >
            {isFinalizing ? (
              <span>Finalizing Match Log...</span>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 text-black" />
                <span>Finalize & Record Scrim Log</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
