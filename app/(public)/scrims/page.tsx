"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { GameId, ScrimOffer } from "@/types";
import { scrimsService } from "@/services";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { useWarRoom } from "@/context/WarRoomContext";
import ScrimCard from "@/components/scrims/ScrimCard";
import { ScrimCardSkeleton } from "@/components/ui/Skeleton";
import { SwordsIcon, AlertTriangleIcon, ZapIcon, CheckCircleIcon, FlameIcon } from "@/components/ui/Icons";
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
  const { selectedGame: globalGame, selectedGameInfo } = useGame();
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
    if (user?.role === "ADMIN") {
      setScrimError("Admin accounts cannot accept scrim offers.");
      return;
    }
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
      <div className="min-h-[85vh] flex items-center justify-center text-xs font-mono text-slate-400 uppercase tracking-widest animate-pulse bg-background">
        LOADING SCRIM BOARD...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12 lg:py-16 space-y-8">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#182338] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span 
                className="text-[9px] font-mono font-bold tracking-widest text-primary-brand uppercase px-2 py-0.5 bg-primary-brand/10 border border-primary-brand/30"
                style={{
                  clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                }}
              >
                TACTICAL PRACTICE MATCHMAKING
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase drop-shadow-sm">
              INTER-UNIVERSITY SCRIM BOARD
            </h1>
            <p className="font-sans text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
              Find verified collegiate opponents for {selectedGameInfo?.name || "Valorant"} practice matches, custom lobby testing, and tournament warm-ups.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isLoggedIn && user?.role !== "ADMIN" && (
              <button
                onClick={() => {
                  if (myTeams.length === 0) {
                    setIsNoSquadModalOpen(true);
                  } else {
                    setIsModalOpen(true);
                  }
                }}
                className="h-10 px-5 game-theme-btn font-display text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shadow-lg hover:shadow-primary-brand/20 shrink-0"
                style={{
                  clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                }}
              >
                <SwordsIcon className="w-4 h-4" />
                <span>Post Scrim Offer</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Format Filter & Status Bar */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0A0D18] border border-[#1E293B] shadow-2xl"
          style={{
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        >
          {/* Format Tabs Switcher */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-2">FORMAT:</span>
            {["ALL", "BO1", "BO3", "BO5"].map((fmt) => {
              const isSelected = selectedFormat === fmt;
              return (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1 font-display text-xs font-black uppercase tracking-wide transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "game-theme-btn scale-105"
                      : "tactical-btn-secondary text-slate-400 hover:text-white"
                  }`}
                  style={{
                    clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)",
                  }}
                >
                  {fmt}
                </button>
              );
            })}
          </div>

          {/* Quick Telemetry Indicators */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-300">
            <span 
              className="flex items-center gap-1.5 px-3 py-1 bg-[#060812] border border-[#182338]"
              style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}
            >
              <ZapIcon className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>OPEN OFFERS: <strong className="text-white font-extrabold">{enrichedScrims.length}</strong></span>
            </span>
            {bookedScrims.length > 0 && (
              <span 
                className="flex items-center gap-1.5 px-3 py-1 bg-[#101626] text-emerald-400 border border-emerald-500/20"
                style={{ clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)" }}
              >
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>BOOKED MATCHES: <strong className="text-white font-extrabold">{bookedScrims.length}</strong></span>
              </span>
            )}
          </div>
        </div>

        {/* Booked Scrim Compact Notification Toast Bar */}
        {bookedScrims.length > 0 && (
          <div 
            className="bg-gradient-to-r from-[#0F1626] via-[#0A0D18] to-[#05070E] border border-emerald-500/40 px-4 py-3 shadow-2xl flex items-center justify-between gap-4" 
            style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))" }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-ping" />
              <span className="text-xs font-sans font-bold text-white truncate">
                {bookedScrims.length} Practice Match Booked & Ready:{" "}
                <span className="text-slate-300 font-normal">
                  {bookedScrims[0]?.hostTeamName} vs {bookedScrims[0]?.opponentTeamName || "Opponent"}
                </span>
              </span>
            </div>

            <button
              onClick={() => openWarRoom(bookedScrims[0], isUserHost(bookedScrims[0]))}
              className="h-8 px-4 game-theme-btn font-display text-[10px] font-black uppercase tracking-wider shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
              style={{
                clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
              }}
            >
              <FlameIcon className="w-3.5 h-3.5 text-white" />
              <span>War Room →</span>
            </button>
          </div>
        )}

        {scrimError && (
          <div className="p-4 bg-rose-950/20 border border-rose-500/30 text-rose-400 text-xs font-sans font-semibold flex items-center justify-between gap-2 rounded-xl">
            <span className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span>{scrimError}</span>
            </span>
            <button onClick={() => setScrimError("")} className="hover:underline cursor-pointer font-bold uppercase text-[10px] tracking-wider text-rose-300">
              Dismiss
            </button>
          </div>
        )}

        {/* Loading / Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScrimCardSkeleton />
            <ScrimCardSkeleton />
            <ScrimCardSkeleton />
            <ScrimCardSkeleton />
          </div>
        ) : enrichedScrims.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto space-y-4 bg-[#0A0D18] border border-[#1E293B] p-8 shadow-2xl"
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
              <SwordsIcon className="w-6 h-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-black text-white uppercase tracking-wider">
                NO ACTIVE SCRIMS FOUND
              </h3>
              <p className="font-sans text-xs text-slate-400 leading-relaxed">
                There are currently no active scrim offers matching your filter. Click &quot;Post Scrim Offer&quot; to challenge collegiate opponents!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
