"use client";


import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { GameId, ScrimOffer } from "@/types";
import { scrimsService } from "@/services";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { useWarRoom } from "@/context/WarRoomContext";
import ScrimCard from "@/components/scrims/ScrimCard";
import { ScrimCardSkeleton } from "@/components/ui/Skeleton";
import { SwordsIcon, AlertTriangleIcon, TrophyIcon, ZapIcon, ShieldIcon, CheckCircleIcon, FlameIcon } from "@/components/ui/Icons";
import { GAME_LIST } from "@/lib/games";
import PostScrimModal from "@/components/scrims/PostScrimModal";
import NoSquadModal from "@/components/scrims/NoSquadModal";

const getMyRequestedScrims = (): Record<string, string[]> => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("collegium_scrim_user_requests") || "{}");
  } catch {
    return {};
  }
};

const addMyRequestedScrim = (scrimId: string, teamId: string) => {
  if (typeof window === "undefined") return;
  const current = getMyRequestedScrims();
  const list = current[scrimId] || [];
  if (!list.includes(teamId)) {
    list.push(teamId);
  }
  current[scrimId] = list;
  localStorage.setItem("collegium_scrim_user_requests", JSON.stringify(current));
};

const removeMyRequestedScrim = (scrimId: string, teamId?: string) => {
  if (typeof window === "undefined") return;
  const current = getMyRequestedScrims();
  if (teamId && current[scrimId]) {
    current[scrimId] = current[scrimId].filter((id) => id !== teamId);
    if (current[scrimId].length === 0) delete current[scrimId];
  } else {
    delete current[scrimId];
  }
  localStorage.setItem("collegium_scrim_user_requests", JSON.stringify(current));
};

const hasUserRequestedScrim = (scrimId: string, myTeamIds: string[], userId: string): boolean => {
  const current = getMyRequestedScrims();
  const list = current[scrimId] || [];
  return list.some((id) => myTeamIds.includes(id) || id === userId);
};

interface PendingRequestItem {
  teamId: string;
  teamName: string;
  universityName?: string;
  requestedAt?: string;
}

const getPendingScrimRequestsMap = (): Record<string, PendingRequestItem[]> => {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("collegium_scrim_requests_map") || "{}");
  } catch {
    return {};
  }
};

const addPendingScrimRequest = (scrimId: string, req: { teamId: string; teamName: string; universityName?: string }) => {
  if (typeof window === "undefined") return;
  const current = getPendingScrimRequestsMap();
  const list = current[scrimId] || [];
  if (!list.some((item) => item.teamId === req.teamId)) {
    list.push({ ...req, requestedAt: new Date().toISOString() });
  }
  current[scrimId] = list;
  localStorage.setItem("collegium_scrim_requests_map", JSON.stringify(current));
};

const removePendingScrimRequest = (scrimId: string, teamId?: string) => {
  if (typeof window === "undefined") return;
  const current = getPendingScrimRequestsMap();
  if (teamId && current[scrimId]) {
    current[scrimId] = current[scrimId].filter((item) => item.teamId !== teamId);
    if (current[scrimId].length === 0) delete current[scrimId];
  } else {
    delete current[scrimId];
  }
  localStorage.setItem("collegium_scrim_requests_map", JSON.stringify(current));
};

export default function ScrimsPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoaded } = useAuth();
  const { selectedGame: globalGame, selectedGameInfo, selectGame } = useGame();
  const { openWarRoom } = useWarRoom();
  const activeGame: GameId = globalGame || "valo";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoSquadModalOpen, setIsNoSquadModalOpen] = useState(false);
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>(() => getStoredTeams());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");

  useEffect(() => {
    if (isLoaded && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoaded, isLoggedIn, router]);

  useEffect(() => {
    fetchTeamsApi().then((teams) => setUserTeams(teams));
  }, []);

  const myTeams = useMemo(() => {
    if (!user) return [];
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";

    return userTeams.filter((t: Team) =>
      (myId && t.captainId === myId) ||
      t.members.some(
        (m) =>
          m.status === "ACCEPTED" &&
          ((myId && m.userId === myId) ||
           (myEmail && m.email && m.email.toLowerCase().trim() === myEmail))
      )
    );
  }, [user, userTeams]);

  const isUserHost = useCallback(
    (scrim: ScrimOffer) => {
      if (!user) return false;

      // 1. Match direct user ID (if posted as individual user)
      if (scrim.teamId && scrim.teamId === user.id) return true;

      // 2. Match captain team ID (ONLY if user is captain of the host team)
      const captainTeamIds = myTeams
        .filter(
          (t: Team) =>
            t.captainId === user.id ||
            (user.displayName && t.captainName?.toLowerCase().trim() === user.displayName.toLowerCase().trim())
        )
        .map((t: Team) => t.id);

      if (scrim.teamId && captainTeamIds.includes(scrim.teamId)) return true;

      // 3. Match captain team name (ONLY if user is captain of that team)
      const captainTeamNames = myTeams
        .filter(
          (t: Team) =>
            t.captainId === user.id ||
            (user.displayName && t.captainName?.toLowerCase().trim() === user.displayName.toLowerCase().trim())
        )
        .map((t: Team) => t.name.toLowerCase().trim());

      if (
        scrim.hostTeamName &&
        scrim.hostTeamName !== "Varsity Squad" &&
        captainTeamNames.includes(scrim.hostTeamName.toLowerCase().trim())
      ) {
        return true;
      }

      return false;
    },
    [user, myTeams]
  );

  const isUserOpponent = useCallback(
    (scrim: ScrimOffer) => {
      if (!user) return false;
      if (isUserHost(scrim)) return false;
      const myTeamNames = myTeams.map((t: Team) => t.name.toLowerCase().trim());
      const myTeamIds = myTeams.map((t: Team) => t.id);

      if (scrim.opponentTeamId && (myTeamIds.includes(scrim.opponentTeamId) || scrim.opponentTeamId === user.id)) return true;
      if (scrim.opponentTeamName && myTeamNames.includes(scrim.opponentTeamName.toLowerCase().trim())) return true;
      if (hasUserRequestedScrim(scrim.id, myTeamIds, user.id)) return true;

      return false;
    },
    [user, myTeams, isUserHost]
  );

  const isUserChosenOpponent = useCallback(
    (scrim: ScrimOffer) => {
      if (!user) return false;
      if (isUserHost(scrim)) return false;
      const myTeamNames = myTeams.map((t: Team) => t.name.toLowerCase().trim());
      const myTeamIds = myTeams.map((t: Team) => t.id);

      const opponentName = (scrim.opponentTeamName || "").toLowerCase().trim();
      const opponentId = scrim.opponentTeamId;

      if (opponentId && (myTeamIds.includes(opponentId) || opponentId === user.id)) return true;
      if (opponentName && myTeamNames.includes(opponentName)) return true;

      return false;
    },
    [user, myTeams, isUserHost]
  );

  useEffect(() => {
    let isMounted = true;

    const fetchLatest = () => {
      scrimsService
        .getScrims(activeGame)
        .then((data) => {
          if (isMounted) {
            const list = Array.isArray(data) ? data : [];
            setScrims(list);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setScrims([]);
            setIsLoading(false);
          }
        });
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeGame]);

  const filteredScrims = useMemo(() => {
    return scrims.filter((s) => {
      // Cancelled scrims are only visible to the host captain who posted them
      if (s.status === "CANCELLED" && !isUserHost(s)) return false;

      if (selectedFormat !== "ALL") {
        if (s.format && !s.format.toUpperCase().includes(selectedFormat)) return false;
      }

      if (!s.gameTitle) return true;
      const title = s.gameTitle.toLowerCase();
      if (activeGame === "valo") return title.includes("val");
      if (activeGame === "lol") return title.includes("lol") || title.includes("league");
      if (activeGame === "codm") return title.includes("cod") || title.includes("call");
      if (activeGame === "ml") return title.includes("ml") || title.includes("mobile");
      return true;
    });
  }, [scrims, activeGame, selectedFormat, isUserHost]);

  const enrichedScrims = useMemo(() => {
    const map = getPendingScrimRequestsMap();
    return filteredScrims.map((s) => {
      const serverReqs = Array.isArray(s.pendingRequests) ? s.pendingRequests : [];
      const localReqs = map[s.id] || [];
      const opponentReq = s.opponentTeamName
        ? [{ teamId: s.opponentTeamId || "op-id", teamName: s.opponentTeamName }]
        : [];

      const merged = [...serverReqs];
      [...localReqs, ...opponentReq].forEach((r) => {
        if (!merged.some((m) => m.teamId === r.teamId)) {
          merged.push(r);
        }
      });

      return {
        ...s,
        pendingRequests: merged,
      };
    });
  }, [filteredScrims]);

  const handlePostScrimSubmit = async (data: {
    gameTitle: GameId;
    teamId?: string;
    hostTeamName: string;
    format: string;
    rankRange: string;
    mapPreference?: string;
    notes: string;
  }) => {
    const userTeam = myTeams.find((t: Team) => t.gameTitle === data.gameTitle) || myTeams[0];
    const teamId = data.teamId || userTeam?.id || user?.id || "default-team-id";

    const optimistic: ScrimOffer = {
      id: `scrim-${Date.now()}`,
      teamId,
      hostTeamName: data.hostTeamName,
      universityName: user?.university?.name || "",
      gameTitle: data.gameTitle,
      format: data.format,
      rankRange: data.rankRange,
      mapPreference: data.mapPreference,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      notes: data.notes,
      status: "OPEN",
    };
    setScrims((prev) => [optimistic, ...prev]);

    try {
      await scrimsService.createScrim({
        teamId,
        gameTitle: data.gameTitle,
        format: data.format,
        rankRange: data.rankRange,
        mapPreference: data.mapPreference,
        scheduledAt: optimistic.scheduledAt,
        notes: data.notes,
      });
    } catch {
      // Best effort API sync
    }

    setTimeout(() => scrimsService.getScrims(activeGame).then(setScrims), 1000);
  };

  const [scrimError, setScrimError] = useState("");

  const bookedScrims = useMemo(() => {
    return scrims.filter(
      (s) => s.status === "CONFIRMED" && (isUserHost(s) || (s.opponentTeamName && myTeams.some((t: Team) => t.name === s.opponentTeamName)))
    );
  }, [scrims, isUserHost, myTeams]);

  const handleConfirmBooking = async (id: string, selectedOpponentId?: string) => {
    setScrimError("");
    try {
      await scrimsService.confirmScrim(id, selectedOpponentId);
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setScrimError(errorObj?.response?.data?.message || errorObj?.message || "Failed to confirm booking.");
    }
  };

  const handleDeclineRequest = (scrimId: string, opponentId?: string) => {
    removePendingScrimRequest(scrimId, opponentId);
    if (opponentId) {
      removeMyRequestedScrim(scrimId, opponentId);
    }
    scrimsService.getScrims(activeGame).then(setScrims);
  };

  const handleAcceptScrim = async (id: string) => {
    setScrimError("");
    const targetScrim = scrims.find((s) => s.id === id);
    if (targetScrim && isUserHost(targetScrim)) {
      setScrimError("You cannot book a scrim offer posted by your own team.");
      return;
    }

    const myTeam = myTeams.find((t: Team) => t.gameTitle === activeGame) || myTeams[0];

    if (!myTeam) {
      setIsNoSquadModalOpen(true);
      return;
    }

    addMyRequestedScrim(id, myTeam.id);
    addPendingScrimRequest(id, {
      teamId: myTeam.id,
      teamName: myTeam.name,
      universityName: myTeam.universityName || user?.university?.name
    });

    try {
      await scrimsService.acceptScrim(id, { opponentId: myTeam.id });
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setScrimError(errorObj?.response?.data?.message || errorObj?.message || "Failed to book scrim match.");
    }
  };

  const handleCancelScrim = async (id: string) => {
    const myTeam = myTeams.find((t: Team) => t.gameTitle === activeGame) || myTeams[0];
    removeMyRequestedScrim(id, myTeam?.id);
    removePendingScrimRequest(id, myTeam?.id);

    try {
      await scrimsService.cancelScrim(id);
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
    } catch {
      setScrims((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "OPEN" as const, opponentTeamName: undefined } : s
        )
      );
    }
  };

  const handleDeleteScrim = async (id: string) => {
    try {
      await scrimsService.deleteScrim(id);
      setScrims((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setScrims((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (!isLoaded || !isLoggedIn || !user) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-sans text-secondary-text animate-pulse">
        Loading Scrim Board...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 space-y-8">
        
        {/* Header Banner */}
        <div className="border-b border-[#1E2538] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-mono font-bold tracking-widest text-primary-brand uppercase flex items-center gap-1.5">
                <SwordsIcon className="w-4 h-4 text-primary-brand" />
                AUTOMATED INTER-UNIVERSITY MATCHMAKING
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground uppercase">
              INTER-UNIVERSITY SCRIM BOARD
            </h1>
            <p className="font-sans text-xs sm:text-sm text-secondary-text mt-1 max-w-xl leading-relaxed">
              Find verified collegiate opponents for {selectedGameInfo?.name || "Valorant"} practice matches, custom lobby testing, and tournament warm-ups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLoggedIn && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-6 game-theme-btn font-display text-sm font-black uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-xl shadow-primary-brand/20 shrink-0"
              >
                <SwordsIcon className="w-4 h-4" />
                <span>Post Scrim Offer</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Format Filter & Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D121F]/95 border border-[#1E293B] shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mr-2">FORMAT:</span>
            {["ALL", "BO1", "BO3", "BO5"].map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  selectedFormat === fmt
                    ? "game-theme-btn shadow-sm font-black"
                    : "tactical-btn-secondary text-slate-400 border-[#1E2538] hover:text-white"
                }`}
                style={{
                  backgroundColor: selectedFormat === fmt ? "var(--primary-brand)" : undefined,
                  color: selectedFormat === fmt ? "var(--game-btn-text, #FFFFFF)" : undefined,
                  borderColor: selectedFormat === fmt ? "var(--primary-brand)" : undefined,
                }}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#080B12] border border-[#1E2538]" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
              <ZapIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>OPEN OFFERS: <strong className="text-white">{enrichedScrims.length}</strong></span>
            </span>
            {bookedScrims.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-[#141A29] text-emerald-400 border border-[#232D44]" style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}>
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>BOOKED MATCHES: <strong className="text-white">{bookedScrims.length}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Booked Scrim Compact Notification Toast Bar */}
        {bookedScrims.length > 0 && (
          <div className="bg-[#0D121F]/95 border border-[#1E293B] px-4 py-2.5 shadow-lg backdrop-blur-md flex items-center justify-between gap-4" style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs font-sans font-bold text-white truncate">
                {bookedScrims.length} Practice Match Booked & Ready:{" "}
                <span className="text-slate-300 font-normal">
                  {bookedScrims[0]?.hostTeamName} vs {bookedScrims[0]?.opponentTeamName || "Opponent"}
                </span>
              </span>
            </div>

            <button
              onClick={() => openWarRoom(bookedScrims[0], isUserHost(bookedScrims[0]))}
              className="h-8 px-4 game-theme-btn font-sans text-xs font-extrabold uppercase tracking-wider shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <FlameIcon className="w-3.5 h-3.5 text-white" />
              <span>War Room →</span>
            </button>
          </div>
        )}

        {scrimError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-sans font-semibold flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-error shrink-0" />
              <span>{scrimError}</span>
            </span>
            <button onClick={() => setScrimError("")} className="hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScrimCardSkeleton />
            <ScrimCardSkeleton />
            <ScrimCardSkeleton />
            <ScrimCardSkeleton />
          </div>
        ) : enrichedScrims.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto space-y-4 rounded-2xl border border-[#1E273A] bg-[#0C101A]/95 p-8 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-[#141926] border border-[#232B3E] flex items-center justify-center text-primary-brand shadow-inner">
              <SwordsIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
                NO OPEN SCRIMS FOUND FOR {selectedGameInfo?.shortName || "THIS TITLE"}
              </h3>
              <p className="font-sans text-xs text-secondary-text leading-relaxed">
                There are currently no active scrim offers matching your filter. Click &quot;Post Scrim Offer&quot; to challenge collegiate opponents!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {enrichedScrims.map((scrim) => (
              <ScrimCard
                key={scrim.id}
                scrim={scrim}
                onAccept={handleAcceptScrim}
                onConfirmBooking={handleConfirmBooking}
                onDeclineRequest={handleDeclineRequest}
                onCancel={handleCancelScrim}
                onDelete={handleDeleteScrim}
                onOpenWarRoom={(s) => openWarRoom(s, isUserHost(s))}
                isHost={isUserHost(scrim)}
                isOpponent={isUserOpponent(scrim)}
                isChosenOpponent={isUserChosenOpponent(scrim)}
              />
            ))}
          </div>
        )}

        <PostScrimModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultGame={activeGame}
          onSubmit={handlePostScrimSubmit}
        />

        <NoSquadModal
          isOpen={isNoSquadModalOpen}
          onClose={() => setIsNoSquadModalOpen(false)}
          gameTitle={activeGame}
        />
      </div>
    </div>
  );
}


