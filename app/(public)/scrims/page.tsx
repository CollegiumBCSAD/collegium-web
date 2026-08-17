"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { GameId, ScrimOffer } from "@/types";
import { scrimsService } from "@/services";
import ScrimFilterBar from "@/components/scrims/ScrimFilterBar";
import ScrimCard from "@/components/scrims/ScrimCard";
import PostScrimModal from "@/components/scrims/PostScrimModal";

export default function ScrimsPage() {
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameId | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    scrimsService
      .getScrims(selectedGame !== "all" ? selectedGame : undefined)
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
  }, [selectedGame]);

  const filteredScrims = scrims;

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

    setTimeout(() => scrimsService.getScrims(selectedGame !== "all" ? selectedGame : undefined).then(setScrims), 1000);
  };

  const handleAcceptScrim = async (id: string) => {
    try {
      await scrimsService.acceptScrim(id, { opponentId: user?.id || "" });
      const data = await scrimsService.getScrims(selectedGame !== "all" ? selectedGame : undefined);
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
            <span className="text-xs font-sans font-extrabold uppercase tracking-widest text-secondary-brand block mb-1">
              Gankster-Style Scrim Finder
            </span>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground">
              Inter-University Scrim Board
            </h1>
            <p className="font-sans text-xs text-secondary-text mt-1">
              Find verified collegiate opponents for practice matches and tournament warm-ups
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="h-11 px-6 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-lg"
          >
            ⚔️ Post Scrim Offer
          </button>
        </div>

        <ScrimFilterBar
          selectedGame={selectedGame}
          onSelectGame={setSelectedGame}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-8 h-8 border-4 border-primary-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-sans font-semibold text-secondary-text tracking-wider uppercase">
              Loading inter-university scrim offers...
            </p>
          </div>
        ) : filteredScrims.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-md mx-auto space-y-4 rounded-2xl border border-panel-border bg-card-bg/60 p-8 shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-raised-panel border border-panel-border flex items-center justify-center text-3xl shadow-inner">
              ⚔️
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-foreground uppercase tracking-wide">
                NO OPEN SCRIMS FOUND
              </h3>
              <p className="font-sans text-xs text-secondary-text leading-relaxed">
                There are currently no active scrim offers listed for this title. Post a new scrim offer to challenge collegiate opponents!
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
