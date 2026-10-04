"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { coachService } from "@/services";
import { CoachInvitation, CoachTeam, CoachTeamDashboard } from "@/types";
import { getGameInfo } from "@/lib/games";
import CoachHubHero from "@/components/coach/CoachHubHero";
import CoachInvitationsPanel from "@/components/coach/CoachInvitationsPanel";
import CoachTeamSwitcher from "@/components/coach/CoachTeamSwitcher";
import CoachCreateTeamForm from "@/components/coach/CoachCreateTeamForm";
import CoachTeamOverview from "@/components/coach/CoachTeamOverview";
import CoachJoinRequestsPanel from "@/components/coach/CoachJoinRequestsPanel";
import CoachRosterPanel from "@/components/coach/CoachRosterPanel";
import CoachTournamentPanel from "@/components/coach/CoachTournamentPanel";
import CoachStatsPanel from "@/components/coach/CoachStatsPanel";
import NextPracticeCard from "@/components/coach/NextPracticeCard";
import PracticeSchedulePanel from "@/components/coach/PracticeSchedulePanel";
import PracticeRecordPanel from "@/components/coach/PracticeRecordPanel";
import CoachAuditLogPanel from "@/components/coach/CoachAuditLogPanel";

const fetchHub = () =>
  Promise.all([
    coachService.getMyTeams().catch((): CoachTeam[] => []),
    coachService.getInvitations().catch((): CoachInvitation[] => []),
  ]);

const gameOf = (team: CoachTeam) => getGameInfo(team.gameTitle).id;

export default function CoachHubPage() {
  const router = useRouter();
  const { user, isLoaded, isLoggedIn } = useAuth();
  const { selectedGame, selectGame } = useGame();
  const isCoach = user?.role === "COACH";

  const [teams, setTeams] = useState<CoachTeam[]>([]);
  const [invitations, setInvitations] = useState<CoachInvitation[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<CoachTeamDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // The hub is coach-only; everyone else belongs on their own dashboard.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isLoggedIn) router.replace("/login");
    else if (!isCoach) router.replace("/dashboard");
  }, [isLoaded, isLoggedIn, isCoach, router]);

  const applyHub = useCallback(([myTeams, myInvites]: [CoachTeam[], CoachInvitation[]]) => {
    setTeams(myTeams);
    setInvitations(myInvites);
    setIsLoading(false);
  }, []);

  const loadHub = useCallback(() => {
    fetchHub().then(applyHub);
  }, [applyHub]);

  useEffect(() => {
    if (!isCoach) return;
    let cancelled = false;
    fetchHub().then((data) => !cancelled && applyHub(data));
    return () => {
      cancelled = true;
    };
  }, [isCoach, applyHub]);

  // The hub follows the site's game: picking a squad switches the theme, and
  // switching game in the header jumps to that game's squad.
  const activeTeam = useMemo(() => {
    const picked = teams.find((t) => t.id === activeTeamId);
    if (picked && gameOf(picked) === selectedGame) return picked;
    return teams.find((t) => gameOf(t) === selectedGame) ?? picked ?? teams[0] ?? null;
  }, [teams, activeTeamId, selectedGame]);

  const activeId = activeTeam?.id ?? null;

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    coachService
      .getTeamDashboard(activeId)
      .then((d) => !cancelled && setDashboard(d))
      .catch(() => !cancelled && setDashboard(null));
    return () => {
      cancelled = true;
    };
  }, [activeId, refreshKey]);

  const selectTeam = useCallback(
    (team: CoachTeam) => {
      setActiveTeamId(team.id);
      selectGame(gameOf(team));
    },
    [selectGame],
  );

  const handleTeamChanged = useCallback(() => {
    setRefreshKey((k) => k + 1);
    loadHub();
  }, [loadHub]);

  if (!isLoaded || !isCoach || isLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-mono uppercase tracking-widest text-slate-400 animate-pulse">
        Loading Coach Hub...
      </div>
    );
  }

  const activeDashboard = dashboard && dashboard.id === activeId ? dashboard : null;
  const showCreate = isCreating || teams.length === 0;

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <CoachHubHero
          coachName={user.displayName}
          universityName={user.university?.name}
          gameId={activeTeam ? gameOf(activeTeam) : (selectedGame ?? "valo")}
          teams={teams}
          invitationCount={invitations.length}
          onCreateTeam={() => setIsCreating(true)}
        />

        <CoachInvitationsPanel invitations={invitations} onResponded={loadHub} />

        {teams.length > 0 && (
          <CoachTeamSwitcher
            teams={teams}
            activeTeamId={activeId}
            onSelect={selectTeam}
            isCreating={isCreating}
            onToggleCreate={() => setIsCreating((c) => !c)}
          />
        )}

        {showCreate && (
          <CoachCreateTeamForm
            onCreated={(team) => {
              setTeams((prev) => [...prev, team]);
              setIsCreating(false);
              selectTeam(team);
            }}
          />
        )}

        {activeDashboard && (
          <div key={activeDashboard.id} className="space-y-6 animate-page-slide-in">
            <CoachTeamOverview team={activeDashboard} onChanged={handleTeamChanged} />

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6 items-start">
              <div className="space-y-6">
                <CoachJoinRequestsPanel teamId={activeDashboard.id} coachId={user.id} onChanged={handleTeamChanged} />
                <CoachRosterPanel team={activeDashboard} onChanged={handleTeamChanged} />
                <CoachTournamentPanel team={activeDashboard} onChanged={handleTeamChanged} />
                <CoachStatsPanel teamId={activeDashboard.id} />
              </div>
              <div className="space-y-6 lg:sticky lg:top-24">
                <NextPracticeCard schedules={activeDashboard.practiceSchedules} />
                <PracticeSchedulePanel team={activeDashboard} onChanged={handleTeamChanged} />
                <PracticeRecordPanel team={activeDashboard} onChanged={handleTeamChanged} />
                <CoachAuditLogPanel teamId={activeDashboard.id} refreshKey={refreshKey} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
