"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { GameId, ScrimOffer } from "@/types";
import { scrimsService } from "@/services";
import ScrimCard from "@/components/scrims/ScrimCard";
import PostScrimModal from "@/components/scrims/PostScrimModal";

export default function ScrimsPage() {
  const { user } = useAuth();
  const { selectedGame: globalGame, selectedGameInfo } = useGame();
  const activeGame: GameId = globalGame || "valo";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    scrimsService
      .getScrims(activeGame)
      .then((data) => {
        if (isMounted) {
          setScrims(Array.isArray(data) ? data : []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setScrims([]);
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [activeGame]);

  const filteredScrims = scrims.filter((s) => {
    if (!s.gameTitle) return true;
    const title = s.gameTitle.toLowerCase();
    if (activeGame === "valo") return title.includes("val");
    if (activeGame === "lol") return title.includes("lol") || title.includes("league");
    if (activeGame === "codm") return title.includes("cod") || title.includes("call");
    if (activeGame === "ml") return title.includes("ml") || title.includes("mobile");
    return true;
  });

  const handlePostScrimSubmit = async (data: {
    gameTitle: GameId;
    teamId?: string;
    hostTeamName: string;
    format: string;
    rankRange: string;
    mapPreference?: string;
    notes: string;
  }) => {
    const optimistic: ScrimOffer = {
      id: `scrim-${Date.now()}`,
      teamId: data.teamId,
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
        teamId: data.teamId || "default-team-id",
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

  const handleAcceptScrim = async (id: string) => {
    try {
      await scrimsService.acceptScrim(id, { opponentId: user?.id || "" });
      const data = await scrimsService.getScrims(activeGame);
      setScrims(data);
    } catch {
      setScrims((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "CONFIRMED" as const, opponentTeamName: user?.displayName } : s
        )
      );
    }
  };

  const handleCancelScrim = async (id: string) => {
    try {
      await scrimsService.cancelScrim(id);
    } catch {
      // Local action
    }
    setScrims((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "CANCELLED" as const } : s))
    );
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
                onCancel={handleCancelScrim}
                isHost={scrim.universityName === user?.university?.name || Boolean(scrim.hostTeamName?.toLowerCase().includes("herons"))}
              />
            ))}
          </div>
        )}

        <PostScrimModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handlePostScrimSubmit}
        />
      </div>
    </div>
  );
}
