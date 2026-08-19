"use client";

import React, { useState, useMemo, useEffect } from "react";
import { GAME_LIST } from "@/lib/games";
import { GameId } from "@/types";
import { getStoredTeams, fetchTeamsApi, Team } from "@/lib/teams";
import { useAuth } from "@/context/AuthContext";

interface PostScrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultGame?: GameId;
  onSubmit: (data: {
    gameTitle: GameId;
    teamId?: string;
    hostTeamName: string;
    format: string;
    rankRange: string;
    mapPreference?: string;
    notes: string;
  }) => void;
}

const GAME_MAP_OPTIONS: Record<GameId, string[]> = {
  valo: ["Ascent", "Haven", "Split", "Bind", "Sunset", "Lotus", "Pearl", "Icebox", "Abyss"],
  lol: ["Summoner's Rift", "Howling Abyss"],
  codm: ["Standoff", "Crash", "Firing Range", "Raid", "Summit", "Takeoff", "Slums"],
  ml: ["Imperial Sanctuary", "Celestial Palace", "Western Expanse"],
};

export default function PostScrimModal({
  isOpen,
  onClose,
  defaultGame = "valo",
  onSubmit,
}: PostScrimModalProps) {
  const { user } = useAuth();
  const [allTeams, setAllTeams] = useState<Team[]>(() => getStoredTeams());

  useEffect(() => {
    fetchTeamsApi().then((teams) => {
      setAllTeams(teams);
    });
  }, []);

  const userTeams = useMemo(() => {
    if (!user) return [];
    const myId = user.id;
    const myEmail = user.email ? user.email.toLowerCase().trim() : "";
    const myName = user.displayName ? user.displayName.toLowerCase().trim() : "";

    return allTeams.filter((t) =>
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
  }, [user, allTeams]);

  const [formGame, setFormGame] = useState<GameId>(defaultGame);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [formTeamName, setFormTeamName] = useState<string>("");
  const [formFormat, setFormFormat] = useState("BO3");
  const [formRank, setFormRank] = useState("Ascendant+");
  const [formMap, setFormMap] = useState("Ascent");
  const [formNotes, setFormNotes] = useState("");

  // Sync formGame and formMap when defaultGame or isOpen changes
  useEffect(() => {
    if (isOpen) {
      setFormGame(defaultGame);
      const maps = GAME_MAP_OPTIONS[defaultGame] || GAME_MAP_OPTIONS.valo;
      setFormMap(maps[0]);
    }
  }, [isOpen, defaultGame]);

  const userTeamsForGame = useMemo(() => {
    const matching = userTeams.filter((t) => t.gameTitle === formGame);
    return matching.length > 0 ? matching : userTeams;
  }, [userTeams, formGame]);

  useEffect(() => {
    if (userTeamsForGame.length > 0) {
      if (!selectedTeamId || !userTeamsForGame.some((t) => t.id === selectedTeamId)) {
        setSelectedTeamId(userTeamsForGame[0].id);
        setFormTeamName(userTeamsForGame[0].name);
      }
    } else if (!formTeamName) {
      setFormTeamName(
        user?.university?.name ? `${user.university.name} Varsity` : `${user?.displayName || "Varsity"} Squad`
      );
    }
  }, [userTeamsForGame, user, selectedTeamId, formTeamName]);

  const handleGameChange = (game: GameId) => {
    setFormGame(game);
    const maps = GAME_MAP_OPTIONS[game] || GAME_MAP_OPTIONS.valo;
    setFormMap(maps[0]);

    const matchingTeam = userTeams.find((t) => t.gameTitle === game);
    if (matchingTeam) {
      setSelectedTeamId(matchingTeam.id);
      setFormTeamName(matchingTeam.name);
    } else if (userTeams.length > 0) {
      setSelectedTeamId(userTeams[0].id);
      setFormTeamName(userTeams[0].name);
    } else {
      setSelectedTeamId("");
      setFormTeamName(
        user?.university?.name ? `${user.university.name} Varsity` : `${user?.displayName || "Varsity"} Squad`
      );
    }
  };

  // Modal lifecycle listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    const found = userTeamsForGame.find((t) => t.id === teamId);
    if (found) {
      setFormTeamName(found.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeamName.trim()) return;

    onSubmit({
      gameTitle: formGame,
      teamId: selectedTeamId || undefined,
      hostTeamName: formTeamName.trim(),
      format: formFormat,
      rankRange: formRank,
      mapPreference: formMap,
      notes: formNotes,
    });

    setFormNotes("");
    onClose();
  };

  const currentMapOptions = GAME_MAP_OPTIONS[formGame] || GAME_MAP_OPTIONS.valo;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-card-bg border border-raised-panel rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-raised-panel pb-3">
          <h3 className="font-display text-lg font-bold uppercase text-foreground">
            Post Scrim Offer
          </h3>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="text-secondary-text hover:text-foreground text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
              Esports Title
            </label>
            <select
              value={formGame}
              onChange={(e) => handleGameChange(e.target.value as GameId)}
              className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none cursor-pointer"
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
              Host Squad / Team
            </label>
            {userTeamsForGame.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none cursor-pointer"
              >
                {userTeamsForGame.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.universityName})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                value={formTeamName}
                onChange={(e) => setFormTeamName(e.target.value)}
                placeholder="e.g. UMAK Herons Alpha"
                className="w-full h-11 px-4 rounded-lg bg-background border border-panel-border text-foreground text-sm font-sans focus:outline-none"
              />
            )}
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
              Map Preference
            </label>
            <select
              value={formMap}
              onChange={(e) => setFormMap(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-background border border-panel-border text-foreground text-xs font-sans focus:outline-none cursor-pointer"
            >
              {currentMapOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
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
              onClick={onClose}
              className="h-10 px-4 rounded-lg border border-raised-panel text-secondary-text hover:text-foreground text-xs font-bold uppercase cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-6 rounded-lg game-theme-btn font-sans text-xs font-bold uppercase transition-all active:scale-[0.98] shadow-md shadow-primary-brand/20 cursor-pointer"
            >
              Publish Scrim Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
