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
          setScrims(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
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
    hostTeamName: string;
    format: string;
    rankRange: string;
    notes: string;
  }) => {
    const optimistic: ScrimOffer = {
      id: `scrim-${Date.now()}`,
      hostTeamName: data.hostTeamName,
      universityName: user?.university?.name || "",
      gameTitle: data.gameTitle,
      format: data.format,
      rankRange: data.rankRange,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      notes: data.notes,
      status: "OPEN",
    };
    setScrims((prev) => [optimistic, ...prev]);

    // Fire API call (best effort)
    try {
      await scrimsService.createScrim({
        teamId: "optimistic-team-id", // Not in UI yet
        gameTitle: data.gameTitle,
        format: data.format,
        rankRange: data.rankRange,
        scheduledAt: optimistic.scheduledAt,
        notes: data.notes,
      });
    } catch {
      // Ignore error for optimistic update
    }

    setTimeout(() => scrimsService.getScrims(selectedGame !== "all" ? selectedGame : undefined).then(setScrims), 1000);
  };

  const handleAcceptScrim = async (id: string) => {
    try {
      await scrimsService.acceptScrim(id, { opponentId: user?.id || "" });
      const data = await scrimsService.getScrims(selectedGame !== "all" ? selectedGame : undefined); setScrims(data);
    } catch {
      setScrims((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, status: "CONFIRMED" as const, opponentTeamName: user?.displayName } : s
        )
      );
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b md:bg-gradient-to-r from-[#CC0000]/20 from-0% to-[#0A0C10] to-[50%] md:to-[40%] py-10 px-4 sm:px-6 lg:px-10">
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
            className="h-11 px-6 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-lg shadow-primary-brand/20"
          >
            ⚔️ Post Scrim Offer
          </button>
        </div>

        <ScrimFilterBar
          selectedGame={selectedGame}
          onSelectGame={setSelectedGame}
        />

        {isLoading ? (
          <div className="text-center py-12 text-xs font-sans text-secondary-text">
            Loading inter-university scrim offers...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScrims.map((scrim) => (
              <ScrimCard
                key={scrim.id}
                scrim={scrim}
                onAccept={handleAcceptScrim}
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
