"use client";

import { useEffect, useState } from "react";
import { Tournament } from "@/types";
import { tournamentsService, adminService } from "@/services";
import { GAMES, GAME_LIST } from "@/lib/games";
import {
  TrophyIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "@/components/ui/Icons";

interface TournamentModerationPanelProps {
  initialTournaments?: Tournament[];
}

export default function TournamentModerationPanel({
  initialTournaments = [],
}: TournamentModerationPanelProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
  const [loading, setLoading] = useState(initialTournaments.length === 0);
  const [activeGameFilter, setActiveGameFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Rejection modal state
  const [rejectingTournament, setRejectingTournament] = useState<Tournament | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionPreset, setRejectionPreset] = useState<string | null>(null);

  const REJECTION_PRESETS = [
    "Prize pool distribution structure is unclear or non-compliant.",
    "Tournament rules do not specify anti-cheat or dispute resolution policies.",
    "Schedule conflicts with official Collegiate Circuit blackout dates.",
    "Team quota and bracket size are inconsistent with tournament format.",
    "Organizer contact information or institutional backing is unverified.",
  ];

  useEffect(() => {
    let active = true;
    tournamentsService
      .getPendingTournaments()
      .then((pending) => {
        if (active) setTournaments(pending);
      })
      .catch((err) => {
        console.error("Failed to load pending tournaments:", err);
        if (active) {
          setFeedbackMessage({
            type: "error",
            text: "Could not connect to tournament backend. Please try again.",
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const pending = await tournamentsService.getPendingTournaments();
      setTournaments(pending);
    } catch (err) {
      console.error("Failed to load pending tournaments:", err);
      setFeedbackMessage({
        type: "error",
        text: "Could not connect to tournament backend. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tourney: Tournament) => {
    setActionLoading(tourney.id);
    setFeedbackMessage(null);
    try {
      await adminService.approveTournament(tourney.id);
      setTournaments((prev) => prev.filter((t) => t.id !== tourney.id));
      setFeedbackMessage({
        type: "success",
        text: `Tournament "${tourney.title}" has been sanctioned and published to the public circuit!`,
      });
    } catch (err) {
      console.error("Approve failed:", err);
      setFeedbackMessage({
        type: "error",
        text: `Failed to sanction tournament. Please try again.`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (tourney: Tournament) => {
    setRejectingTournament(tourney);
    setRejectionReason("");
    setRejectionPreset(null);
  };

  const handleConfirmReject = async () => {
    if (!rejectingTournament) return;
    const finalReason = rejectionReason.trim() || rejectionPreset || "Did not meet collegiate circuit requirements.";
    setActionLoading(rejectingTournament.id);
    setFeedbackMessage(null);
    try {
      await adminService.rejectTournament(rejectingTournament.id, finalReason);
      setTournaments((prev) => prev.filter((t) => t.id !== rejectingTournament.id));
      setFeedbackMessage({
        type: "success",
        text: `Tournament "${rejectingTournament.title}" was rejected. Feedback logged for organizer.`,
      });
      setRejectingTournament(null);
    } catch (err) {
      console.error("Reject failed:", err);
      setFeedbackMessage({
        type: "error",
        text: `Failed to reject tournament. Please try again.`,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (activeGameFilter === "all") return true;
    return t.game.toLowerCase().includes(activeGameFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedbackMessage.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangleIcon className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-mono font-medium">
              {feedbackMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveGameFilter("all")}
            className={`h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide border transition-all cursor-pointer ${
              activeGameFilter === "all"
                ? "bg-[#111A15] border-emerald-500/50 text-white shadow-sm"
                : "border-[#1A1A1A] bg-[#0A0A0A] text-neutral-400 hover:text-white hover:bg-[#141414]"
            }`}
          >
            All Disciplines ({tournaments.length})
          </button>
          {GAME_LIST.map((g) => {
            const count = tournaments.filter((t) =>
              t.game.toLowerCase().includes(g.id.toLowerCase())
            ).length;
            if (count === 0 && activeGameFilter !== g.id) return null;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveGameFilter(g.id)}
                className={`h-9 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wide border transition-all cursor-pointer ${
                  activeGameFilter === g.id
                    ? "bg-[#111A15] border-emerald-500/50 text-white shadow-sm"
                    : "border-[#1A1A1A] bg-[#0A0A0A] text-neutral-400 hover:text-white hover:bg-[#141414]"
                }`}
              >
                {g.shortName} ({count})
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="h-9 px-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A] hover:bg-[#141414] text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <span>{loading ? "Syncing..." : "↻ Refresh Queue"}</span>
        </button>
      </div>

      {/* Main Review Queue */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-neutral-500 space-y-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Querying collegiate circuit sanctioning database...</p>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-[#1A1A1A] bg-[#0A0A0A] p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#222222] text-neutral-500 mx-auto flex items-center justify-center">
            <TrophyIcon className="w-6 h-6" />
          </div>
          <h3 className="font-display text-base font-bold text-white uppercase tracking-wider">
            Review Queue Clean
          </h3>
          <p className="text-xs font-mono text-neutral-500 max-w-md mx-auto">
            All organizer-submitted tournaments have been audited and resolved. New sanction requests will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTournaments.map((t) => {
            const isLoading = actionLoading === t.id;
            const coverImage = t.image || GAMES[t.game as keyof typeof GAMES]?.image || "/valorant.png";

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] overflow-hidden hover:border-emerald-500/40 transition-all duration-300 group shadow-md"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left Artwork */}
                  <div className="relative md:w-72 h-44 md:h-auto bg-[#050505] shrink-0 overflow-hidden">
                    <img
                      src={coverImage}
                      alt={t.title}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent pointer-events-none" />
                    <span className="absolute top-3 left-3 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur-md text-emerald-300 border border-emerald-500/30 shadow-md">
                      {t.game}
                    </span>
                  </div>

                  {/* Right Details & Actions */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1">
                            {"// ORGANIZER SUBMISSION"}
                          </span>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {t.title}
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0">
                          PENDING SANCTION
                        </span>
                      </div>

                      {/* Telemetry Chips */}
                      <div className="flex items-center gap-2 text-xs font-mono text-neutral-300 flex-wrap">
                        <span className="px-3 py-1 rounded-xl bg-[#141414] border border-[#222222] text-neutral-200 text-xs">
                          Format: <strong className="text-white">{t.bracketFormat || "Single Elimination"}</strong>
                        </span>
                        {t.teamQuota && (
                          <span className="px-3 py-1 rounded-xl bg-[#141414] border border-[#222222] text-neutral-200 text-xs">
                            Quota: <strong className="text-white">{t.teamQuota} Teams</strong>
                          </span>
                        )}
                      </div>

                      {t.rules && (
                        <div className="p-3.5 rounded-xl bg-[#050505] border border-[#171717] text-xs font-mono text-neutral-300">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                            Rules / Schedule Notes:
                          </span>
                          <p className="line-clamp-2 leading-relaxed text-neutral-300">{t.rules}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#171717]">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleOpenRejectModal(t)}
                        className="h-10 px-5 rounded-xl bg-[#190D10] hover:bg-rose-950/60 text-rose-300 hover:text-white border border-rose-900/40 hover:border-rose-500/50 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      >
                        Reject Submission
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleApprove(t)}
                        className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-extrabold text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-4 h-4 text-black" />
                            <span>Approve &amp; Sanction</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingTournament && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-1">
                  SANCTION REJECTION
                </span>
                <h3 className="font-display text-lg font-bold text-white">
                  Reject &ldquo;{rejectingTournament.title}&rdquo;
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingTournament(null)}
                className="text-neutral-500 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs font-mono text-neutral-400 leading-relaxed">
              Select or provide feedback to notify the organizer why their tournament submission cannot be sanctioned at this time:
            </p>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">
                Standard Feedback Templates:
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {REJECTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setRejectionPreset(preset);
                      setRejectionReason(preset);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      rejectionPreset === preset
                        ? "bg-rose-950/40 border-rose-500/50 text-rose-200"
                        : "bg-[#050505] border-[#171717] text-neutral-400 hover:text-neutral-200 hover:border-[#2A2A2A]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-neutral-500 block mb-1">
                Custom Feedback / Additional Instructions:
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectionPreset(null);
                }}
                rows={3}
                placeholder="Specify requirements or changes the organizer must make before re-submitting..."
                className="w-full p-3 rounded-xl bg-[#050505] border border-[#222222] text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500/60"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#171717]">
              <button
                type="button"
                onClick={() => setRejectingTournament(null)}
                className="h-10 px-5 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() && !rejectionPreset}
                className="h-10 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs font-mono uppercase tracking-wider transition-all shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
