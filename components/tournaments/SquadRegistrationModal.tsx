"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Tournament } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { GAMES, GameId } from "@/lib/games";
import { 
  TrophyIcon, 
  ShieldIcon, 
  CheckCircleIcon, 
  CrownIcon, 
  AlertTriangleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  PlusIcon,
  ZapIcon
} from "@/components/ui/Icons";

const normalizeGame = (g?: string | null): GameId => {
  if (!g) return "valo";
  const lower = g.toLowerCase().trim();
  if (lower.includes("valo")) return "valo";
  if (lower.includes("lol") || lower.includes("league") || lower.includes("rift")) return "lol";
  if (lower.includes("ml") || lower.includes("mobile") || lower.includes("bang bang")) return "ml";
  if (lower.includes("cod") || lower.includes("duty") || lower.includes("warfare")) return "codm";
  return "valo";
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

  const gameKey = normalizeGame(tournament.gameTitle || tournament.game);
  const gameInfo = GAMES[gameKey] || GAMES.valo;
  const cardImage = tournament.image || gameInfo.image;
  const isLive = tournament.status === "LIVE";

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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-fade-in overflow-hidden">
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-2xl bg-[#090C16] border border-[#1E293B] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-modal-enter flex flex-col max-h-[94vh]"
        style={{
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
        }}
      >
        {/* Top Accent Brand Line */}
        <div 
          className="absolute top-0 left-0 right-0 h-[2px] z-30"
          style={{
            background: "linear-gradient(90deg, transparent 0%, var(--primary-brand) 30%, var(--primary-brand) 70%, transparent 100%)",
            boxShadow: "0 0 12px var(--primary-brand)",
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#182338] bg-[#070A12] relative z-20">
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 bg-primary-brand/10 border border-primary-brand/30 flex items-center justify-center text-primary-brand shadow-sm"
              style={{
                clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
              }}
            >
              <TrophyIcon className="w-4.5 h-4.5 text-primary-brand" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-primary-brand uppercase">
                  VARSITY TOURNAMENT REGISTRATION
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                  {gameInfo.name}
                </span>
              </div>
              <h2 className="font-display text-lg sm:text-xl font-black text-white uppercase tracking-wide line-clamp-1 mt-0.5">
                {tournament.title}
              </h2>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-[#101626] border border-[#202C45] hover:border-slate-400 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shadow-md"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {isSubmitted ? (
            /* Success State */
            <div className="text-center py-6 sm:py-8 space-y-5 animate-fade-in">
              <div 
                className="w-18 h-18 bg-emerald-950/60 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
                style={{
                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              >
                <CheckCircleIcon className="w-9 h-9 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/50 px-3 py-0.5 border border-emerald-500/30 inline-block">
                  REGISTRATION CONFIRMED
                </span>
                <h3 className="font-display text-2xl font-black text-white uppercase tracking-wider">
                  APPLICATION SUBMITTED!
                </h3>
                <p className="font-sans text-xs text-slate-300 max-w-md mx-auto leading-relaxed mt-1">
                  Your university squad has successfully applied for <strong className="text-white">{tournament.title}</strong>. Your roster entry is awaiting review by tournament administrators.
                </p>
              </div>

              <div 
                className="p-4 bg-[#070A14] border border-[#182338] text-left text-xs font-mono space-y-2 max-w-md mx-auto shadow-inner"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <div className="flex justify-between items-center pb-2 border-b border-[#141C2E]">
                  <span className="text-slate-400">Application Status:</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    PENDING APPROVAL
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Enlisted Squad:</span>
                  <span className="text-white font-bold">{activeTeam?.name || "Varsity Roster"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Institution:</span>
                  <span className="text-primary-brand font-bold">{activeTeam?.universityName || user?.university?.name || "University"}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                {onViewBracket && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      onViewBracket();
                    }}
                    className="h-10 px-6 game-theme-btn font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    <TrophyIcon className="w-4 h-4 text-white" />
                    <span>View Live Bracket</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="h-10 px-6 bg-[#121828] hover:bg-[#1A233A] border border-[#202C48] text-slate-200 hover:text-white font-display text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
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
                <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs font-sans rounded flex items-center gap-2.5">
                  <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Tournament Telemetry Briefing HUD Card */}
              <div 
                className="relative overflow-hidden bg-[#060812] border border-[#1A253C] p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4 sm:gap-5"
                style={{
                  clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                }}
              >
                {/* Background Specular Ambient Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-brand/10 via-transparent to-transparent pointer-events-none" />

                {/* Left: Game Artwork Thumbnail */}
                <div className="w-full sm:w-28 h-20 sm:h-20 shrink-0 relative overflow-hidden rounded-lg border border-[#1E293B] bg-[#0A0D18] shadow-md">
                  <Image
                    src={cardImage}
                    alt={gameInfo.name}
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-1 left-1.5 text-[9px] font-mono font-bold text-white uppercase px-1.5 py-0.2 bg-black/60 border border-white/20 rounded">
                    {gameInfo.shortName}
                  </span>
                </div>

                {/* Right: Telemetry Details */}
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0A0E1A] p-2.5 border border-[#162034] rounded">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                      DISCIPLINE
                    </span>
                    <span className="font-display text-xs font-black text-white uppercase block mt-0.5">
                      {gameInfo.name}
                    </span>
                    <span className="text-[9px] font-mono text-primary-brand block mt-0.5">
                      {gameInfo.genre}
                    </span>
                  </div>

                  <div className="bg-[#0A0E1A] p-2.5 border border-[#162034] rounded">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                      BRACKET FORMAT
                    </span>
                    <span className="font-display text-xs font-black text-white uppercase block mt-0.5">
                      {tournament.bracketFormat || "Single Elimination"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      {tournament.teamQuota ? `Max ${tournament.teamQuota} Squads` : "Open Varsity"}
                    </span>
                  </div>

                  <div className="bg-[#0A0E1A] p-2.5 border border-[#162034] rounded">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 block">
                      CIRCUIT STATUS
                    </span>
                    <span className={`font-display text-xs font-black uppercase flex items-center gap-1.5 mt-0.5 ${
                      isLive ? "text-emerald-400" : "text-cyan-300"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isLive ? "bg-emerald-400 animate-pulse" : "bg-cyan-400"
                      }`} />
                      {isLive ? "LIVE CIRCUIT" : tournament.status || "UPCOMING"}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                      Official Sanctioned
                    </span>
                  </div>
                </div>
              </div>

              {/* Squad Selection Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <ShieldIcon className="w-4 h-4 text-primary-brand" />
                    <span>Enlisted University Squad</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase bg-[#0C101E] px-2 py-0.5 border border-[#1A253C] rounded">
                    {teams.length} Squad{teams.length === 1 ? "" : "s"} Eligible
                  </span>
                </div>

                {isLoadingTeams ? (
                  <div className="p-6 text-center text-xs font-mono text-slate-400 bg-[#060812] border border-[#182338] animate-pulse">
                    Verifying university varsity rosters...
                  </div>
                ) : teams.length === 0 ? (
                  /* Empty State — Tactile & High Contrast */
                  <div 
                    className="p-6 sm:p-7 bg-[#070A14] border border-[#1A253C] text-center space-y-4 shadow-xl relative overflow-hidden"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    <div className="w-12 h-12 bg-primary-brand/10 border border-primary-brand/30 flex items-center justify-center text-primary-brand mx-auto shadow-inner">
                      <UsersIcon className="w-6 h-6 text-primary-brand" />
                    </div>

                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h4 className="font-display text-sm sm:text-base font-black uppercase tracking-wide text-white">
                        No Active {gameInfo.name} Squad Found
                      </h4>
                      <p className="text-xs font-sans text-slate-300 leading-relaxed">
                        To compete in sanctioned brackets, you must belong to an official varsity roster representing <strong className="text-primary-brand">{user?.university?.name || "your institution"}</strong>.
                      </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        href="/team/create"
                        onClick={onClose}
                        className="w-full sm:w-auto h-10 px-5 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                        style={{
                          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                        }}
                      >
                        <PlusIcon className="w-3.5 h-3.5 text-white" />
                        <span>Establish {gameInfo.shortName} Squad</span>
                      </Link>

                      <Link
                        href="/team/join"
                        onClick={onClose}
                        className="w-full sm:w-auto h-10 px-5 bg-[#121828] hover:bg-[#1A233A] text-slate-200 hover:text-white border border-[#202C48] font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        style={{
                          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                        }}
                      >
                        <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Join Existing Squad</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Squad List */
                  <div className="space-y-2.5">
                    {teams.map((t) => {
                      const isSelected = t.id === (selectedTeamId || teams[0]?.id);
                      const isCaptainOfThisTeam = Boolean(user?.id && t.captainId === user.id);
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTeamId(t.id)}
                          className={`p-4 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-gradient-to-r from-emerald-950/40 via-[#0A1320] to-[#080C16] border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                              : "bg-[#070A14] border-[#182338] hover:border-slate-500 hover:bg-[#0B101E]"
                          }`}
                          style={{
                            clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                          }}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                              isSelected ? "border-emerald-400 bg-emerald-500/20" : "border-slate-600 bg-[#080B14]"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-display text-sm font-black text-white uppercase tracking-wide truncate">
                                  {t.name}
                                </h4>
                                {isCaptainOfThisTeam ? (
                                  <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 uppercase rounded">
                                    CAPTAIN
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 uppercase rounded">
                                    ACTIVE ATHLETE
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-primary-brand font-bold">{t.universityName}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-300">
                                  <CrownIcon className="w-3 h-3 text-amber-400" />
                                  <span>Captain: {t.captainName}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-[#141C2E] pt-2 sm:pt-0 shrink-0">
                            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
                              ROSTER STATUS
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                              <CheckCircleIcon className="w-3 h-3 text-emerald-400" />
                              <span>{t.members?.length || 5} Athletes Verified</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Collegiate Protocol Verification Note */}
              <div className="p-3 bg-[#060812] border border-[#162034] rounded flex items-start gap-2.5">
                <ShieldIcon className="w-4 h-4 text-primary-brand shrink-0 mt-0.5" />
                <span className="text-[11px] font-mono text-slate-400 leading-relaxed">
                  By submitting registration, you verify all rostered athletes adhere to collegiate standing rules and circuit eligibility requirements.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!isSubmitted && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#182338] bg-[#070A12] relative z-20">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="h-10 px-5 bg-[#121828] hover:bg-[#1A233A] border border-[#202C48] text-slate-300 hover:text-white font-display text-xs font-bold uppercase tracking-wider transition-colors rounded cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting || teams.length === 0}
              onClick={handleSubmit}
              className="h-10 px-6 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              {isSubmitting ? (
                <>
                  <ClockIcon className="w-4 h-4 animate-spin text-white" />
                  <span>Enlisting Squad...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                  <span>Confirm & Enlist Squad</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

