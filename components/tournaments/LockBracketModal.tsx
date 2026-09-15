"use client";

import { useState } from "react";
import { Tournament } from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import { ShieldIcon, AlertTriangleIcon, SwordsIcon } from "@/components/ui/Icons";

interface TeamEntry {
  id: string;
  name: string;
  universityName: string;
}

interface LockBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  onSuccess?: () => void;
}

export default function LockBracketModal(props: LockBracketModalProps) {
  if (!props.isOpen) return null;
  return <LockBracketModalContent key={props.tournament.id} {...props} />;
}

function LockBracketModalContent({
  onClose,
  tournament,
  onSuccess,
}: LockBracketModalProps) {
  const [teams, setTeams] = useState<TeamEntry[]>(() =>
    (tournament.universities || []).map((u) => ({
      id: u.id,
      name: `${u.name} Valorant`,
      universityName: u.name,
    }))
  );
  const [eventWeightOverride, setEventWeightOverride] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teamCount = teams.length;

  // Calculate Next Power of 2 and Byes
  let nextPow2 = 2;
  while (nextPow2 < Math.max(2, teamCount)) {
    nextPow2 *= 2;
  }
  const byesCount = Math.max(0, nextPow2 - teamCount);

  // Compute Event Weight Tier
  let autoWeight = 1.0;
  let tierLabel = "Small Tournament (<8 Teams)";
  if (teamCount >= 16) {
    autoWeight = 1.5;
    tierLabel = "Large Championship (≥16 Teams)";
  } else if (teamCount >= 8) {
    autoWeight = 1.25;
    tierLabel = "Medium Invitational (8–15 Teams)";
  }

  const effectiveWeight = eventWeightOverride
    ? Math.min(2.0, Math.max(1.0, parseFloat(eventWeightOverride) || autoWeight))
    : autoWeight;

  const moveSeed = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= teams.length) return;
    const newTeams = [...teams];
    const [moved] = newTeams.splice(index, 1);
    newTeams.splice(targetIdx, 0, moved);
    setTeams(newTeams);
  };

  const handleLockAndGenerate = async () => {
    if (teamCount < 2) {
      setErrorMessage("At least 2 approved varsity squads are required to generate a bracket.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Ensure War Room exists for this tournament (Guard Requirement)
      await tournamentsService.ensureWarRoom(tournament.id);

      // 2. Lock Rosters & Generate Bracket
      const overrideVal = eventWeightOverride ? parseFloat(eventWeightOverride) : undefined;
      await tournamentsService.generateBracket(tournament.id, {
        seeds: teams.map((t) => t.id),
        seedingMode: "MANUAL",
        eventWeightOverride: overrideVal,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg =
        errorObj?.response?.data?.message ||
        errorObj?.message ||
        "Failed to lock rosters and generate bracket. Ensure minimum 5 verified athletes per squad and War Room initialization.";
      setErrorMessage(Array.isArray(msg) ? msg.join("; ") : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-2xl bg-[#090D18] border border-[#1E293B] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[92vh]"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}
      >
        {/* Header Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-amber-500 via-primary-brand to-rose-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#182338] bg-[#0C1222]/80 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                Stage 4: Bracket Lock & Seed Confirmation
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {tournament.bracketFormat || "Single Elimination"}
              </span>
            </div>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-wide">
              Lock Rosters & Generate Bracket
            </h2>
            <p className="text-xs font-sans text-slate-400 mt-1">
              Confirm official seeds, event weight tier, and initialize the championship tournament bracket.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-[#141A29] text-slate-400 hover:text-white rounded border border-[#232D44] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-4 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-3">
              <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-mono font-bold text-rose-300 uppercase">Bracket Lock Rejected</p>
                <p className="text-xs font-sans text-rose-200/90 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Warning Banner */}
          <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangleIcon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Irreversible Action Alert
              </span>
            </div>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Locking freezes tournament rosters and creates official <span className="text-white font-semibold">TournamentRoster</span> snapshots.
              The tournament transitions to <span className="text-amber-300 font-mono">ONGOING</span> immediately.
              Pairings, seeds, and event weight cannot be modified once committed.
            </p>
          </div>

          {/* Event Weight & Byes Telemetry Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Event Weight Tier */}
            <div className="p-4 bg-[#0F162A] border border-[#232D44] rounded-xl space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Event Weight Multiplier
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-display font-black text-amber-400">
                  {effectiveWeight.toFixed(2)}×
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  ({tierLabel})
                </span>
              </div>
              <div className="pt-1">
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Manual Override (1.00 – 2.00×):
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.0"
                  value={eventWeightOverride}
                  onChange={(e) => setEventWeightOverride(e.target.value)}
                  placeholder={`Default: ${autoWeight.toFixed(2)}`}
                  className="w-full h-8 px-3 bg-[#080B14] border border-[#232D44] rounded text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Byes & Bracket Format */}
            <div className="p-4 bg-[#0F162A] border border-[#232D44] rounded-xl space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Seed Grid & Byes
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-display font-black text-white">
                    {teamCount} Teams
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    → {nextPow2}-Slot Bracket
                  </span>
                </div>
              </div>
              <div className="p-2.5 bg-[#080B14] border border-[#1A2338] rounded-lg">
                <p className="text-[11px] font-sans text-slate-300">
                  {byesCount > 0 ? (
                    <>
                      <strong className="text-emerald-400 font-mono">{byesCount}</strong> top seeds receive a 1st-round BYE auto-advancement.
                    </>
                  ) : (
                    <span className="text-slate-400">Perfect power-of-two grid (0 byes needed).</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Seeding Order Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <SwordsIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>Verified Varsity Seeds ({teamCount})</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Use ▲ ▼ to adjust seed rank
              </span>
            </div>

            <div className="border border-[#1E293B] rounded-xl overflow-hidden bg-[#0A0D18]">
              {teams.length === 0 ? (
                <div className="py-8 text-center text-xs font-mono text-slate-500">
                  No verified teams found in this tournament.
                </div>
              ) : (
                <div className="divide-y divide-[#162034]">
                  {teams.map((t, idx) => {
                    const receivesBye = idx < byesCount;
                    return (
                      <div
                        key={t.id}
                        className="px-4 py-3 flex items-center justify-between hover:bg-[#0F162A]/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 flex items-center justify-center rounded bg-[#141A29] text-amber-400 border border-[#232D44] font-mono text-xs font-black">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-display font-bold text-white text-sm block">
                              {t.name}
                            </span>
                            <span className="text-[11px] font-sans text-slate-400">
                              {t.universityName}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {receivesBye && (
                            <span className="px-2 py-0.5 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 rounded uppercase">
                              ★ 1st-Round Bye
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => moveSeed(idx, "up")}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#141A29] hover:bg-[#1E293B] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-[#232D44] text-xs font-bold transition-colors cursor-pointer"
                              title="Move seed up"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              disabled={idx === teams.length - 1}
                              onClick={() => moveSeed(idx, "down")}
                              className="w-7 h-7 flex items-center justify-center rounded bg-[#141A29] hover:bg-[#1E293B] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed border border-[#232D44] text-xs font-bold transition-colors cursor-pointer"
                              title="Move seed down"
                            >
                              ▼
                            </button>
                          </div>
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
        <div className="p-4 px-6 bg-[#0A0E1A] border-t border-[#182338] flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="h-10 px-5 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 border border-[#232D44] rounded-lg text-xs font-mono font-bold uppercase transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || teamCount < 2}
            onClick={handleLockAndGenerate}
            className="h-10 px-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-mono font-black text-xs uppercase tracking-wider rounded-lg shadow-lg hover:shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShieldIcon className="w-4 h-4 text-slate-950" />
            <span>{isSubmitting ? "Locking & Generating..." : "Confirm Lock & Generate Bracket"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
