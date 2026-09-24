"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { tournamentsService } from "@/services/tournamentsService";
import { OrganizeTournamentHandlers, Tournament } from "@/types";
import { GAMES, getGameInfo } from "@/lib/games";
import { buildActionQueue } from "@/lib/organize";
import OrganizeHeader from "@/components/organize/OrganizeHeader";
import OrganizeActionQueue from "@/components/organize/OrganizeActionQueue";
import OrganizePipelineBoard from "@/components/organize/OrganizePipelineBoard";
import PostTournamentModal from "@/components/dashboard/PostTournamentModal";
import TournamentApplicationsModal from "@/components/dashboard/TournamentApplicationsModal";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";

export default function OrganizePage() {
  const router = useRouter();
  const { user, isLoaded, isLoggedIn } = useAuth();
  const { selectedGame } = useGame();
  const game = GAMES[selectedGame as keyof typeof GAMES] || GAMES.valo;
  const isOrganizer = user?.role === "ORGANIZER";

  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHosting, setIsHosting] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [reviewing, setReviewing] = useState<Tournament | null>(null);
  const [bracketOf, setBracketOf] = useState<Tournament | null>(null);

  // Organize is organizer-only; everyone else belongs on their dashboard.
  useEffect(() => {
    if (!isLoaded) return;
    if (!isLoggedIn) router.replace("/login");
    else if (!isOrganizer) router.replace("/dashboard");
  }, [isLoaded, isLoggedIn, isOrganizer, router]);

  const refresh = useCallback(async () => {
    try {
      setTournaments(await tournamentsService.getMyTournaments());
    } catch {
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOrganizer) return;
    let cancelled = false;
    tournamentsService
      .getMyTournaments()
      .then((data) => !cancelled && setTournaments(data))
      .catch(() => !cancelled && setTournaments([]))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isOrganizer]);

  const handlers: OrganizeTournamentHandlers = useMemo(
    () => ({
      onEdit: setEditing,
      onReviewApplications: setReviewing,
      onOpenBracket: setBracketOf,
      onStart: async (id) => {
        await tournamentsService.startTournament(id);
        await refresh();
      },
      onDelete: async (id) => {
        await tournamentsService.deleteTournament(id);
        setTournaments((prev) => prev.filter((t) => t.id !== id));
      },
    }),
    [refresh]
  );

  // Everything on the page is scoped to the game picked in the header switcher.
  const gameTournaments = useMemo(
    () => tournaments.filter((t) => getGameInfo(t.gameTitle || t.game).id === game.id),
    [tournaments, game.id]
  );
  const queue = useMemo(() => buildActionQueue(gameTournaments), [gameTournaments]);

  if (!isLoaded || !user || !isOrganizer) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
        Loading workspace…
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-8 sm:py-10 px-4 sm:px-6 lg:px-10 relative animate-page-slide-in">
      <div className="max-w-7xl mx-auto w-full space-y-10">
        <OrganizeHeader
          gameId={game.id}
          gameName={game.name}
          hostName={user.displayName}
          universityName={user.university?.name}
          tournaments={gameTournaments}
          onHost={() => setIsHosting(true)}
        />
        <OrganizeActionQueue items={queue} isLoading={isLoading} handlers={handlers} />
        <OrganizePipelineBoard
          gameShortName={game.shortName}
          tournaments={gameTournaments}
          isLoading={isLoading}
          handlers={handlers}
          onHost={() => setIsHosting(true)}
        />
      </div>

      <PostTournamentModal
        isOpen={isHosting || !!editing}
        initialTournament={editing}
        onClose={() => {
          setIsHosting(false);
          setEditing(null);
        }}
        onTournamentCreated={refresh}
      />
      {reviewing && (
        <TournamentApplicationsModal
          isOpen
          onClose={() => setReviewing(null)}
          tournamentId={reviewing.id}
          tournamentTitle={reviewing.title}
          gameTitle={reviewing.game}
          onApplicationUpdated={refresh}
        />
      )}
      {bracketOf && (
        <TournamentBracketModal
          isOpen
          onClose={() => {
            setBracketOf(null);
            refresh();
          }}
          tournamentId={bracketOf.id}
          title={bracketOf.title}
          subtitle={`${bracketOf.game} • OFFICIAL BRACKET`}
        />
      )}
    </div>
  );
}
