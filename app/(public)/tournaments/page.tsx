"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import SquadRegistrationModal from "@/components/tournaments/SquadRegistrationModal";
import TournamentCard from "@/components/tournaments/TournamentCard";
import TournamentsHero from "@/components/tournaments/TournamentsHero";
import TournamentsFilterTabs from "@/components/tournaments/TournamentsFilterTabs";
import { TournamentCardSkeleton } from "@/components/ui/Skeleton";
import { Tournament, TournamentDetailTab } from "@/types";
import { tournamentsService } from "@/services";
import { GAMES, getGameInfo } from "@/lib/games";

export default function TournamentsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { selectedGame } = useGame();
  const game = GAMES[selectedGame as keyof typeof GAMES] || GAMES.valo;

  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedTournamentTab, setSelectedTournamentTab] = useState<TournamentDetailTab>("bracket");
  const [registeringTournament, setRegisteringTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const loadTournaments = useCallback(() => {
    const promises: Promise<unknown>[] = [tournamentsService.getTournaments()];
    if (user?.role === "ORGANIZER") promises.push(tournamentsService.getMyTournaments());

    Promise.allSettled(promises)
      .then(([publicRes, myRes]) => {
        const listOf = (res?: PromiseSettledResult<unknown>) =>
          res && res.status === "fulfilled" && Array.isArray(res.value) ? (res.value as Tournament[]) : [];
        const map = new Map<string, Tournament>();
        [...listOf(publicRes), ...listOf(myRes)].forEach((t) => map.set(t.id, t));
        const all = Array.from(map.values());
        setTournaments(all);

        if (user?.id && user?.role !== "ORGANIZER" && user?.role !== "ADMIN") {
          setAppliedIds(
            all
              .filter((t) =>
                (t.applications as Array<{ userId?: string; status?: string }>)?.some(
                  (app) => app.userId === user.id && app.status !== "REJECTED"
                )
              )
              .map((t) => t.id)
          );
        } else {
          setAppliedIds([]);
        }
      })
      .catch(() => {
        setTournaments([]);
        setAppliedIds([]);
      })
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  const canApply = Boolean(user && user.role !== "ORGANIZER" && user.role !== "ADMIN");

  const handleApply = (t: Tournament) => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setRegisteringTournament(t);
  };

  const handleConfirmApplication = async (teamId?: string) => {
    if (!registeringTournament) return;
    const t = registeringTournament;
    setApplyingId(t.id);
    try {
      await tournamentsService.applyForTournament(t.id, teamId);
    } finally {
      setAppliedIds((prev) => Array.from(new Set([...prev, t.id])));
      loadTournaments();
      setApplyingId(null);
    }
  };

  const handleWithdraw = async (t: Tournament) => {
    setApplyingId(t.id);
    try {
      await tournamentsService.withdrawApplication(t.id);
    } finally {
      setAppliedIds((prev) => prev.filter((id) => id !== t.id));
      loadTournaments();
      setApplyingId(null);
    }
  };

  const userId = user?.id;
  const isMine = useCallback(
    (t: Tournament) => Boolean(userId && (t.organizerId === userId || t.organizer?.id === userId)),
    [userId]
  );

  // Everything on the page is scoped to the game picked in the header switcher.
  const gameTournaments = useMemo(
    () => tournaments.filter((t) => getGameInfo(t.gameTitle || t.game).id === game.id),
    [tournaments, game.id]
  );

  const visible = useMemo(() => {
    if (statusFilter === "ALL") return gameTournaments;
    if (statusFilter === "MINE") return gameTournaments.filter(isMine);
    return gameTournaments.filter((t) => t.status === statusFilter);
  }, [gameTournaments, statusFilter, isMine]);

  const tabs = useMemo(() => {
    const mine = gameTournaments.filter(isMine).length;
    const count = (s: string) => gameTournaments.filter((t) => t.status === s).length;
    return [
      { id: "ALL", label: "All", count: gameTournaments.length },
      ...(user?.role === "ORGANIZER" || mine > 0 ? [{ id: "MINE", label: "Hosted by you", count: mine }] : []),
      { id: "LIVE", label: "Live", count: count("LIVE") },
      { id: "UPCOMING", label: "Upcoming", count: count("UPCOMING") },
      { id: "COMPLETED", label: "Completed", count: count("COMPLETED") },
    ];
  }, [gameTournaments, isMine, user?.role]);

  const openTournament = (t: Tournament, tab: TournamentDetailTab = "bracket") => {
    setSelectedTournamentTab(tab);
    setSelectedTournament(t);
  };

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-10">
        <TournamentsHero
          gameName={game.name}
          gameShortName={game.shortName}
          tournaments={gameTournaments}
          onOpen={(t) => openTournament(t)}
        />

        <div className="space-y-6">
          <TournamentsFilterTabs tabs={tabs} active={statusFilter} onChange={setStatusFilter} />

          {isLoading ? (
            <div className="flex flex-col gap-6">
              <TournamentCardSkeleton />
              <TournamentCardSkeleton />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 px-6 text-center">
              <h3 className="font-display text-lg font-black uppercase text-white">
                {statusFilter === "MINE" ? "You haven't hosted one yet" : `No ${game.shortName} tournaments here`}
              </h3>
              <p className="mt-2 text-sm font-sans text-slate-400">
                {statusFilter === "MINE"
                  ? `Host your first ${game.name} tournament from your Organize workspace.`
                  : "Nothing matches this filter right now. New circuits open regularly."}
              </p>
              <div className="mt-5 flex justify-center gap-5 text-[11px] font-mono font-bold uppercase tracking-[0.2em]">
                {user?.role === "ORGANIZER" && (
                  <Link href="/organize" className="text-primary-brand hover:text-white transition-colors">
                    Go to Organize →
                  </Link>
                )}
                {statusFilter !== "ALL" && (
                  <button type="button" onClick={() => setStatusFilter("ALL")} className="text-slate-400 hover:text-white transition-colors">
                    Show all
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {visible.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onSelect={openTournament}
                  onApply={canApply ? handleApply : undefined}
                  onWithdraw={canApply ? handleWithdraw : undefined}
                  isApplied={canApply && appliedIds.includes(t.id)}
                  isApplying={applyingId === t.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <TournamentBracketModal
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        tournamentId={selectedTournament?.id}
        title={selectedTournament?.title ? `${selectedTournament.title} BRACKET` : "TOURNAMENT BRACKET"}
        subtitle="SINGLE ELIMINATION"
        initialTab={selectedTournamentTab}
      />

      <SquadRegistrationModal
        isOpen={!!registeringTournament}
        onClose={() => setRegisteringTournament(null)}
        tournament={registeringTournament}
        onSuccess={handleConfirmApplication}
        onViewBracket={() => {
          if (registeringTournament) setSelectedTournament(registeringTournament);
        }}
      />
    </div>
  );
}
