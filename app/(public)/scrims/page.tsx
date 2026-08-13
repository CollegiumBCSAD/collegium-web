"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { GAME_LIST, GameId, GAMES } from "@/lib/games";

interface ScrimOffer {
  id: string;
  hostTeamName: string;
  universityName: string;
  gameTitle: GameId;
  format: string;
  rankRange: string;
  scheduledAt: string;
  notes?: string;
  status: "OPEN" | "CONFIRMED" | "CANCELLED";
  opponentTeamName?: string;
}

export default function ScrimsPage() {
  const { user, isLoggedIn } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameId | "all">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrims, setScrims] = useState<ScrimOffer[]>([
    {
      id: "scrim-1",
      hostTeamName: "UMAK Herons Alpha",
      universityName: "University of Makati",
      gameTitle: "valo",
      format: "BO3",
      rankRange: "Diamond / Ascendant",
      scheduledAt: "2026-08-14T19:00:00.000Z",
      notes: "Need high communications squad for tournament warm-up.",
      status: "OPEN",
    },
    {
      id: "scrim-2",
      hostTeamName: "UST Growling Tigers",
      universityName: "University of Santo Tomas",
      gameTitle: "lol",
      format: "BO1",
      rankRange: "Master / Challenger",
      scheduledAt: "2026-08-14T20:30:00.000Z",
      notes: "Looking for competitive 5v5 draft practice.",
      status: "OPEN",
    },
    {
      id: "scrim-3",
      hostTeamName: "DLSU Animo Esports",
      universityName: "De La Salle University",
      gameTitle: "ml",
      format: "BO3",
      rankRange: "Mythic Glory",
      scheduledAt: "2026-08-15T18:00:00.000Z",
      notes: "UAAP circuit prep.",
      status: "OPEN",
    },
  ]);

  const [formGame, setFormGame] = useState<GameId>("valo");
  const [formTeamName, setFormTeamName] = useState("");
  const [formFormat, setFormFormat] = useState("BO3");
  const [formRank, setFormRank] = useState("Ascendant+");
  const [formNotes, setFormNotes] = useState("");

  const filteredScrims = scrims.filter(
    (s) => selectedGame === "all" || s.gameTitle === selectedGame
  );

  const handlePostScrim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeamName.trim()) return;

    const newScrim: ScrimOffer = {
      id: `scrim-${Date.now()}`,
      hostTeamName: formTeamName.trim(),
      universityName: user?.university?.name || "University of Makati",
      gameTitle: formGame,
      format: formFormat,
      rankRange: formRank,
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      notes: formNotes,
      status: "OPEN",
    };

    setScrims([newScrim, ...scrims]);
    setIsModalOpen(false);
    setFormTeamName("");
    setFormNotes("");
  };

  const handleAcceptScrim = (id: string) => {
    setScrims(
      scrims.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "CONFIRMED",
              opponentTeamName: user ? `${user.university.name.split(" ")[0]} Squad` : "Challenger Squad",
            }
          : s
      )
    );
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

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGame("all")}
            className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              selectedGame === "all"
                ? "bg-primary-brand text-foreground"
                : "bg-card-bg border border-raised-panel text-secondary-text hover:text-foreground"
            }`}
          >
            All Titles
          </button>
          {GAME_LIST.map((game) => (
            <button
              key={game.id}
              onClick={() => setSelectedGame(game.id)}
              className={`px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                selectedGame === game.id
                  ? `${game.borderColor} border-2 bg-card-bg text-foreground`
                  : "bg-card-bg border border-raised-panel text-secondary-text hover:text-foreground"
              }`}
            >
              <img src={game.image} alt={game.name} className="w-4 h-4 rounded object-cover" />
              <span>{game.shortName}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScrims.map((scrim) => {
            const game = GAMES[scrim.gameTitle];
            return (
              <div
                key={scrim.id}
                className="p-6 rounded-2xl bg-card-bg border border-raised-panel space-y-4 hover:border-primary-brand/50 transition-all shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img src={game.image} alt={game.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-secondary-brand block">
                        {scrim.universityName}
                      </span>
                      <h3 className="font-display text-lg font-bold uppercase text-foreground">
                        {scrim.hostTeamName}
                      </h3>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-sans font-bold uppercase px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: game.accentColor }}
                  >
                    {game.shortName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-background border border-panel-border text-center">
                  <div>
                    <span className="text-[9px] font-sans text-secondary-text uppercase block">Format</span>
                    <span className="text-xs font-sans font-bold text-foreground">{scrim.format}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-sans text-secondary-text uppercase block">Rank Tier</span>
                    <span className="text-xs font-sans font-bold text-foreground">{scrim.rankRange}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-sans text-secondary-text uppercase block">Scheduled</span>
                    <span className="text-xs font-sans font-bold text-success">
                      {new Date(scrim.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>

                {scrim.notes && (
                  <p className="text-xs font-sans text-secondary-text bg-background/50 p-2.5 rounded-lg border border-panel-border">
                    "{scrim.notes}"
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between">
                  {scrim.status === "CONFIRMED" ? (
                    <div className="w-full p-2.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-sans font-bold text-center">
                      ✓ Match Booked vs {scrim.opponentTeamName}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAcceptScrim(scrim.id)}
                      className="w-full h-10 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground font-sans text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md shadow-primary-brand/20"
                    >
                      Accept Scrim Offer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-raised-panel pb-3">
                <h3 className="font-display text-lg font-bold uppercase text-foreground">
                  Post Scrim Offer
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-secondary-text hover:text-foreground text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePostScrim} className="space-y-4">
                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    Esports Title
                  </label>
                  <select
                    value={formGame}
                    onChange={(e) => setFormGame(e.target.value as GameId)}
                    className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                  >
                    {GAME_LIST.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    Host Squad Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formTeamName}
                    onChange={(e) => setFormTeamName(e.target.value)}
                    placeholder="e.g. UMAK Herons Alpha"
                    className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border text-foreground text-sm font-sans focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                      Format
                    </label>
                    <input
                      type="text"
                      value={formFormat}
                      onChange={(e) => setFormFormat(e.target.value)}
                      placeholder="BO1 / BO3 / BO5"
                      className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                      Target Rank
                    </label>
                    <input
                      type="text"
                      value={formRank}
                      onChange={(e) => setFormRank(e.target.value)}
                      placeholder="e.g. Ascendant+"
                      className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
                    Notes / Rules
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Map veto preferences or warm-up objectives..."
                    className="w-full p-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="h-10 px-4 rounded-lg border border-raised-panel text-secondary-text hover:text-foreground text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-lg bg-gradient-to-r from-[#E53A4C] to-[#B91C1C] hover:from-[#EF4444] hover:to-[#991B1B] text-foreground text-xs font-bold uppercase transition-all active:scale-[0.98] shadow-md shadow-primary-brand/20 cursor-pointer"
                  >
                    Publish Scrim Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
