"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { useNotifications } from "@/context/NotificationContext";
import { GameId, ScrimOffer } from "@/types";
import { scrimsService } from "@/services";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import ScrimCard from "@/components/scrims/ScrimCard";
import PostScrimModal from "@/components/scrims/PostScrimModal";
import ScrimWarRoomModal from "@/components/scrims/ScrimWarRoomModal";

export default function ScrimsPage() {
  const { user } = useAuth();
  const { selectedGame: globalGame, selectedGameInfo } = useGame();
  const { addNotification, syncScrimState } = useNotifications();
  const activeGame: GameId = globalGame || "valo";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWarRoomScrim, setActiveWarRoomScrim] = useState<ScrimOffer | null>(null);
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>(() => getStoredTeams());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamsApi().then((teams) => setUserTeams(teams));
  }, []);

  const myTeams = useMemo(() => {
    if (!user) return [];
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    return userTeams.filter((t: Team) =>
      (myId && t.captainId === myId) ||
      (myName && t.captainName && t.captainName.toLowerCase().trim() === myName) ||
      t.members.some(
        (m) =>
          m.status === "ACCEPTED" &&
          ((myId && m.userId === myId) ||
           (myEmail && m.email && m.email.toLowerCase().trim() === myEmail) ||
           (myName && m.displayName && m.displayName.toLowerCase().trim() === myName))
      )
    );
  }, [user, userTeams]);

  const isUserHost = useCallback(
    (scrim: ScrimOffer) => {
      if (!user) return false;
      const myTeamIds = myTeams.map((t: Team) => t.id);
      const myTeamNames = myTeams.map((t: Team) => t.name.toLowerCase().trim());

      if (scrim.teamId && myTeamIds.includes(scrim.teamId)) return true;
      if (scrim.hostTeamName && myTeamNames.includes(scrim.hostTeamName.toLowerCase().trim())) return true;
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
      
      // Fallback: If status is CONFIRMED or PENDING, and user is not host, this user is the challenger!
      if (scrim.status === "CONFIRMED" || scrim.status === "PENDING") return true;

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
            syncScrimState(
              list,
              isUserHost,
              isUserOpponent,
              myTeams.map((t: Team) => t.name)
            );
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
  }, [activeGame, isUserHost, isUserOpponent, myTeams, syncScrimState]);

  const filteredScrims = useMemo(() => {
    return scrims.filter((s) => {
      // Cancelled scrims are only visible to the host captain who posted them
      if (s.status === "CANCELLED" && !isUserHost(s)) return false;

      if (!s.gameTitle) return true;
      const title = s.gameTitle.toLowerCase();
      if (activeGame === "valo") return title.includes("val");
      if (activeGame === "lol") return title.includes("lol") || title.includes("league");
      if (activeGame === "codm") return title.includes("cod") || title.includes("call");
      if (activeGame === "ml") return title.includes("ml") || title.includes("mobile");
      return true;
    });
  }, [scrims, activeGame, isUserHost]);

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

  const handleConfirmBooking = async (id: string) => {
    setScrimError("");
    try {
      await scrimsService.confirmScrim(id);
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
      syncScrimState(
        data,
        isUserHost,
        isUserOpponent,
        myTeams.map((t: Team) => t.name)
      );
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setScrimError(errorObj?.response?.data?.message || errorObj?.message || "Failed to confirm booking.");
    }
  };

  const handleAcceptScrim = async (id: string) => {
    setScrimError("");
    const targetScrim = scrims.find((s) => s.id === id);
    if (targetScrim && isUserHost(targetScrim)) {
      setScrimError("You cannot book a scrim offer posted by your own team.");
      return;
    }

    const myTeam = myTeams.find((t: Team) => t.gameTitle === activeGame) || myTeams[0];
    const opponentTeamId = myTeam?.id || user?.id || "";

    if (!opponentTeamId) {
      setScrimError("Please log in and join a university squad before booking scrim matches.");
      return;
    }

    try {
      await scrimsService.acceptScrim(id, { opponentId: opponentTeamId });
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
      syncScrimState(
        data,
        isUserHost,
        isUserOpponent,
        myTeams.map((t: Team) => t.name)
      );
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      setScrimError(errorObj?.response?.data?.message || errorObj?.message || "Failed to book scrim match.");
    }
  };

  const handleCancelScrim = async (id: string) => {
    try {
      await scrimsService.cancelScrim(id);
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
      syncScrimState(
        data,
        isUserHost,
        isUserOpponent,
        myTeams.map((t: Team) => t.name)
      );
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

  return (
    <div className="flex flex-col flex-1 game-theme-bg py-10 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-raised-panel pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand">
                Gankster-Style Scrim Finder
              </span>
              {selectedGameInfo && (
                <span
                  className="text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: selectedGameInfo.accentColor, color: selectedGameInfo.id === "codm" ? "#0A0C10" : "#FFFFFF" }}
                >
                  {selectedGameInfo.shortName}
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
              Inter-University Scrim Board
            </h1>
            <p className="font-sans text-xs text-secondary-text mt-1">
              Find verified collegiate opponents for {selectedGameInfo?.name || "Valorant"} practice matches and tournament warm-ups
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-lg"
          >
            ⚔️ Post Scrim Offer
          </button>
        </div>

        {bookedScrims.length > 0 && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-success/20 via-emerald-950/40 to-success/10 border border-success/50 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                    You Have {bookedScrims.length} Booked Practice Scrim{bookedScrims.length > 1 ? "s" : ""}!
                  </h3>
                  <p className="text-xs font-sans text-secondary-text">
                    An opponent has booked your practice scrim match offer. Prepare your 5-man varsity squad!
                  </p>
                </div>
              </div>
              <span className="text-xs font-sans font-bold px-3 py-1 rounded-full bg-success/20 text-success border border-success/40 uppercase tracking-wider">
                🟢 MATCH BOOKED
              </span>
            </div>
          </div>
        )}

        {scrimError && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-sans font-semibold flex items-center justify-between">
            <span>⚠️ {scrimError}</span>
            <button onClick={() => setScrimError("")} className="hover:underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-8 h-8 border-4 border-primary-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-sans font-semibold text-secondary-text tracking-wider uppercase">
              Loading {selectedGameInfo?.shortName || "esports"} scrim offers...
            </p>
          </div>
        ) : filteredScrims.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto space-y-4 rounded-2xl border border-panel-border bg-card-bg/60 p-8 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-raised-panel border border-panel-border flex items-center justify-center text-3xl shadow-inner">
              ⚔️
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
                NO OPEN SCRIMS FOUND FOR {selectedGameInfo?.shortName || "THIS TITLE"}
              </h3>
              <p className="font-sans text-xs text-secondary-text leading-relaxed">
                There are currently no active scrim offers listed for {selectedGameInfo?.name || "this game"}. Click &quot;Post Scrim Offer&quot; to challenge collegiate opponents!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScrims.map((scrim) => (
              <ScrimCard
                key={scrim.id}
                scrim={scrim}
                onAccept={handleAcceptScrim}
                onConfirmBooking={handleConfirmBooking}
                onCancel={handleCancelScrim}
                onDelete={handleDeleteScrim}
                onOpenWarRoom={(s) => setActiveWarRoomScrim(s)}
                isHost={isUserHost(scrim)}
                isOpponent={isUserOpponent(scrim)}
              />
            ))}
          </div>
        )}

        <PostScrimModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handlePostScrimSubmit}
        />

        <ScrimWarRoomModal
          scrim={activeWarRoomScrim}
          isOpen={!!activeWarRoomScrim}
          onClose={() => setActiveWarRoomScrim(null)}
          isHost={activeWarRoomScrim ? isUserHost(activeWarRoomScrim) : false}
        />
      </div>
    </div>
  );
}
