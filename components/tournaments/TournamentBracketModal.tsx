"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import BracketTree from "@/components/tournaments/BracketTree";
import CloseMatchModal from "@/components/tournaments/CloseMatchModal";
import TournamentGlobalChannel from "@/components/tournaments/TournamentGlobalChannel";
import RetroactiveStatsEditModal from "@/components/tournaments/RetroactiveStatsEditModal";
import TournamentStreamPanel from "@/components/tournaments/TournamentStreamPanel";
import TournamentStreamPlayer from "@/components/tournaments/TournamentStreamPlayer";
import TournamentMatchHistory from "@/components/tournaments/TournamentMatchHistory";
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
  XCircleIcon,
  FlameIcon
} from "@/components/ui/Icons";

export default function TournamentBracketModal({
  isOpen,
  onClose,
  tournamentId,
  title = "PHILIPPINE COLLEGIATE TOURNAMENT BRACKET",
  subtitle = "SINGLE ELIMINATION CHAMPIONSHIP",
  initialTab = "bracket",
}: TournamentBracketModalProps) {
  const { user } = useAuth();
  const [selectedTab, setActiveTab] = useState<"bracket" | "teams" | "channel" | "overview" | "watch">(initialTab);
  const [activeBoxScore, setActiveBoxScore] = useState<BracketMatch | null>(null);
  const [editingStatsMatch, setEditingStatsMatch] = useState<BracketMatch | null>(null);
  const [reportingMatch, setReportingMatch] = useState<BracketMatch | null>(null);
  const [rounds, setRounds] = useState<BracketRound[]>([]);
  const [tournamentDetail, setTournamentDetail] = useState<TournamentDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const canReportResults = user?.role === "ADMIN" || user?.role === "ORGANIZER";
  const canEditStream =
    user?.role === "ADMIN" ||
    (user?.role === "ORGANIZER" &&
      Boolean(
        user?.id &&
          (tournamentDetail?.organizerId === user.id ||
            tournamentDetail?.organizer?.id === user.id)
      ));
  const showWatchLive = Boolean(
    tournamentDetail?.streamUrl && tournamentDetail?.streamIsLive
  );

  // Check if current user is the tournament organizer or an administrator
  const isOrganizer = Boolean(
    user?.role === "ADMIN" ||
    (user?.role === "ORGANIZER" &&
      (!tournamentDetail?.organizerId ||
        tournamentDetail?.organizerId === user?.id ||
        tournamentDetail?.organizer?.id === user?.id)) ||
    (user?.id &&
      (tournamentDetail?.organizerId === user.id ||
        tournamentDetail?.organizer?.id === user.id))
  );

  // Check if current user is a roster athlete/captain on a participating team in this tournament
  const participatingTeams: ParticipatingTeamDetail[] = tournamentDetail?.participatingTeams || [];
  const isUserInParticipatingTeam = Boolean(
    user?.id &&
    participatingTeams.some((team) => {
      const isCaptain = team.captainId === user.id;
      const isMember = team.members?.some((m) => m.userId === user.id);
      return isCaptain || isMember;
    })
  );
  const hasApprovedApplication = Boolean(
    user?.id &&
    (tournamentDetail?.applications as Array<{ userId?: string; status?: string }> | undefined)?.some(
      (app) => app.status === "APPROVED" && app.userId === user.id
    )
  );
  const isParticipant = isUserInParticipatingTeam || hasApprovedApplication;
  const canViewChannel = isOrganizer || isParticipant;

  const [prevTabKey, setPrevTabKey] = useState<string | null>(null);
  const currentTabKey = isOpen && initialTab ? `${tournamentId}-${initialTab}` : null;
  if (prevTabKey !== currentTabKey) {
    setPrevTabKey(currentTabKey);
    if (isOpen && initialTab) {
      if (initialTab === "channel" && !canViewChannel && !isLoading) {
        setActiveTab("bracket");
      } else {
        setActiveTab(initialTab);
      }
    }
  }

  // Non-participants can't see the channel: once access is known, show the
  // bracket instead. Derived at render time rather than corrected in an effect.
  const activeTab = !isLoading && !canViewChannel && selectedTab === "channel" ? "bracket" : selectedTab;

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
  const mainRounds = grandFinalRound ? [...winnersRounds, grandFinalRound] : winnersRounds;
  const treeHandlers = {
    onViewBoxScore: setActiveBoxScore,
    canReportResults,
    onReportResult: setReportingMatch,
    featuredMatchId: tournamentDetail?.featuredMatchId,
  };

  let featuredOnStream: {
    roundName: string;
    match: (typeof normalizedRounds)[0]["matches"][0];
  } | null = null;
  const featuredId = tournamentDetail?.featuredMatchId;
  if (featuredId) {
    for (const round of normalizedRounds) {
      const match = round.matches.find((m) => m.id === featuredId);
      if (match) {
        featuredOnStream = { roundName: round.name, match };
        break;
      }
    }
  }

  // Prefer the real bracket format/team count once loaded over the static
  // prop default, which otherwise always claims "Single Elimination".
  const displaySubtitle = tournamentDetail
    ? `${(tournamentDetail.bracketFormat || "SINGLE ELIMINATION").toUpperCase()} • ${
        tournamentDetail.teamQuota || participatingTeams.length || "?"
      } TEAMS`
    : subtitle;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Backdrop is a sibling — backdrop-blur on a parent of the iframe makes the embed look soft. */}
        <div
          className="absolute inset-0 bg-black/85 backdrop-blur-lg animate-fade-in"
          onClick={onClose}
        />

        {/* Modal Window Container — spacious esports command center */}
        <div 
          className="relative w-full max-w-[1720px] h-[92vh] max-h-[96vh] flex flex-col bg-[#080B14] border border-[#1E293B] shadow-2xl overflow-hidden z-10 animate-fade-in"
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
              {tournamentDetail?.streamUrl && (
                <button
                  type="button"
                  onClick={() => setActiveTab("watch")}
                  className={`h-10 sm:h-11 px-4 sm:px-5 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider flex items-center gap-2 whitespace-nowrap cursor-pointer transition-all ${
                    showWatchLive
                      ? "text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30"
                      : "text-slate-300 bg-[#141A29] border border-[#232D44] hover:text-white hover:bg-[#1E293B]"
                  }`}
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {showWatchLive && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                  {showWatchLive ? "Watch Live" : "Stream"}
                </button>
              )}

              {/* Tab Navigation Controls — Matching Tactical Segmented Shape */}
              <div 
                className="flex items-center gap-1.5 p-1.5 bg-[#0A0D18] border border-[#1E293B] shadow-xl"
                style={{
                  clipPath: "polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)",
                }}
              >
                {tournamentDetail?.streamUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("watch")}
                    className={`h-10 sm:h-11 px-4 sm:px-5 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "watch"
                        ? "game-theme-btn"
                        : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                    }`}
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    {showWatchLive && (
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                    )}
                    <span>Watch</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("bracket")}
                  className={`h-10 sm:h-11 px-4 sm:px-6 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "bracket"
                      ? "game-theme-btn"
                      : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <SwordsIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  <span>Bracket</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("teams")}
                  className={`h-10 sm:h-11 px-4 sm:px-6 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "teams"
                      ? "game-theme-btn"
                      : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <UsersIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  <span>Participating Teams</span>
                  {participatingTeams.length > 0 && (
                    <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded font-black ${
                      activeTab === "teams" ? "bg-black/30 text-white" : "bg-[#141A29] text-slate-400"
                    }`}>
                      {participatingTeams.length}
                    </span>
                  )}
                </button>

                {canViewChannel && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("channel")}
                    className={`h-10 sm:h-11 px-4 sm:px-6 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                      activeTab === "channel"
                        ? "game-theme-btn"
                        : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                    }`}
                    style={{
                      clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                    }}
                  >
                    <FlameIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                    <span>Channel</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`h-10 sm:h-11 px-4 sm:px-6 font-mono text-xs sm:text-[13px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    activeTab === "overview"
                      ? "game-theme-btn"
                      : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                  }`}
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <ShieldIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                  <span>Overview & Rules</span>
                </button>
              </div>

              <button
                onClick={onClose}
                aria-label="Close Modal"
                className="flex h-10 sm:h-11 w-10 sm:w-11 items-center justify-center bg-[#141A29] hover:bg-[#1E273D] border border-[#232D44] hover:border-slate-500 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* NOW ON STREAM — sticky callout when organizer features a match */}
          {featuredOnStream && tournamentDetail?.streamUrl && (
            <div className="shrink-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-6 py-2.5 bg-rose-950/80 border-b border-rose-500/40">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-300 shrink-0">
                  Now on stream
                </span>
                <span className="text-slate-600 hidden sm:inline">·</span>
                <span className="text-[10px] font-mono text-rose-200/80 uppercase tracking-wider shrink-0 hidden sm:inline">
                  {featuredOnStream.roundName}
                </span>
                <span className="text-slate-600">·</span>
                <span className="font-display text-sm font-black text-white uppercase truncate">
                  {featuredOnStream.match.team1.name}
                  <span className="text-rose-400 font-normal mx-1.5">vs</span>
                  {featuredOnStream.match.team2.name}
                </span>
              </div>
              {activeTab !== "watch" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("watch")}
                  className="h-8 px-3 font-mono text-[10px] font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  {showWatchLive ? "Watch desk" : "Open watch"}
                </button>
              )}
            </div>
          )}

          {/* Modal Content Area */}
          <div
            className={`flex-1 min-h-0 bg-gradient-to-b from-[#080B14] via-[#0A0D18] to-[#05070E] ${
              activeTab === "watch" ? "overflow-hidden flex flex-col" : "overflow-y-auto"
            }`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-28 space-y-4">
                <div className="w-10 h-10 border-3 border-primary-brand border-t-transparent rounded-full animate-spin" />
                <p className="font-sans text-xs font-bold text-slate-400 tracking-widest uppercase">
                  Loading Tournament Payload & Rosters...
                </p>
              </div>
            ) : activeTab === "watch" && tournamentDetail?.streamUrl ? (
              /* WATCH DESK — stream + live bracket side by side */
              <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-0">
                <div className="lg:w-[58%] xl:w-[62%] shrink-0 p-3 sm:p-4 flex flex-col min-h-[220px] lg:min-h-0 lg:h-full border-b lg:border-b-0 lg:border-r border-[#1E293B]">
                  <TournamentStreamPlayer
                    streamUrl={tournamentDetail.streamUrl}
                    streamIsLive={Boolean(tournamentDetail.streamIsLive)}
                    className="flex-1 min-h-[200px] lg:min-h-0"
                  />
                </div>
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div className="shrink-0 px-4 py-2.5 border-b border-[#1E293B] bg-[#0A0D18] flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-300 block">
                        Live bracket
                      </span>
                      <span className="text-[10px] font-sans text-slate-500">
                        Same broadcast · follow the series here
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("bracket")}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-300 uppercase tracking-wider cursor-pointer"
                    >
                      Full bracket →
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
                    {normalizedRounds.length === 0 ? (
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest text-center py-10">
                        Bracket not generated yet
                      </p>
                    ) : (
                      <BracketTree
                        rounds={mainRounds}
                        projectToFinal={losersRounds.length === 0}
                        compact
                        {...treeHandlers}
                      />
                    )}
                    {losersRounds.length > 0 && (
                      <div className="pt-6 mt-4 border-t border-[#1E293B]">
                        <div className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest mb-3">
                          Losers bracket
                        </div>
                        <BracketTree rounds={losersRounds} compact {...treeHandlers} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : activeTab === "teams" ? (
              /* TAB: PARTICIPATING TEAMS & ROSTERS */
              <div className="p-5 sm:p-8 sm:px-10 space-y-8">
                {/* Top Highlight Metric Strip (Matching Bracket & Overview) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                  <div 
                    className="p-5 sm:p-6 bg-[#0A0D18] border border-[#1E293B] flex items-center justify-between relative overflow-hidden shadow-xl"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary-brand via-amber-400 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                    <div>
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Registered Competitors
                      </span>
                      <span className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-white uppercase mt-1 block">
                        {participatingTeams.length} Varsity Squads
                      </span>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary-brand/10 border border-primary-brand/30 flex items-center justify-center text-primary-brand shrink-0 shadow-sm">
                      <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  </div>

                  <div 
                    className="p-5 sm:p-6 bg-[#0A0D18] border border-[#1E293B] flex items-center justify-between relative overflow-hidden shadow-xl"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-amber-400 to-transparent shadow-[0_0_10px_rgba(245,158,11,0.6)]" />
                    <div>
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Esports Circuit
                      </span>
                      <span className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-amber-400 uppercase mt-1 block truncate max-w-[200px] sm:max-w-none">
                        {tournamentDetail?.game || "Collegiate Arena"}
                      </span>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
                      <TrophyIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  </div>

                  <div 
                    className="p-5 sm:p-6 bg-[#0A0D18] border border-[#1E293B] flex items-center justify-between relative overflow-hidden shadow-xl"
                    style={{
                      clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                    <div>
                      <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">
                        Roster Verification
                      </span>
                      <span className="font-display text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 uppercase mt-1 block">
                        Active & Sanctioned
                      </span>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
                      <ShieldIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  </div>
                </div>

                {/* Section Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#182338]">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-wider flex items-center gap-2.5">
                      <UsersIcon className="w-5 h-5 text-primary-brand" />
                      <span>CONFIRMED COLLEGIATE SQUADS</span>
                    </h3>
                    <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1">
                      Official verified varsity rosters and active starting lineups for this tournament circuit.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-display font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 self-start shadow-sm">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span>{participatingTeams.length} Active Competitors</span>
                  </div>
                </div>

                {participatingTeams.length === 0 ? (
                  <div className="text-center py-20 px-4 bg-[#0A0D18] border border-[#1E293B] p-8">
                    <UsersIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h4 className="font-display text-base sm:text-lg font-black text-white uppercase">
                      No Registered Squads Yet
                    </h4>
                    <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1.5 max-w-md mx-auto">
                      Registration is currently open for university varsity teams. Squads will appear here upon submission and confirmation.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                    {participatingTeams.map((team, idx) => {
                      const seedNum = Number(team.seed) || idx + 1;

                      return (
                        <div
                          key={team.id || idx}
                          className="bg-[#090C16] border border-[#1E293B] hover:border-primary-brand/70 transition-all duration-200 p-5 sm:p-6 shadow-xl flex flex-col justify-between group relative overflow-hidden"
                          style={{
                            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
                          }}
                        >
                          {/* Top Brand Accent Line */}
                          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary-brand via-amber-400 to-transparent group-hover:h-[3px] transition-all" />

                          <div>
                            {/* Team Identity Header */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {/* University Acronym Badge */}
                                <div
                                  className="w-12 h-12 flex items-center justify-center font-display font-black text-white text-base shrink-0 bg-[#121828] border-2 border-[#243350] group-hover:border-primary-brand shadow-sm transition-colors"
                                  style={{
                                    clipPath: "polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)",
                                  }}
                                >
                                  {team.universityName.slice(0, 3).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="font-display text-lg sm:text-xl font-black text-white uppercase tracking-wide group-hover:text-primary-brand transition-colors truncate">
                                    {team.name}
                                  </h4>
                                  <span className="font-sans text-xs sm:text-sm text-slate-400 block truncate font-medium mt-0.5">
                                    {team.universityName}
                                  </span>
                                </div>
                              </div>

                              {/* Seed Badge */}
                              <span
                                className="font-display text-xs font-black uppercase px-3 py-1 bg-[#121828] text-slate-200 border border-[#26354E] shrink-0 flex items-center gap-1 shadow-sm"
                                style={{
                                  clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                                }}
                              >
                                SEED #{seedNum}
                              </span>
                            </div>

                            {/* Captain & Status Bar */}
                            <div className="flex items-center justify-between py-2.5 px-3.5 bg-[#0C111F] border border-[#182338] mb-4">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <CrownIcon className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="font-display text-xs font-black uppercase tracking-wider text-amber-400 shrink-0">
                                  CAP:
                                </span>
                                <span className="font-sans text-sm font-bold text-white truncate">
                                  {team.captainName || "Team Captain"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-xs font-display font-bold text-emerald-400 uppercase tracking-wider shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{team.status}</span>
                              </div>
                            </div>

                            {/* Active Roster List */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-2 border-b border-[#182338]">
                                <span className="text-xs font-display font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                  <span>Active Roster</span>
                                  <span className="px-2 py-0.5 bg-[#141C2E] text-slate-300 text-xs font-display font-bold">
                                    {team.members.length}
                                  </span>
                                </span>
                                <span className="text-xs font-display font-bold uppercase tracking-wider text-slate-500">
                                  Starting Lineup
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {team.members.map((member, mIdx) => {
                                  const roleName = member.preferredRole || (mIdx === 0 ? "Duelist" : mIdx === 1 ? "Initiator" : mIdx === 2 ? "Controller" : mIdx === 3 ? "Sentinel" : "Flex");

                                  return (
                                    <div
                                      key={member.id || mIdx}
                                      className="group/row flex items-center justify-between py-2.5 px-3.5 bg-[#0C111F] hover:bg-[#131A2D] border border-[#162035] hover:border-[#2A3B5A] transition-all"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 pr-2">
                                        <span className="text-slate-500 font-display font-bold text-sm w-4 text-center shrink-0">
                                          {mIdx + 1}
                                        </span>
                                        <span className="text-white group-hover/row:text-primary-brand truncate font-sans font-bold text-sm">
                                          {member.displayName}
                                        </span>
                                        {member.isCaptain && (
                                          <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        )}
                                      </div>
                                      <span
                                        className="text-xs font-display font-bold uppercase tracking-wider px-3 py-1 bg-[#141C2E] text-slate-300 border border-[#23314A] shrink-0"
                                        style={{
                                          clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                                        }}
                                      >
                                        {roleName}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="mt-4 pt-3 border-t border-[#141C2E] flex items-center justify-between text-xs font-sans text-slate-500">
                            <span>VARSITY SQUAD</span>
                            <span className="text-primary-brand font-display font-bold tracking-wider uppercase">COLLEGIUM VERIFIED</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : activeTab === "channel" && canViewChannel ? (
              /* TAB: GLOBAL TOURNAMENT CHANNEL */
              <div className="p-4 sm:p-6 sm:px-8 h-[calc(88vh-140px)] min-h-[500px]">
                <TournamentGlobalChannel
                  tournamentId={tournamentId || ""}
                  tournamentTitle={tournamentDetail?.title || title}
                  isOrganizerOrAdmin={isOrganizer}
                />
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

                {canEditStream && tournamentId && (
                  <TournamentStreamPanel
                    key={`stream-${refreshKey}-${tournamentDetail?.streamUrl ?? ""}-${tournamentDetail?.streamIsLive}-${tournamentDetail?.featuredMatchId ?? ""}`}
                    tournamentId={tournamentId}
                    streamUrl={tournamentDetail?.streamUrl}
                    streamIsLive={tournamentDetail?.streamIsLive}
                    featuredMatchId={tournamentDetail?.featuredMatchId}
                    rounds={rounds}
                    onSaved={() => setRefreshKey((k) => k + 1)}
                  />
                )}

                {!canEditStream && tournamentDetail?.streamUrl && (
                  <div className="p-5 bg-[#0A0D18] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                        Official Broadcast
                      </span>
                      <p className="font-sans text-xs text-slate-300 truncate max-w-xl">
                        {tournamentDetail.streamUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("watch")}
                      className="h-10 px-4 font-mono text-xs font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {showWatchLive && (
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      )}
                      {showWatchLive ? "Watch Live" : "Open Stream Tab"}
                    </button>
                  </div>
                )}

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
              <>
              <div className="overflow-auto p-6 sm:p-10 flex flex-col gap-10 min-h-[580px] bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]">
                {normalizedRounds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <p className="font-sans text-xs font-bold text-slate-400 tracking-widest uppercase">
                      Bracket not yet generated for this tournament.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mx-auto">
                      <BracketTree
                        rounds={mainRounds}
                        projectToFinal={losersRounds.length === 0}
                        champion={champion ?? null}
                        {...treeHandlers}
                      />
                    </div>

                    {/* LOSERS BRACKET — Double Elimination only */}
                    {losersRounds.length > 0 && (
                      <div className="pt-8 border-t border-[#1E293B]">
                        <div className="mb-4 font-display text-sm font-black uppercase tracking-[0.2em] text-slate-300">
                          Losers Bracket
                        </div>
                        <BracketTree rounds={losersRounds} {...treeHandlers} />
                      </div>
                    )}
                  </>
                )}
              </div>
              <TournamentMatchHistory rounds={rounds} />
              </>
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
              status: activeBoxScore.status,
              isTeam1Winner: Boolean(activeBoxScore.team1.isWinner),
              isTeam2Winner: Boolean(activeBoxScore.team2.isWinner),
              playerStats: activeBoxScore.playerStats,
              team1Roster: getTeamRoster(activeBoxScore.team1.universityId),
              team2Roster: getTeamRoster(activeBoxScore.team2.universityId),
            }}
            canEditStats={canReportResults}
            onEditStats={() => {
              setEditingStatsMatch(activeBoxScore);
              setActiveBoxScore(null);
            }}
          />
        );
      })()}

      {editingStatsMatch && (
        <RetroactiveStatsEditModal
          key={editingStatsMatch.id}
          isOpen={!!editingStatsMatch}
          onClose={() => setEditingStatsMatch(null)}
          tournamentId={tournamentId || ""}
          match={editingStatsMatch}
          onStatsUpdated={() => setRefreshKey((k) => k + 1)}
        />
      )}

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
    </>,
    document.body
  );
}
