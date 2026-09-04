"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import PostTournamentModal from "@/components/dashboard/PostTournamentModal";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import SquadRegistrationModal from "@/components/tournaments/SquadRegistrationModal";
import TournamentCard from "@/components/tournaments/TournamentCard";
import { TournamentCardSkeleton } from "@/components/ui/Skeleton";
import { TrophyIcon, PlusIcon } from "@/components/ui/Icons";
import { Tournament } from "@/types";
import { tournamentsService } from "@/services";

export default function TournamentsPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { selectedGame: globalGame, selectedGameInfo } = useGame();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [registeringTournament, setRegisteringTournament] = useState<Tournament | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  
  // Application state
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Status Filter
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  const loadTournaments = () => {
    const promises: Promise<unknown>[] = [tournamentsService.getTournaments()];
    if (user?.role === "ORGANIZER") {
      promises.push(tournamentsService.getMyTournaments());
    }

    Promise.allSettled(promises)
      .then(([publicRes, myRes]) => {
        const publicList =
          publicRes && publicRes.status === "fulfilled" && Array.isArray(publicRes.value)
            ? (publicRes.value as Tournament[])
            : [];
        const myList =
          myRes && myRes.status === "fulfilled" && Array.isArray(myRes.value)
            ? (myRes.value as Tournament[])
            : [];

        const map = new Map<string, Tournament>();
        publicList.forEach((t) => map.set(t.id, t));
        myList.forEach((t) => map.set(t.id, t));

        setTournaments(Array.from(map.values()));
      })
      .catch(() => {
        setTournaments([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleApplyTournament = (t: Tournament) => {
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
      setAppliedIds((prev) => [...prev, t.id]);
    } catch {
      setAppliedIds((prev) => [...prev, t.id]);
    } finally {
      setApplyingId(null);
    }
  };

  const handleWithdrawTournament = async (t: Tournament) => {
    setApplyingId(t.id);
    try {
      await tournamentsService.withdrawApplication(t.id);
      setAppliedIds((prev) => prev.filter((id) => id !== t.id));
    } catch {
      setAppliedIds((prev) => prev.filter((id) => id !== t.id));
    } finally {
      setApplyingId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const promises: Promise<unknown>[] = [tournamentsService.getTournaments()];
    if (user?.role === "ORGANIZER") {
      promises.push(tournamentsService.getMyTournaments());
    }

    Promise.allSettled(promises)
      .then(([publicRes, myRes]) => {
        if (!isMounted) return;
        const publicList =
          publicRes && publicRes.status === "fulfilled" && Array.isArray(publicRes.value)
            ? (publicRes.value as Tournament[])
            : [];
        const myList =
          myRes && myRes.status === "fulfilled" && Array.isArray(myRes.value)
            ? (myRes.value as Tournament[])
            : [];

        const map = new Map<string, Tournament>();
        publicList.forEach((t) => map.set(t.id, t));
        myList.forEach((t) => map.set(t.id, t));

        const allTourneys = Array.from(map.values());
        setTournaments(allTourneys);

        if (user?.id && user?.role !== "ORGANIZER" && user?.role !== "ADMIN") {
          const applied = allTourneys
            .filter((t) =>
              (t.applications as Array<{ userId?: string; universityId?: string; status?: string }>)?.some(
                (app) => app.userId === user.id && app.status !== "REJECTED"
              )
            )
            .map((t) => t.id);
          setAppliedIds(applied);
        } else {
          setAppliedIds([]);
        }

        setIsLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setTournaments([]);
          setAppliedIds([]);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.role]);

  // Filter tournaments exclusively by the selected game from the game selector and status
  const filteredTournaments = useMemo(() => {
    return tournaments.filter((t) => {
      const gameUpper = (t.game || "").toUpperCase();
      const titleUpper = (t.title || "").toUpperCase();
      const combined = `${gameUpper} ${titleUpper}`;

      let matchesGame = true;
      if (globalGame === "valo") {
        matchesGame = combined.includes("VALO");
      } else if (globalGame === "lol") {
        matchesGame = combined.includes("LEAGUE") || combined.includes("LOL") || combined.includes("RIFT");
      } else if (globalGame === "ml") {
        matchesGame = combined.includes("MOBILE") || combined.includes("MLBB") || combined.includes("ML");
      } else if (globalGame === "codm") {
        matchesGame = combined.includes("CALL") || combined.includes("CODM") || combined.includes("WARFARE");
      }

      if (!matchesGame) return false;

      if (selectedStatusFilter === "MINE") {
        return Boolean(user?.id && (t.organizerId === user.id || t.organizer?.id === user.id));
      }

      if (selectedStatusFilter !== "ALL") {
        return t.status === selectedStatusFilter;
      }

      return true;
    });
  }, [tournaments, selectedStatusFilter, globalGame, user?.id]);

  const statusCounts = useMemo(() => {
    const gameTournaments = tournaments.filter((t) => {
      const gameUpper = (t.game || "").toUpperCase();
      const titleUpper = (t.title || "").toUpperCase();
      const combined = `${gameUpper} ${titleUpper}`;
      if (globalGame === "valo") return combined.includes("VALO");
      if (globalGame === "lol") return combined.includes("LEAGUE") || combined.includes("LOL") || combined.includes("RIFT");
      if (globalGame === "ml") return combined.includes("MOBILE") || combined.includes("MLBB") || combined.includes("ML");
      if (globalGame === "codm") return combined.includes("CALL") || combined.includes("CODM") || combined.includes("WARFARE");
      return true;
    });

    const myTourneys = gameTournaments.filter((t) =>
      Boolean(user?.id && (t.organizerId === user.id || t.organizer?.id === user.id))
    );

    return {
      ALL: gameTournaments.length,
      MINE: myTourneys.length,
      LIVE: gameTournaments.filter((t) => t.status === "LIVE").length,
      UPCOMING: gameTournaments.filter((t) => t.status === "UPCOMING").length,
      COMPLETED: gameTournaments.filter((t) => t.status === "COMPLETED").length,
    };
  }, [tournaments, globalGame, user?.id]);

  const filterTabs = useMemo(() => {
    return [
      { id: "ALL", label: "ALL", count: statusCounts.ALL },
      ...(user?.role === "ORGANIZER" || statusCounts.MINE > 0
        ? [{ id: "MINE", label: "YOUR TOURNAMENTS", count: statusCounts.MINE }]
        : []),
      { id: "LIVE", label: "LIVE", count: statusCounts.LIVE },
      { id: "UPCOMING", label: "UPCOMING", count: statusCounts.UPCOMING },
      { id: "COMPLETED", label: "COMPLETED", count: statusCounts.COMPLETED },
    ];
  }, [statusCounts, user?.role]);

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 space-y-8">
        
        {/* Sleek Integrated Header & Tactical Status Filter */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span 
                className="text-[9px] font-mono font-bold tracking-widest text-primary-brand uppercase px-2.5 py-0.5 bg-primary-brand/10 border border-primary-brand/30 flex items-center gap-1.5"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary-brand animate-pulse" />
                PHILIPPINE COLLEGIATE CIRCUIT • {selectedGameInfo?.name || "ARENA"}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              OFFICIAL TOURNAMENTS
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              High-stakes championship bracketing, verified varsity match logs, and real-time War Room operations.
            </p>
          </div>

          {/* Organizer Quick Direct Actions & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {user?.role === "ORGANIZER" && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHostModalOpen(true)}
                  className="h-10 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-black font-display text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <PlusIcon className="w-4 h-4 text-black" />
                  <span>Host Tournament</span>
                </button>
                <Link
                  href="/dashboard"
                  className="h-10 px-4 bg-[#141A29] hover:bg-[#1E293B] text-amber-400 border border-amber-500/30 hover:border-amber-500/60 font-display text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  <span>Director Hub</span>
                  <span>→</span>
                </Link>
              </div>
            )}

            {/* Integrated Tactical Status Segmented Controls */}
            <div 
              className="flex items-center gap-1 p-1 bg-[#0A0D18] border border-[#1E293B] shadow-xl"
              style={{
                clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
              }}
            >
              {filterTabs.map((st) => {
                const isSelected = selectedStatusFilter === st.id;
                const isMineTab = st.id === "MINE";
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStatusFilter(st.id)}
                    className={`px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? isMineTab
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg shadow-amber-500/25"
                          : "game-theme-btn"
                        : isMineTab
                        ? "text-amber-300 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-950/70"
                        : "text-slate-400 hover:text-white hover:bg-[#141A29]"
                    }`}
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    {isMineTab && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                    <span>{st.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? "bg-black/30 text-white" : isMineTab ? "bg-amber-900/60 text-amber-200" : "bg-[#141A29] text-slate-500"
                    }`}>
                      {st.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tournament Cards List */}
        {isLoading ? (
          <div className="flex flex-col gap-6">
            <TournamentCardSkeleton />
            <TournamentCardSkeleton />
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-lg mx-auto space-y-4 bg-[#0A0D18] border border-[#1E293B] p-10 shadow-2xl"
            style={{
              clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))",
            }}
          >
            <div 
              className="w-14 h-14 bg-[#141A29] border border-[#232D44] flex items-center justify-center text-slate-400"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            >
              <TrophyIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-lg font-black text-white uppercase tracking-wider">
                {selectedStatusFilter === "MINE"
                  ? "NO HOSTED TOURNAMENTS YET"
                  : `NO ${selectedStatusFilter !== "ALL" ? selectedStatusFilter : ""} ${selectedGameInfo?.name?.toUpperCase() || "GAME"} TOURNAMENTS`}
              </h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                {selectedStatusFilter === "MINE"
                  ? "You haven't established any tournaments for this esports title yet. Click below to host your first sanctioned collegiate bracket."
                  : "There are currently no tournaments matching your selected filter. New collegiate circuits are scheduled weekly."}
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                {user?.role === "ORGANIZER" && (
                  <button
                    onClick={() => setIsHostModalOpen(true)}
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-display text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-amber-500/20"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    + Host Tournament
                  </button>
                )}
                {selectedStatusFilter !== "ALL" && (
                  <button
                    onClick={() => setSelectedStatusFilter("ALL")}
                    className="px-4 py-2 game-theme-btn font-display text-xs font-black uppercase tracking-wider cursor-pointer"
                    style={{
                      clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                    }}
                  >
                    Show All Tournaments
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onSelect={setSelectedTournament}
                onApply={user?.role === "ORGANIZER" ? undefined : handleApplyTournament}
                onWithdraw={user?.role === "ORGANIZER" ? undefined : handleWithdrawTournament}
                isApplied={appliedIds.includes(tournament.id)}
                isApplying={applyingId === tournament.id}
              />
            ))}
          </div>
        )}
      </div>

      <TournamentBracketModal
        isOpen={!!selectedTournament}
        onClose={() => setSelectedTournament(null)}
        tournamentId={selectedTournament?.id}
        title={selectedTournament?.title ? `${selectedTournament.title} BRACKET` : "TOURNAMENT BRACKET"}
        subtitle="SINGLE ELIMINATION"
      />

      <SquadRegistrationModal
        isOpen={!!registeringTournament}
        onClose={() => setRegisteringTournament(null)}
        tournament={registeringTournament}
        onSuccess={handleConfirmApplication}
        onViewBracket={() => {
          if (registeringTournament) {
            setSelectedTournament(registeringTournament);
          }
        }}
      />

      <PostTournamentModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        onTournamentCreated={loadTournaments}
      />
    </div>
  );
}
