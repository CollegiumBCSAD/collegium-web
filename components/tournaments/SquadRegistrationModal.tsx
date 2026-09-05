"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Tournament } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { 
  TrophyIcon, 
  ShieldIcon, 
  CheckCircleIcon, 
  CrownIcon, 
  AlertTriangleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon
} from "@/components/ui/Icons";

const normalizeGame = (g?: string | null): string => {
  if (!g) return "";
  const lower = g.toLowerCase().trim();
  if (lower.includes("valo")) return "valo";
  if (lower.includes("lol") || lower.includes("league") || lower.includes("rift")) return "lol";
  if (lower.includes("ml") || lower.includes("mobile") || lower.includes("bang bang")) return "ml";
  if (lower.includes("cod") || lower.includes("duty") || lower.includes("warfare")) return "codm";
  return lower;
};

interface SquadRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  onSuccess?: (teamId?: string) => Promise<void> | void;
  onViewBracket?: () => void;
}

export default function SquadRegistrationModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
  onViewBracket,
}: SquadRegistrationModalProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setIsSubmitted(false);
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    fetchTeamsApi()
      .then((allTeams) => {
        if (!isMounted) return;
        const myId = user?.id;
        const tourneyGame = normalizeGame(tournament?.gameTitle || tournament?.game);

        // Filter teams matching the game where the user is captain or an active roster member
        const matching = allTeams.filter((t) => {
          const teamGame = normalizeGame(t.gameTitle);
          const matchesGame = !tourneyGame || !teamGame || teamGame === tourneyGame;
          
          const isCaptain = Boolean(myId && t.captainId === myId);
          const isMember = Boolean(
            myId &&
            t.members?.some(
              (m) =>
                (m.userId === myId ||
                  (typeof m === "object" && m !== null && "user" in m && (m as { user?: { id?: string } }).user?.id === myId)) &&
                m.status !== "DECLINED"
            )
          );

          const isMyTeam = isCaptain || isMember;
          return matchesGame && isMyTeam;
        });

        setTeams(matching);
        if (matching.length > 0) {
          setSelectedTeamId(matching[0].id);
        }
      })
      .catch(() => {
        if (isMounted) setTeams([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingTeams(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user, tournament]);

  if (!isOpen || !tournament) return null;

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (onSuccess) {
        await onSuccess(selectedTeamId || activeTeam?.id);
      }
      setIsSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit tournament application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="absolute inset-0" onClick={handleClose} />

      <div 
        className="relative w-full max-w-xl bg-[#0A0D18] border border-[#1E293B] shadow-2xl overflow-hidden z-10 animate-modal-enter"
        style={{
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
        }}
      >
        {/* Accent highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#182338] bg-[#070A12]">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400"
              style={{
                clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
              }}
            >
              <TrophyIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
                VARSITY TOURNAMENT REGISTRATION
              </span>
              <h3 className="font-display text-base font-black text-white uppercase tracking-tight line-clamp-1">
                {tournament.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white bg-[#141A29] border border-[#232D44] hover:border-slate-500 transition-colors cursor-pointer"
            style={{
              clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)",
            }}
          >
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div 
                className="w-16 h-16 bg-emerald-950/60 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-display text-xl font-black text-white uppercase tracking-wider">
                  APPLICATION SUBMITTED!
                </h4>
                <p className="font-sans text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Your university squad has successfully applied for <strong className="text-emerald-300">{tournament.title}</strong>. Your registration is now pending review by tournament directors.
                </p>
              </div>

              <div className="p-3 bg-[#101626] border border-[#1E293B] text-left text-xs font-mono space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-amber-400 font-bold">● PENDING ORGANIZER APPROVAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">University Squad:</span>
                  <span className="text-white font-bold">{activeTeam?.name || "Varsity Roster"}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                {onViewBracket && (
                  <button
                    onClick={() => {
                      handleClose();
                      onViewBracket();
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    View Live Bracket
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 bg-[#141A29] hover:bg-[#1E273D] border border-[#232D44] text-slate-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs font-mono flex items-center gap-2">
                  <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tournament Summary Card */}
              <div className="p-4 bg-[#0E1322] border border-[#182338] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Esports Discipline:</span>
                  <span className="text-primary-brand font-bold uppercase">{tournament.game}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Bracket Format:</span>
                  <span className="text-white font-bold">{tournament.bracketFormat || "Single Elimination (8 Universities)"}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Circuit Status:</span>
                  <span className="text-emerald-400 font-bold uppercase">{tournament.status}</span>
                </div>
              </div>

              {/* Registered Squad Verification */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                    <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
                    <span>Select Your Squad</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {teams.length} Squad{teams.length === 1 ? "" : "s"} Available
                  </span>
                </div>

                {isLoadingTeams ? (
                  <div className="p-4 text-center text-xs font-mono text-slate-500 bg-[#060812] border border-[#141A29]">
                    Loading squad rosters...
                  </div>
                ) : teams.length === 0 ? (
                  <div className="p-5 text-center bg-[#0E1322] border border-[#1E293B] space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                      <UsersIcon className="w-5 h-5 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-slate-300">
                        No registered varsity squad found for <strong className="text-primary-brand">{tournament.game}</strong>.
                      </p>
                      <p className="text-[11px] font-sans text-slate-400 max-w-sm mx-auto">
                        Tournaments require an official varsity squad matching this discipline. Create or join your university roster to compete.
                      </p>
                    </div>
                    <div className="pt-1 flex items-center justify-center gap-2">
                      <Link
                        href="/team/create"
                        onClick={onClose}
                        className="px-3.5 py-1.5 bg-primary-brand hover:brightness-110 text-black font-display text-[11px] font-black uppercase tracking-wider transition-all"
                        style={{
                          clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                        }}
                      >
                        + Create Squad
                      </Link>
                      <Link
                        href="/team/join"
                        onClick={onClose}
                        className="px-3.5 py-1.5 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#232D44] font-display text-[11px] font-bold uppercase transition-all"
                        style={{
                          clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                        }}
                      >
                        Join Squad
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teams.map((t) => {
                      const isSelected = t.id === (selectedTeamId || teams[0]?.id);
                      const isCaptainOfThisTeam = Boolean(user?.id && t.captainId === user.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTeamId(t.id)}
                          className={`p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                              : "bg-[#0A0E1A] border-[#182338] hover:border-slate-600"
                          }`}
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center shrink-0">
                              {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display text-sm font-black text-white uppercase">
                                  {t.name}
                                </span>
                                {isCaptainOfThisTeam ? (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 uppercase">
                                    Captain
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 uppercase">
                                    Roster Athlete
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="text-primary-brand">{t.universityName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-300">
                                  <CrownIcon className="w-3 h-3 text-amber-400" />
                                  <span>Captain: {t.captainName}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-slate-400 uppercase block">
                              Roster Size
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              {t.members?.length || 5} Athletes
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Varsity Eligibility Agreement */}
              <div className="p-3 bg-[#060812] border border-[#141A29] text-[11px] font-mono text-slate-400 flex items-start gap-2.5">
                <CheckCircleIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  By submitting, you confirm that all rostered student-athletes meet collegiate eligibility requirements and agree to the tournament regulations.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#182338]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#141A29] hover:bg-[#1E293B] text-slate-300 hover:text-white border border-[#232D44] font-display text-xs font-bold uppercase transition-colors cursor-pointer"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || teams.length === 0}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-display text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <ClockIcon className="w-4 h-4 animate-spin text-black" />
                      <span>Registering Squad...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 text-black" />
                      <span>Confirm & Submit Squad</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
