"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserProfile, Tournament } from "@/types";
import { useGame } from "@/context/GameContext";
import { tournamentsService } from "@/services/tournamentsService";
import { TrophyIcon, ShieldIcon, CheckCircleIcon, PlusIcon, AlertTriangleIcon, CalendarIcon, ClockIcon, TrashIcon, ZapIcon, UsersIcon } from "@/components/ui/Icons";
import PostTournamentModal from "./PostTournamentModal";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import TournamentApplicationsModal from "./TournamentApplicationsModal";

interface OrganizerDashboardViewProps {
  user: UserProfile;
}

function formatStartDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function getTournamentImage(t: Tournament): string {
  if (t.image) return t.image;
  const g = (t.gameTitle || t.game || "").toUpperCase();
  if (g.includes("LOL") || g.includes("LEAGUE")) return "/lol-art-1.png";
  if (g.includes("MLBB") || g.includes("MOBILE LEGENDS") || g.includes("ML")) return "/ml-art-1.jpg";
  if (g.includes("CODM") || g.includes("CALL OF DUTY")) return "/codm-art-1.png";
  return "/valorant-art-1.png";
}

export default function OrganizerDashboardView({ user }: OrganizerDashboardViewProps) {
  const { selectedGame, selectedGameInfo } = useGame();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Start Tournament State
  const [startingTourneyId, setStartingTourneyId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // In-page modal states so user stays on dashboard
  const [activeBracketTourney, setActiveBracketTourney] = useState<Tournament | null>(null);
  const [activeBoxScoreTourney, setActiveBoxScoreTourney] = useState<Tournament | null>(null);
  const [activeApplicationsTourney, setActiveApplicationsTourney] = useState<Tournament | null>(null);

  const fetchTourneys = async () => {
    try {
      const data = await tournamentsService.getMyTournaments();
      setTournaments(data);
    } catch {
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTournament = async (id: string) => {
    setIsStarting(true);
    setActionError(null);
    try {
      await tournamentsService.startTournament(id);
      setStartingTourneyId(null);
      await fetchTourneys();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start tournament. Please try again.";
      setActionError(errorMsg);
    } finally {
      setIsStarting(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    tournamentsService
      .getMyTournaments()
      .then((data) => {
        if (isMounted) {
          setTournaments(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTournaments([]);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const gameTournaments = useMemo(() => {
    const gameIdToEnum: Record<string, string> = {
      valo: "VALORANT",
      lol: "LOL",
      ml: "MLBB",
      codm: "CODM",
    };
    return tournaments.filter((t) => {
      // 1. Filter by Game
      let matchGame = true;
      if (t.gameTitle) {
        matchGame = !selectedGame || t.gameTitle === gameIdToEnum[selectedGame];
      } else {
        const g = (t.game || "").toLowerCase();
        if (selectedGame === "valo") matchGame = g.includes("val");
        else if (selectedGame === "lol") matchGame = g.includes("league") || g.includes("lol");
        else if (selectedGame === "ml") matchGame = g.includes("mobile") || g.includes("ml");
        else if (selectedGame === "codm") matchGame = g.includes("call") || g.includes("cod");
      }
      if (!matchGame) return false;

      // 2. Filter by Status
      if (statusFilter !== "ALL") {
        if (t.status !== statusFilter) return false;
      }

      // 3. Filter by Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (t.title || "").toLowerCase().includes(q);
        const formatMatch = (t.bracketFormat || "").toLowerCase().includes(q);
        if (!titleMatch && !formatMatch) return false;
      }

      return true;
    });
  }, [tournaments, selectedGame, statusFilter, searchQuery]);

  // Metric stats
  const stats = useMemo(() => {
    const total = tournaments.length;
    const live = tournaments.filter((t) => t.status === "LIVE").length;
    const pending = tournaments.filter((t) => t.status === "PENDING_APPROVAL").length;
    const totalTeams = tournaments.reduce((acc, t) => acc + (t.universities?.length || 0), 0);
    return { total, live, pending, totalTeams };
  }, [tournaments]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTournament = async (id: string) => {
    setIsDeleting(true);
    try {
      await tournamentsService.deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } catch {
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Organizer Quick Actions Bar */}
      <div className="p-5 sm:p-7 bg-[#0A0D18] border border-[#1E293B] shadow-2xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                {"// TOURNAMENT DIRECTOR COMMAND CENTER"}
              </span>
              <span className="text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ORGANIZER VERIFIED
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              {user.displayName ? `${user.displayName}'s Tournament Command Center` : "Collegiate Tournaments Hub"}
            </h2>
            <p className="text-xs sm:text-sm font-sans text-slate-400 leading-relaxed">
              Design, sanction, and administer official university esports brackets for {user.university?.name || "your institution"}. Manage squad rosters, review participant applications, and broadcast verified match logs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-12 px-7 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-black font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-black" />
            <span>Host Collegiate Tournament</span>
          </button>
        </div>

        {/* Organizer KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#182238]">
          <div className="p-3.5 bg-[#060812] border border-[#1C2538] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Total Hosted
              </span>
              <span className="font-display text-2xl font-black text-white">
                {stats.total}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TrophyIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 bg-[#060812] border border-[#1C2538] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Live Circuits
              </span>
              <span className="font-display text-2xl font-black text-emerald-400">
                {stats.live}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="p-3.5 bg-[#060812] border border-[#1C2538] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Pending Approval
              </span>
              <span className="font-display text-2xl font-black text-amber-300">
                {stats.pending}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <span className="text-xs font-mono font-bold">⚡</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#060812] border border-[#1C2538] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Registered Teams
              </span>
              <span className="font-display text-2xl font-black text-cyan-300">
                {stats.totalTeams}
              </span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <ShieldIcon className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Organizer Workflow Stepper */}
      <div className="p-5 bg-[#080B14] border border-[#162034] rounded-2xl space-y-3 shadow-inner">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
          Collegiate Tournament Lifecycle
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-[#0D1220] border border-amber-500/30 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-amber-400 font-mono font-bold text-[10px]">
              <span>STEP 01</span>
              <CheckCircleIcon className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="font-display font-bold text-white block uppercase">Post Details</span>
            <span className="text-[11px] text-slate-400 font-sans block">Submit format & esports title</span>
          </div>

          <div className="p-3 bg-[#0D1220] border border-emerald-500/30 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-mono font-bold text-[10px]">
              <span>STEP 02</span>
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-white block uppercase">Admin Sanction</span>
            <span className="text-[11px] text-slate-400 font-sans block">Official verification & live queue</span>
          </div>

          <div className="p-3 bg-[#0A0E1A] border border-[#1C2844] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono font-bold text-[10px]">
              <span>STEP 03</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <span className="font-display font-bold text-white block uppercase">Roster Signups</span>
            <span className="text-[11px] text-slate-400 font-sans block">Universities join & verify rosters</span>
          </div>

          <div className="p-3 bg-[#0A0E1A] border border-[#1C2844] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono font-bold text-[10px]">
              <span>STEP 04</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <span className="font-display font-bold text-white block uppercase">Live Bracketing</span>
            <span className="text-[11px] text-slate-400 font-sans block">Seeds generated & War Rooms opened</span>
          </div>

          <div className="p-3 bg-[#0A0E1A] border border-[#1C2844] rounded-xl space-y-1">
            <div className="flex items-center justify-between text-slate-400 font-mono font-bold text-[10px]">
              <span>STEP 05</span>
              <span className="w-2 h-2 rounded-full bg-slate-600" />
            </div>
            <span className="font-display font-bold text-white block uppercase">Results & Box Score</span>
            <span className="text-[11px] text-slate-400 font-sans block">Verified match scores & ratings</span>
          </div>
        </div>
      </div>

      {/* Tournaments Grid Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A253C] pb-3">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-amber-400" />
            <h3 className="font-display text-base font-black text-white uppercase tracking-wider">
              {selectedGameInfo?.name || "COLLEGIATE"} Hosted Tournaments ({gameTournaments.length})
            </h3>
          </div>
          <Link
            href="/tournaments"
            className="text-xs font-mono text-amber-400 hover:underline font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore Public Circuit</span>
            <span>→</span>
          </Link>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "ALL", label: "ALL" },
              { id: "LIVE", label: "LIVE" },
              { id: "UPCOMING", label: "UPCOMING" },
              { id: "PENDING_APPROVAL", label: "PENDING APPROVAL" },
              { id: "COMPLETED", label: "COMPLETED" },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                      : "bg-[#0A0D18] border border-[#1E293B] text-slate-400 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="w-full sm:w-60">
            <input
              type="text"
              placeholder="Search hosted tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 px-3 rounded-lg bg-[#0A0D18] border border-[#1E293B] text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs font-mono text-slate-500 animate-pulse bg-[#0A0D18] border border-[#1E293B] rounded-2xl">
            Loading Tournament Rosters...
          </div>
        ) : gameTournaments.length === 0 ? (
          <div className="p-10 bg-[#0A0D18] border border-[#1E293B] rounded-2xl text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold uppercase text-white">
                No Tournaments Found
              </h4>
              <p className="text-xs font-sans text-slate-400 max-w-md mx-auto mt-1">
                {statusFilter !== "ALL"
                  ? `No ${statusFilter.replace("_", " ")} tournaments match your criteria.`
                  : `Establish an official collegiate circuit tournament. University varsity squads will be able to register and compete.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="h-10 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer inline-flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4 text-black" />
              <span>Host First Tournament</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {gameTournaments.map((t) => {
              const coverImg = getTournamentImage(t);
              const isPending = t.status === "PENDING_APPROVAL";
              const isRejected = t.status === "REJECTED";
              const isLive = t.status === "LIVE";
              const isCompleted = t.status === "COMPLETED";
              const isUpcoming = t.status === "UPCOMING";

              return (
                <div
                  key={t.id}
                  className={`bg-[#0A0D18] border shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden group relative ${
                    isRejected
                      ? "border-rose-500/40 hover:border-rose-500/80 shadow-rose-950/20"
                      : isLive
                      ? "border-emerald-500/50 hover:border-emerald-400 shadow-emerald-950/20"
                      : isPending
                      ? "border-amber-500/50 hover:border-amber-400 shadow-amber-950/20"
                      : "border-[#1E293B] hover:border-amber-500/60 shadow-black/60"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
                  }}
                >
                  {/* Top Tactical Status Highlight Line */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-[2px] z-20 ${
                      isRejected
                        ? "bg-gradient-to-r from-rose-500 via-rose-400 to-transparent"
                        : isLive
                        ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent"
                        : isPending
                        ? "bg-gradient-to-r from-amber-500 via-amber-400 to-transparent"
                        : isUpcoming
                        ? "bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent"
                        : "bg-gradient-to-r from-slate-500 via-slate-400 to-transparent"
                    }`}
                  />

                  {/* Top Cover Image Banner */}
                  <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-[#060812] shrink-0 border-b border-[#182338]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImg}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-75 group-hover:opacity-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-[#0A0D18]/40 to-transparent pointer-events-none" />

                    {/* Top Pill Overlay */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-10">
                      <span
                        className="font-mono text-[10px] font-bold text-white uppercase px-2.5 py-1 bg-[#0A0D18]/90 border border-white/20 shadow-md backdrop-blur-md"
                        style={{
                          clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                        }}
                      >
                        {t.game}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[9px] font-black uppercase px-2.5 py-1 border backdrop-blur-md shadow-md flex items-center gap-1.5 ${
                            isCompleted
                              ? "bg-[#141A29]/90 text-slate-300 border-[#232D44]"
                              : isLive
                              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                              : isPending
                              ? "bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                              : isRejected
                              ? "bg-rose-950/90 text-rose-300 border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.25)]"
                              : "bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                          }`}
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLive
                                ? "bg-emerald-400 animate-ping"
                                : isPending
                                ? "bg-amber-400 animate-pulse"
                                : isRejected
                                ? "bg-rose-400"
                                : "bg-cyan-400"
                            }`}
                          />
                          <span>{isPending ? "PENDING APPROVAL" : isLive ? "LIVE CIRCUIT" : t.status}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(confirmDeleteId === t.id ? null : t.id)}
                          className="w-7 h-7 bg-[#0A0D18]/90 hover:bg-rose-950/90 text-slate-400 hover:text-rose-300 border border-white/20 hover:border-rose-500/50 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-md backdrop-blur-md active:scale-95"
                          style={{
                            clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                          }}
                          title="Remove Tournament"
                          aria-label="Remove Tournament"
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtle Game Watermark at Bottom Left of Banner */}
                    <div className="absolute bottom-2 left-4 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                      <span className="font-display text-3xl font-black uppercase text-white tracking-tighter">
                        {t.game}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between bg-[#0A0D18]/95">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[10px] font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
                          <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>HOSTED CIRCUIT</span>
                        </span>
                        {t.startDate && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-950/40 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                            style={{
                              clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                            }}
                          >
                            <CalendarIcon className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>Starts: {formatStartDate(t.startDate)}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-display text-lg sm:text-xl font-black uppercase text-white tracking-tight line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {t.title}
                      </h4>

                      <p
                        className={`text-xs font-sans line-clamp-2 ${
                          isRejected ? "text-rose-300 font-medium" : "text-slate-400"
                        }`}
                      >
                        {t.statusText || "Official Collegiate Tournament bracket and match proceedings."}
                      </p>

                      {/* Format and Quota Chips */}
                      <div className="pt-1 flex items-center gap-2 text-xs font-mono text-slate-300 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121828] border border-[#222E48] text-[11px] font-mono font-medium text-slate-300"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{t.bracketFormat || "Single Elimination"}</span>
                        </span>

                        {t.teamQuota && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#121828] border border-[#222E48] text-[11px] font-mono font-medium text-slate-300"
                            style={{
                              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>Quota: {t.teamQuota} Universities</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Section: Status-Specific Interactive Panels */}
                    <div className="space-y-3 pt-2">
                      {/* Rejected Notice & Re-Apply Action */}
                      {isRejected && (
                        <div
                          className="p-4 bg-gradient-to-b from-rose-950/60 to-[#0F0812] border border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)] space-y-3 relative overflow-hidden"
                          style={{
                            clipPath:
                              "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))",
                          }}
                        >
                          <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500" />
                          <div className="flex items-start gap-2.5 pl-1.5">
                            <div className="w-7 h-7 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400 mt-0.5">
                              <AlertTriangleIcon className="w-4 h-4" />
                            </div>
                            <div className="space-y-1 flex-1">
                              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-rose-400 block">
                                {"// SANCTIONING REJECTED BY ADMIN"}
                              </span>
                              <p className="text-xs font-sans text-rose-100/90 leading-relaxed">
                                {t.rejectionReason ||
                                  "Administrator requested revisions before sanctioning this tournament."}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingTournament(t)}
                            className="w-full h-10 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-black font-display text-xs font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 active:scale-98"
                            style={{
                              clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                            }}
                          >
                            <span>✏️</span>
                            <span>Edit & Re-Apply for Approval</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}

                      {/* Pending Approval Notice */}
                      {isPending && (
                        <div
                          className="p-3.5 bg-gradient-to-r from-amber-950/30 via-amber-900/20 to-[#0A0D18] border border-amber-500/30 flex items-center gap-3"
                          style={{
                            clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                          }}
                        >
                          <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                            <ClockIcon className="w-3.5 h-3.5 animate-spin" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                              Sanctioning Review in Progress
                            </span>
                            <p className="text-xs font-sans text-slate-400">
                              Awaiting administrator verification before circuit opens.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Organizer Applications Review Panel — only for approved tournaments */}
                      {!isCompleted && !isPending && !isRejected && (
                        <div
                          className="p-3.5 bg-[#070A14] border border-[#162034] rounded-xl space-y-2.5"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <UsersIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span>Varsity Applications</span>
                            </span>
                            <span
                              className="px-2.5 py-0.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-[10px] flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                              style={{
                                clipPath: "polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%)",
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{t.universities?.length || 0} Verified Teams</span>
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveApplicationsTourney(t)}
                            className="w-full h-9 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-600/20 hover:from-amber-500/25 hover:to-amber-600/35 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
                          >
                            <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
                            <span>Review Squad Applications</span>
                          </button>
                        </div>
                      )}

                      {/* Start Tournament Action for UPCOMING tournaments */}
                      {isUpcoming && (
                        <div>
                          {startingTourneyId === t.id ? (
                            <div
                              className="p-3.5 bg-gradient-to-b from-emerald-950/70 to-[#071410] border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)] space-y-2.5 animate-fade-in"
                              style={{
                                clipPath:
                                  "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <span className="text-emerald-400 font-mono font-bold text-xs mt-0.5">⚡</span>
                                <p className="text-xs font-sans text-emerald-100 leading-relaxed">
                                  Ready to broadcast live? This seeds the official bracket and switches status to{" "}
                                  <strong className="text-emerald-400 font-mono font-bold">LIVE CIRCUIT</strong>.
                                </p>
                              </div>
                              {actionError && (
                                <p className="text-[11px] font-mono text-rose-400 bg-rose-950/60 p-2 rounded border border-rose-500/30">
                                  {actionError}
                                </p>
                              )}
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  disabled={isStarting}
                                  onClick={() => handleStartTournament(t.id)}
                                  className="flex-1 h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-display text-xs font-black uppercase tracking-wider rounded-lg cursor-pointer disabled:opacity-50 transition-all shadow-md active:scale-95"
                                >
                                  {isStarting ? "Starting..." : "Confirm & Go Live"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isStarting}
                                  onClick={() => {
                                    setStartingTourneyId(null);
                                    setActionError(null);
                                  }}
                                  className="px-4 h-9 bg-[#121828] text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-colors border border-[#222E48]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setStartingTourneyId(t.id);
                                setActionError(null);
                              }}
                              className="w-full h-11 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-300 text-black font-display text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-xl shadow-emerald-500/25 active:scale-98 group/start"
                              style={{
                                clipPath: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)",
                              }}
                            >
                              <span className="w-2 h-2 rounded-full bg-black animate-ping" />
                              <span>▶ Start Tournament (Go Live)</span>
                              <span className="group-hover/start:translate-x-0.5 transition-transform">→</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Delete Confirmation or Card Footer Navigation */}
                    {confirmDeleteId === t.id ? (
                      <div
                        className="p-3.5 bg-rose-950/50 border border-rose-500/40 rounded-xl space-y-2 animate-fade-in"
                      >
                        <p className="text-xs font-sans text-rose-200">
                          Are you sure you want to remove this tournament?
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteTournament(t.id)}
                            className="flex-1 h-8 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            {isDeleting ? "Deleting..." : "Yes, Remove"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 h-8 bg-[#121828] text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold uppercase cursor-pointer transition-colors border border-[#222E48]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isPending || isRejected ? null : (
                      <div className="pt-3 border-t border-[#182338] flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveBracketTourney(t)}
                          className="flex-1 h-9 bg-[#0E1424] hover:bg-[#162038] text-slate-300 hover:text-white border border-[#1E2C48] hover:border-amber-500/50 rounded-lg text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                        >
                          <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
                          <span>Bracket</span>
                        </button>
                        {(isLive || isCompleted) && (
                          <button
                            type="button"
                            onClick={() => setActiveBoxScoreTourney(t)}
                            className="flex-1 h-9 bg-[#0E1424] hover:bg-[#162038] text-slate-300 hover:text-white border border-[#1E2C48] hover:border-cyan-500/50 rounded-lg text-xs font-mono font-bold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                          >
                            <ShieldIcon className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Box Scores</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PostTournamentModal
        isOpen={isModalOpen || !!editingTournament}
        initialTournament={editingTournament}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTournament(null);
        }}
        onTournamentCreated={fetchTourneys}
      />

      {/* In-Page Applications Review Modal */}
      {activeApplicationsTourney && (
        <TournamentApplicationsModal
          isOpen={true}
          onClose={() => setActiveApplicationsTourney(null)}
          tournamentId={activeApplicationsTourney.id}
          tournamentTitle={activeApplicationsTourney.title}
          gameTitle={activeApplicationsTourney.game}
          onApplicationUpdated={fetchTourneys}
        />
      )}

      {/* In-Page Bracket Modal */}
      {activeBracketTourney && (
        <TournamentBracketModal
          isOpen={true}
          onClose={() => setActiveBracketTourney(null)}
          tournamentId={activeBracketTourney.id}
          title={activeBracketTourney.title}
          subtitle={`${activeBracketTourney.game} • OFFICIAL BRACKET`}
        />
      )}

      {/* In-Page Box Score Modal */}
      {activeBoxScoreTourney && (
        <MatchBoxScoreModal
          isOpen={true}
          onClose={() => setActiveBoxScoreTourney(null)}
          title={`BOX SCORE • ${activeBoxScoreTourney.title}`}
          subtitle={`${activeBoxScoreTourney.game} • VERIFIED MATCH SUMMARY`}
        />
      )}
    </div>
  );
}
