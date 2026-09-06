"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import MatchCard from "@/components/tournaments/MatchCard";
import CloseMatchModal from "@/components/tournaments/CloseMatchModal";
import {
  BracketMatch,
  BracketRound,
  TournamentBracketModalProps,
  TournamentDetail,
  ParticipatingTeamDetail
} from "@/types";
import { tournamentsService } from "@/services/tournamentsService";
import {
  SwordsIcon,
  CrownIcon,
  TrophyIcon,
  UsersIcon,
  ShieldIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@/components/ui/Icons";

function BracketColumn({
  round,
  highlight,
  onViewBoxScore,
  canReportResults,
  onReportResult,
}: {
  round: { name: string; matches: BracketMatch[] };
  highlight?: boolean;
  onViewBoxScore: (m: BracketMatch) => void;
  canReportResults?: boolean;
  onReportResult?: (m: BracketMatch) => void;
}) {
  return (
    <div className="w-64 shrink-0 flex flex-col justify-center z-10">
      <div
        className={`text-center font-display text-xs font-black tracking-widest uppercase mb-4 pb-2 border-b ${
          highlight ? "text-primary-brand border-primary-brand/40" : "text-slate-400 border-[#1E293B]"
        }`}
      >
        {round.name}
      </div>
      <div className="flex-1 flex flex-col justify-around gap-2">
        {round.matches.map((m) => (
          <div key={m.id} className="space-y-1">
            <MatchCard match={m} onViewBoxScore={() => onViewBoxScore(m)} />
            {canReportResults && m.status !== "COMPLETED" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReportResult?.(m);
                }}
                className="w-full h-6 text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 border border-amber-500/40 hover:bg-amber-500/10 transition-colors cursor-pointer"
              >
                Report Result
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ponytail: a plain dashed connector instead of the traditional elbowed
// bracket lines — those need per-match-count positioning math to line up
// correctly, which stops working the moment round sizes vary (round robin
// playoffs, double elim). Add real elbow connectors if the visual polish
// matters more than supporting arbitrary bracket shapes.
function BracketConnector() {
  return (
    <div className="w-8 shrink-0 flex items-center justify-center self-stretch pointer-events-none">
      <div className="w-full h-0 border-t-2 border-dashed" style={{ borderColor: "#334155" }} />
    </div>
  );
}

export default function TournamentBracketModal({
  isOpen,
  onClose,
  tournamentId,
  title = "PHILIPPINE COLLEGIATE TOURNAMENT BRACKET",
  subtitle = "SINGLE ELIMINATION CHAMPIONSHIP",
}: TournamentBracketModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"bracket" | "teams" | "overview">("bracket");
  const [activeBoxScore, setActiveBoxScore] = useState<BracketMatch | null>(null);
  const [reportingMatch, setReportingMatch] = useState<BracketMatch | null>(null);
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [tournamentDetail, setTournamentDetail] = useState<TournamentDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const canReportResults = user?.role === "ADMIN" || user?.role === "ORGANIZER";

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    async function loadData() {
      if (!tournamentId) {
        if (isMounted) {
          setRounds([]);
          setTournamentDetail(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const [bracketData, detailData] = await Promise.allSettled([
          tournamentsService.getBracket(tournamentId),
          tournamentsService.getTournamentById(tournamentId),
        ]);

        if (isMounted) {
          if (bracketData.status === "fulfilled") {
            setRounds(bracketData.value || []);
          }
          if (detailData.status === "fulfilled" && detailData.value) {
            setTournamentDetail(detailData.value);
          }
        }
      } catch {
        if (isMounted) {
          setRounds([]);
          setTournamentDetail(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, tournamentId, refreshKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !activeBoxScore) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, activeBoxScore]);

  if (!isOpen) return null;

  const normalizedRounds = rounds.map((round, rIdx) => ({
    name:
      round.name ||
      (rIdx === rounds.length - 1
        ? "GRAND FINALS"
        : rIdx === rounds.length - 2
        ? "SEMIFINALS"
        : `ROUND ${rIdx + 1}`),
    bracketSide: round.bracketSide,
    matches: round.matches.map((m) => ({
      id: m.id,
      team1: {
        name: m.team1.name || "TBD",
        score: m.team1.score ?? 0,
        isWinner: m.team1.isWinner,
        universityId: m.team1.universityId,
      },
      team2: {
        name: m.team2.name || "TBD",
        score: m.team2.score ?? 0,
        isWinner: m.team2.isWinner,
        universityId: m.team2.universityId,
      },
      status: m.status,
      timeLabel: m.timeLabel,
      playerStats: m.playerStats,
    })),
  }));

  const lastMatch = normalizedRounds[normalizedRounds.length - 1]?.matches[0];
  const isFinalsComplete = 
    lastMatch && 
    (lastMatch.team1.isWinner || lastMatch.team2.isWinner) && 
    lastMatch.team1.name !== "TBD" && 
    lastMatch.team1.name !== "Finalist 1" &&
    lastMatch.team2.name !== "TBD" && 
    lastMatch.team2.name !== "Finalist 2";

  const champion = isFinalsComplete
    ? lastMatch.team1.isWinner
      ? lastMatch.team1.name
      : lastMatch.team2.name
    : null;

  // Double Elimination splits into two visible brackets; Single Elimination
  // and Round Robin + Playoffs have everything in "winnersRounds" since their
  // matches carry no bracketSide.
  const winnersRounds = normalizedRounds.filter(
    (r) => r.bracketSide !== "LOSERS" && r.bracketSide !== "GRAND_FINAL",
  );
  const losersRounds = normalizedRounds.filter((r) => r.bracketSide === "LOSERS");
  const grandFinalRound = normalizedRounds.find((r) => r.bracketSide === "GRAND_FINAL") || null;

  // Participating teams list
  const participatingTeams: ParticipatingTeamDetail[] = tournamentDetail?.participatingTeams || [];

  // Prefer the real bracket format/team count once loaded over the static
  // prop default, which otherwise always claims "Single Elimination".
  const displaySubtitle = tournamentDetail
    ? `${(tournamentDetail.bracketFormat || "SINGLE ELIMINATION").toUpperCase()} • ${
        tournamentDetail.teamQuota || participatingTeams.length || "?"
      } TEAMS`
    : subtitle;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/85 backdrop-blur-lg animate-fade-in overflow-y-auto">
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window Container */}
        <div 
          className="relative w-full max-w-7xl max-h-[88vh] flex flex-col bg-[#080B14] border border-[#1E293B] shadow-2xl overflow-hidden z-10 animate-modal-enter my-auto"
          style={{
            clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          }}
        >
          {/* Top Brand Ambient Line (Prominent & High Z-Index) */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-brand via-amber-400 to-primary-brand z-30 shadow-[0_0_15px_rgba(244,63,94,0.8)] pointer-events-none" />

          {/* Modal Header */}
          <div className="relative flex flex-col md:flex-row md:items-center justify-between px-6 sm:px-8 py-5 border-b border-[#182338] bg-[#0A0D18] gap-4 z-20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span 
                  className="text-[9px] font-mono font-bold tracking-widest text-primary-brand uppercase px-2 py-0.5 bg-primary-brand/10 border border-primary-brand/30"
                  style={{
                    clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                  }}
                >
                  {tournamentDetail?.game || "OFFICIAL COLLEGIATE CIRCUIT"}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  {displaySubtitle}
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase drop-shadow-sm">
                {tournamentDetail?.title || title}
              </h2>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              {/* Tab Navigation Controls */}
              <div 
                className="flex items-stretch gap-1 p-1 bg-[#05070E] border border-[#1E293B]"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("bracket")}
                  className={`h-10 px-4 sm:px-5 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                    activeTab === "bracket"
                      ? "game-theme-btn"
                      : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                  }}
                >
                  <SwordsIcon className="w-4 h-4 shrink-0" />
                  <span>Bracket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("teams")}
                  className={`h-10 px-4 sm:px-5 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                    activeTab === "teams"
                      ? "game-theme-btn"
                      : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                  }}
                >
                  <UsersIcon className="w-4 h-4 shrink-0" />
                  <span>Participating Teams</span>
                  {participatingTeams.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      activeTab === "teams" ? "bg-black/30 text-white" : "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                    }`}>
                      {participatingTeams.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`h-10 px-4 sm:px-5 font-mono text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                    activeTab === "overview"
                      ? "game-theme-btn"
                      : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                  }}
                >
                  <ShieldIcon className="w-4 h-4 shrink-0" />
                  <span>Overview & Rules</span>
                </button>
              </div>

              <button
                onClick={onClose}
                aria-label="Close Modal"
                className="flex h-10 w-10 items-center justify-center bg-[#141A29] border border-[#232D44] text-slate-300 hover:text-white hover:bg-[#1E273D] transition-colors cursor-pointer shrink-0"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Content Area */}
          <div className="flex-1 overflow-y-auto min-h-[580px] max-h-[calc(94vh-120px)] bg-gradient-to-b from-[#080B14] via-[#0A0D18] to-[#05070E]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-28 space-y-4">
                <div className="w-10 h-10 border-3 border-primary-brand border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-xs font-bold text-slate-400 tracking-widest uppercase">
                  Loading Tournament Payload & Rosters...
                </p>
              </div>
            ) : activeTab === "teams" ? (
              /* TAB: PARTICIPATING TEAMS & ROSTERS */
              <div className="p-4 sm:p-6 sm:px-8 space-y-5">
                {/* Top Highlight Metric Strip (Matching Bracket & Overview) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    className="p-3.5 bg-[#0A0D18] border border-[#1E293B] flex items-center justify-between relative overflow-hidden"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary-brand via-amber-400 to-transparent" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                        Registered Competitors
                      </span>
                      <span className="font-display text-base font-black text-white uppercase mt-0.5 block">
                        {participatingTeams.length} Varsity Squads
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-primary-brand/10 border border-primary-brand/30 flex items-center justify-center text-primary-brand">
                      <UsersIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <div 
                    className="p-3.5 bg-[#0A0D18] border border-[#1E293B] flex items-center justify-between relative overflow-hidden"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                        Esports Circuit
                      </span>
                      <span className="font-display text-base font-black text-amber-400 uppercase mt-0.5 block truncate max-w-[160px]">
                        {tournamentDetail?.game || "Collegiate Arena"}
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <TrophyIcon className="w-4 h-4" />
                    </div>
                  </div>

                  <div 
                    className="p-3.5 bg-[#0A0D18] border border-[#1E293B] flex items-center justify-between relative overflow-hidden"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                        Roster Verification
                      </span>
                      <span className="font-display text-base font-black text-emerald-400 uppercase mt-0.5 block">
                        Active & Sanctioned
                      </span>
                    </div>
                    <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldIcon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Section Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182338]">
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-primary-brand" />
                      <span>CONFIRMED COLLEGIATE SQUADS</span>
                    </h3>
                    <p className="font-sans text-[11px] text-slate-400 mt-0.5">
                      Official verified varsity rosters and active starting lineups for this tournament circuit.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 self-start">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    <span>{participatingTeams.length} Active Competitors</span>
                  </div>
                </div>

                {participatingTeams.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-[#0A0D18] border border-[#1E293B] p-6">
                    <UsersIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <h4 className="font-display text-sm font-black text-white uppercase">
                      No Registered Squads Yet
                    </h4>
                    <p className="font-sans text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Registration is currently open for university varsity teams. Squads will appear here upon submission and confirmation.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                    {participatingTeams.map((team, idx) => (
                      <div
                        key={team.id || idx}
                        className="bg-[#0A0D18] border border-[#1E293B] hover:border-primary-brand/50 transition-all p-3.5 shadow-lg flex flex-col justify-between group relative overflow-hidden"
                        style={{
                          clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                        }}
                      >
                        {/* Top Accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-primary-brand/60 via-amber-500/40 to-transparent" />

                        {/* Team Header */}
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="w-8 h-8 bg-[#121726] border border-[#232D44] flex items-center justify-center font-display font-black text-white text-xs shrink-0 group-hover:border-primary-brand transition-colors"
                                style={{
                                  clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                                }}
                              >
                                {team.universityName.slice(0, 3).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-display text-xs font-black text-white uppercase tracking-tight group-hover:text-primary-brand transition-colors truncate">
                                  {team.name}
                                </h4>
                                <span className="font-mono text-[10px] text-slate-400 block truncate">
                                  {team.universityName}
                                </span>
                              </div>
                            </div>

                            <span 
                              className="font-mono text-[8px] font-black uppercase px-1.5 py-0.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0"
                              style={{
                                clipPath: "polygon(2px 0, 100% 0, calc(100% - 2px) 100%, 0 100%)",
                              }}
                            >
                              SEED #{team.seed || idx + 1}
                            </span>
                          </div>

                          {/* Captain & Status Bar */}
                          <div className="flex items-center justify-between text-[10px] font-mono py-1 px-2 bg-[#060812] border border-[#141A29] mb-2.5">
                            <span className="flex items-center gap-1 text-amber-300 truncate max-w-[150px]">
                              <CrownIcon className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="font-bold">Cap:</span>
                              <span className="text-white truncate">{team.captainName || "Team Captain"}</span>
                            </span>
                            <span className="text-slate-400 font-bold uppercase text-[9px] shrink-0">
                              ● {team.status}
                            </span>
                          </div>

                          {/* Roster Athletes */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                              Active Roster ({team.members.length})
                            </span>
                            <div className="space-y-0.5">
                              {team.members.map((member, mIdx) => (
                                <div
                                  key={member.id || mIdx}
                                  className="flex items-center justify-between py-0.5 px-1.5 bg-[#0E1322] border border-[#182338]/60 text-[10px] font-mono"
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-slate-500 text-[9px]">{mIdx + 1}</span>
                                    <span className="text-slate-200 truncate font-medium">
                                      {member.displayName}
                                    </span>
                                    {member.isCaptain && (
                                      <CrownIcon className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                    )}
                                  </div>
                                  <span className="text-[8px] px-1 py-0.2 bg-[#161D30] text-primary-brand font-bold uppercase shrink-0">
                                    {member.preferredRole || (mIdx === 0 ? "Duelist" : mIdx === 1 ? "Initiator" : mIdx === 2 ? "Controller" : mIdx === 3 ? "Sentinel" : "Flex")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === "overview" ? (
              /* TAB: OVERVIEW & RULES */
              <div className="p-6 sm:p-10 space-y-8 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tournamentDetail?.startDate ? (
                    <div className="p-5 bg-[#0A0D18] border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.08)]">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-cyan-400" />
                        <span>Scheduled Kickoff</span>
                      </span>
                      <span className="font-display text-base font-black text-white uppercase block">
                        {new Date(tournamentDetail.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                      <p className="font-sans text-xs text-slate-400 mt-1">
                        Official tournament broadcast & match lobby start time.
                      </p>
                    </div>
                  ) : (
                    <div className="p-5 bg-[#0A0D18] border border-[#1E293B]">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3 text-slate-400" />
                        <span>Scheduled Kickoff</span>
                      </span>
                      <span className="font-display text-base font-black text-slate-300 uppercase block">
                        TBA
                      </span>
                      <p className="font-sans text-xs text-slate-400 mt-1">
                        Lobby schedule announced upon bracket lock.
                      </p>
                    </div>
                  )}

                  <div className="p-5 bg-[#0A0D18] border border-[#1E293B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                      Bracket Structure
                    </span>
                    <span className="font-display text-base font-black text-white uppercase block">
                      {tournamentDetail?.bracketFormat || "Single Elimination"}
                    </span>
                    <p className="font-sans text-xs text-slate-400 mt-1">
                      Knockout playoff series with seeded varsity placements.
                    </p>
                  </div>

                  <div className="p-5 bg-[#0A0D18] border border-[#1E293B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                      Participating Squads
                    </span>
                    <span className="font-display text-base font-black text-amber-400 uppercase block">
                      {participatingTeams.length} / {tournamentDetail?.teamQuota || 8} SQUADS
                    </span>
                    <p className="font-sans text-xs text-slate-400 mt-1">
                      Verified collegiate varsity organizations only.
                    </p>
                  </div>

                  <div className="p-5 bg-[#0A0D18] border border-[#1E293B]">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                      Tournament Director
                    </span>
                    <span className="font-display text-base font-black text-emerald-400 uppercase truncate block">
                      {tournamentDetail?.organizer?.displayName || "Philippine Collegiate League"}
                    </span>
                    <p className="font-sans text-xs text-slate-400 mt-1">
                      Sanctioned by official collegiate esports directorate.
                    </p>
                  </div>
                </div>

                {/* Tournament Regulations */}
                <div className="p-6 bg-[#0A0D18] border border-[#1E293B] space-y-4">
                  <h4 className="font-display text-base font-black uppercase text-white tracking-wide flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4 text-primary-brand" />
                    <span>TOURNAMENT RULES & MATCH PROTOCOLS</span>
                  </h4>
                  
                  <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
                    {tournamentDetail?.rules ? (
                      <p className="whitespace-pre-line">{tournamentDetail.rules}</p>
                    ) : (
                      <>
                        <div className="p-3 bg-[#060812] border border-[#182338] space-y-1">
                          <strong className="text-white font-mono block">1. Player Eligibility & Verification</strong>
                          <p className="text-slate-400">All participating student-athletes must maintain active varsity status with a verified institutional (.edu.ph) account. Ringers and unauthorized substitutes are strictly prohibited.</p>
                        </div>
                        <div className="p-3 bg-[#060812] border border-[#182338] space-y-1">
                          <strong className="text-white font-mono block">2. Match Verification & Riot Data Sync</strong>
                          <p className="text-slate-400">Match outcomes are validated through the official Riot Match API telemetry and verified by tournament officials via the Collegium War Room.</p>
                        </div>
                        <div className="p-3 bg-[#060812] border border-[#182338] space-y-1">
                          <strong className="text-white font-mono block">3. Fair Play & Competitive Integrity</strong>
                          <p className="text-slate-400">Vanguard anti-cheat integrity checks are enforced. Any unsportsmanlike conduct or third-party exploits result in immediate forfeiture and collegiate sanctioning.</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* TAB: BRACKET CANVAS */
              <div className="overflow-x-auto p-6 sm:p-10 flex flex-col gap-10 min-h-[580px]">
                {normalizedRounds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <p className="font-sans text-xs font-bold text-slate-400 tracking-widest uppercase">
                      Bracket not yet generated for this tournament.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-stretch min-w-max mx-auto gap-6 select-none py-6">
                      {winnersRounds.map((round, idx) => (
                        <div key={`w-${idx}`} className="flex items-stretch gap-6">
                          <BracketColumn
                            round={round}
                            highlight={!grandFinalRound && idx === winnersRounds.length - 1}
                            onViewBoxScore={setActiveBoxScore}
                            canReportResults={canReportResults}
                            onReportResult={setReportingMatch}
                          />
                          <BracketConnector />
                        </div>
                      ))}

                      {grandFinalRound && (
                        <div className="flex items-stretch gap-6">
                          <BracketColumn
                            round={grandFinalRound}
                            highlight
                            onViewBoxScore={setActiveBoxScore}
                            canReportResults={canReportResults}
                            onReportResult={setReportingMatch}
                          />
                          <BracketConnector />
                        </div>
                      )}

                      {/* CHAMPIONSHIP PODIUM */}
                      <div className="w-64 shrink-0 flex flex-col justify-between z-10">
                        <div className="text-center font-display text-xs font-black tracking-widest text-amber-400 uppercase mb-4 pb-2 border-b border-amber-500/40">
                          CHAMPIONSHIP PODIUM
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center relative group py-4">
                          <div className="relative mb-6">
                            <div
                              className="w-28 h-28 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-[2.5px] shadow-2xl flex items-center justify-center relative transition-transform duration-300 group-hover:scale-105"
                              style={{
                                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                              }}
                            >
                              <div
                                className="w-full h-full bg-[#0D0F18] flex flex-col items-center justify-center p-3 text-center space-y-1"
                                style={{
                                  clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                                }}
                              >
                                <TrophyIcon className="w-10 h-10 text-amber-400 drop-shadow-md animate-pulse" />
                                <span className="font-mono text-[8px] font-bold text-amber-300 uppercase tracking-widest block">
                                  SEASON 1
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Champion Winner Card */}
                          <div
                            className={`w-56 border-2 p-4 shadow-2xl text-center space-y-2 ${
                              champion
                                ? "bg-gradient-to-b from-[#1C1708] via-[#0E101B] to-[#070912] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                : "bg-[#090C16] border-[#22304A]"
                            }`}
                            style={{
                              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
                            }}
                          >
                            <div className={`flex items-center justify-center gap-1.5 font-display text-[10px] font-black uppercase tracking-widest ${
                              champion ? "text-amber-400" : "text-emerald-400"
                            }`}>
                              <CrownIcon className="w-3.5 h-3.5" />
                              <span>{champion ? "TOURNAMENT CHAMPION" : "CHAMPIONSHIP TROPHY"}</span>
                            </div>

                            <h3 className="font-display text-base font-black uppercase text-white tracking-wide">
                              {champion || "Awaiting Finalists"}
                            </h3>

                            <div className="pt-2 border-t border-white/10">
                              <span
                                className={`px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-wider inline-block ${
                                  champion ? "bg-amber-500 text-black" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                }`}
                                style={{
                                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                                }}
                              >
                                {champion ? "GOLD MEDALIST" : "MATCHES IN PROGRESS"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LOSERS BRACKET — Double Elimination only */}
                    {losersRounds.length > 0 && (
                      <div className="pt-8 border-t border-[#1E293B]">
                        <div className="text-center font-mono text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6">
                          Losers Bracket
                        </div>
                        <div className="flex items-stretch min-w-max mx-auto gap-6 select-none">
                          {losersRounds.map((round, idx) => (
                            <div key={`l-${idx}`} className="flex items-stretch gap-6">
                              <BracketColumn
                                round={round}
                                onViewBoxScore={setActiveBoxScore}
                                canReportResults={canReportResults}
                                onReportResult={setReportingMatch}
                              />
                              {idx < losersRounds.length - 1 && <BracketConnector />}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {(() => {
        if (!activeBoxScore) return null;

        const getTeamRoster = (universityId?: string) =>
          participatingTeams.find((pt) => pt.universityId === universityId)?.members || [];

        return (
          <MatchBoxScoreModal
            isOpen={!!activeBoxScore}
            onClose={() => setActiveBoxScore(null)}
            title="MATCH BOX SCORE"
            subtitle={`${activeBoxScore.team1.name} vs ${activeBoxScore.team2.name} • TOURNAMENT MATCH`}
            matchInfo={{
              team1Name: activeBoxScore.team1.name,
              team2Name: activeBoxScore.team2.name,
              team1UniversityId: activeBoxScore.team1.universityId,
              team2UniversityId: activeBoxScore.team2.universityId,
              team1Score: activeBoxScore.team1.score,
              team2Score: activeBoxScore.team2.score,
              status: activeBoxScore.status,
              isTeam1Winner: Boolean(activeBoxScore.team1.isWinner),
              isTeam2Winner: Boolean(activeBoxScore.team2.isWinner),
              playerStats: activeBoxScore.playerStats,
              team1Roster: getTeamRoster(activeBoxScore.team1.universityId),
              team2Roster: getTeamRoster(activeBoxScore.team2.universityId),
            }}
          />
        );
      })()}

      {reportingMatch && (() => {
        const team1Roster = participatingTeams.find((t) => t.universityId === reportingMatch.team1.universityId);
        const team2Roster = participatingTeams.find((t) => t.universityId === reportingMatch.team2.universityId);
        const key = `${reportingMatch.id}-${team1Roster?.members?.length ?? 0}-${team2Roster?.members?.length ?? 0}`;
        return (
          <CloseMatchModal
            key={key}
            isOpen={!!reportingMatch}
            onClose={() => setReportingMatch(null)}
            tournamentId={tournamentId || ""}
            match={reportingMatch}
            team1Roster={team1Roster}
            team2Roster={team2Roster}
            onReported={() => setRefreshKey((k) => k + 1)}
          />
        );
      })()}
    </>
  );
}
