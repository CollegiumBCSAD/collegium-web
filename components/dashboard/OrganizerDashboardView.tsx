"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserProfile, Tournament } from "@/types";
import { useGame } from "@/context/GameContext";
import { tournamentsService } from "@/services/tournamentsService";
import { TrophyIcon, ShieldIcon, CheckCircleIcon, PlusIcon } from "@/components/ui/Icons";
import PostTournamentModal from "./PostTournamentModal";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import TournamentApplicationsModal from "./TournamentApplicationsModal";

interface OrganizerDashboardViewProps {
  user: UserProfile;
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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {gameTournaments.map((t) => {
              const coverImg = getTournamentImage(t);
              const isPending = t.status === "PENDING_APPROVAL";
              const isRejected = t.status === "REJECTED";
              const isLive = t.status === "LIVE";
              const isCompleted = t.status === "COMPLETED";

              return (
                <div
                  key={t.id}
                  className="bg-[#0A0D18] border border-[#1E293B] rounded-2xl shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
                >
                  {/* Top Cover Image Banner */}
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#060812] shrink-0 border-b border-[#182338]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImg}
                      alt={t.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D18] via-[#0A0D18]/50 to-transparent pointer-events-none" />

                    {/* Top Pill Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/40 shadow-md">
                        {t.game}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2.5 py-1 rounded-md backdrop-blur-md shadow-md ${
                            isCompleted
                              ? "bg-slate-900/90 text-slate-300 border border-slate-700"
                              : isLive
                              ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 animate-pulse"
                              : isPending
                              ? "bg-amber-950/90 text-amber-300 border border-amber-500/50"
                              : isRejected
                              ? "bg-rose-950/90 text-rose-300 border border-rose-500/50"
                              : "bg-cyan-950/90 text-cyan-300 border border-cyan-500/50"
                          }`}
                        >
                          {isPending ? "PENDING APPROVAL" : t.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(confirmDeleteId === t.id ? null : t.id)}
                          className="w-6 h-6 rounded-md bg-black/80 backdrop-blur-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 border border-white/10 transition-colors flex items-center justify-center cursor-pointer shadow-md"
                          title="Remove Tournament"
                          aria-label="Remove Tournament"
                        >
                          <span className="text-xs font-mono font-bold">✕</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="font-display text-base sm:text-lg font-bold uppercase text-white line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {t.title}
                      </h4>

                      <p className={`text-xs font-sans line-clamp-2 ${isRejected ? "text-rose-300" : "text-slate-400"}`}>
                        {t.statusText}
                      </p>

                      {/* Format and Quota Tags */}
                      <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-slate-400 flex-wrap">
                        <span className="px-2 py-0.5 rounded bg-[#121828] border border-[#222E48]">
                          {t.bracketFormat || "Single Elimination"}
                        </span>
                        {t.teamQuota && (
                          <span className="px-2 py-0.5 rounded bg-[#121828] border border-[#222E48]">
                            Quota: {t.teamQuota} Universities
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Organizer Applications Review Panel — only for approved, non-completed tournaments */}
                    {!isCompleted && !isPending && !isRejected && (
                      <div className="p-3.5 bg-[#070A14] border border-[#162034] rounded-xl space-y-2.5">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400 font-bold uppercase">
                            Varsity Roster Applications
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">
                            {t.universities?.length || 0} Verified Teams
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setActiveApplicationsTourney(t)}
                          className="w-full h-9 bg-gradient-to-r from-amber-500/10 to-amber-600/20 hover:from-amber-500/20 hover:to-amber-600/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <span>⚡ Review Squad Applications</span>
                        </button>
                      </div>
                    )}

                    {confirmDeleteId === t.id ? (
                      <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-2 animate-fade-in">
                        <p className="text-[11px] font-sans text-rose-200">
                          Are you sure you want to remove this tournament?
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteTournament(t.id)}
                            className="flex-1 h-8 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer disabled:opacity-50 transition-colors"
                          >
                            {isDeleting ? "Deleting..." : "Yes, Remove"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 h-8 bg-[#121828] text-slate-300 hover:text-white rounded-lg text-[11px] font-mono font-bold uppercase cursor-pointer transition-colors border border-[#222E48]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isPending || isRejected ? null : (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveBracketTourney(t)}
                          className="flex-1 h-9 bg-[#121828] hover:bg-[#1A243A] text-slate-200 hover:text-white border border-[#222E48] rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Bracket</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveBoxScoreTourney(t)}
                          className="flex-1 h-9 bg-[#121828] hover:bg-[#1A243A] text-slate-200 hover:text-white border border-[#222E48] rounded-xl text-xs font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Box Scores</span>
                        </button>
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
