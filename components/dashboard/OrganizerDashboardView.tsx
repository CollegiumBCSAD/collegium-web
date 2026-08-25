"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserProfile, Tournament } from "@/types";
import { useGame } from "@/context/GameContext";
import { tournamentsService } from "@/services/tournamentsService";
import { TrophyIcon, SwordsIcon, ShieldIcon, CheckCircleIcon, PlusIcon } from "@/components/ui/Icons";
import PostTournamentModal from "./PostTournamentModal";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import TournamentApplicationsModal from "./TournamentApplicationsModal";

interface OrganizerDashboardViewProps {
  user: UserProfile;
}

export default function OrganizerDashboardView({ user }: OrganizerDashboardViewProps) {
  const { selectedGame, selectedGameInfo } = useGame();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // In-page modal states so user stays on dashboard
  const [activeBracketTourney, setActiveBracketTourney] = useState<Tournament | null>(null);
  const [activeBoxScoreTourney, setActiveBoxScoreTourney] = useState<Tournament | null>(null);
  const [activeApplicationsTourney, setActiveApplicationsTourney] = useState<Tournament | null>(null);

  const fetchTourneys = async () => {
    setIsLoading(true);
    try {
      const data = await tournamentsService.getTournaments();
      setTournaments(data);
    } catch {
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTourneys();
  }, []);

  const gameTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const g = (t.game || "").toLowerCase();
      if (selectedGame === "valo") return g.includes("val");
      if (selectedGame === "lol") return g.includes("league") || g.includes("lol");
      if (selectedGame === "ml") return g.includes("mobile") || g.includes("ml");
      if (selectedGame === "codm") return g.includes("call") || g.includes("cod");
      return true;
    });
  }, [tournaments, selectedGame]);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteTournament = async (id: string) => {
    setIsDeleting(true);
    try {
      await tournamentsService.deleteTournament(id);
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } catch {
      // Optimistic delete from UI
      setTournaments((prev) => prev.filter((t) => t.id !== id));
      setConfirmDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* Organizer Quick Actions Bar */}
      <div className="p-5 sm:p-6 bg-[#0A0D18] border border-[#1E293B] shadow-xl relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                // TOURNAMENT DIRECTOR WORKSPACE
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold">
                SANCTIONED
              </span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
              Official Collegiate Tournaments Hub
            </h2>
            <p className="text-xs font-sans text-slate-400">
              Manage live collegiate brackets, oversee university registrations, verify OCR match reports, and publish verified circuit standings.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 text-black" />
            <span>Apply / Host Tournament</span>
          </button>
        </div>
      </div>

      {/* Organizer Workflow Stepper (Matching Flow Diagram) */}
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
            <span className="text-[11px] text-slate-400 font-sans block">Submit format & university quota</span>
          </div>

          <div className="p-3 bg-[#0D1220] border border-emerald-500/30 rounded-xl space-y-1">
            <div className="flex items-center justify-between text-emerald-400 font-mono font-bold text-[10px]">
              <span>STEP 02</span>
              <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-display font-bold text-white block uppercase">Collegium Verify</span>
            <span className="text-[11px] text-slate-400 font-sans block">Auto-verified organizer permissions</span>
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
            <span className="text-[11px] text-slate-400 font-sans block">API / OCR results stored in matches</span>
          </div>
        </div>
      </div>

      {/* Tournaments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1A253C] pb-2.5">
          <div className="flex items-center gap-2">
            <TrophyIcon className="w-4 h-4 text-amber-400" />
            <h3 className="font-display text-base font-black text-white uppercase tracking-wider">
              {selectedGameInfo?.name || "VALORANT"} Hosted Tournaments ({gameTournaments.length})
            </h3>
          </div>
          <Link
            href="/tournaments"
            className="text-xs font-mono text-amber-400 hover:underline font-bold"
          >
            Explore Public Tournaments →
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
            Loading Tournament Rosters...
          </div>
        ) : gameTournaments.length === 0 ? (
          <div className="p-10 bg-[#0A0D18] border border-[#1E293B] rounded-2xl text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <TrophyIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display text-base font-bold uppercase text-white">
                No Tournaments Posted Yet for {selectedGameInfo?.name || "this game"}
              </h4>
              <p className="text-xs font-sans text-slate-400 max-w-md mx-auto mt-1">
                Establish an official collegiate circuit tournament for {selectedGameInfo?.name || "VALORANT"}. University varsity squads will be able to register and compete.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameTournaments.map((t) => (
              <div
                key={t.id}
                className="p-5 bg-[#0A0D18] border border-[#1E293B] rounded-2xl space-y-4 shadow-xl hover:border-amber-500/40 transition-colors flex flex-col justify-between relative"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      {t.game}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          t.status === "COMPLETED"
                            ? "bg-slate-800 text-slate-300"
                            : t.status === "LIVE"
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 animate-pulse"
                            : "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {t.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(confirmDeleteId === t.id ? null : t.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-rose-950/30 cursor-pointer"
                        title="Remove Tournament"
                        aria-label="Remove Tournament"
                      >
                        <span className="text-xs font-mono">✕</span>
                      </button>
                    </div>
                  </div>

                  <h4 className="font-display text-base font-bold uppercase text-white line-clamp-2">
                    {t.title}
                  </h4>

                  <p className="text-xs font-sans text-slate-400">
                    {t.statusText}
                  </p>
                </div>

                {/* Organizer Applications Review Panel — only for non-completed tournaments */}
                {t.status !== "COMPLETED" && (
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
                ) : (
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
            ))}
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
