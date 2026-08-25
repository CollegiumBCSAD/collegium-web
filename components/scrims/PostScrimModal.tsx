"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getGameInfo } from "@/lib/games";
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
    scheduledAt: string;
    notes: string;
  }) => void;
}

const GAME_MAP_OPTIONS: Record<GameId, string[]> = {
  valo: ["Ascent", "Haven", "Split", "Bind", "Sunset", "Lotus", "Pearl", "Icebox", "Abyss"],
  lol: ["Summoner's Rift", "Howling Abyss"],
  codm: ["Standoff", "Crash", "Firing Range", "Raid", "Summit", "Takeoff", "Slums"],
  ml: ["Imperial Sanctuary", "Celestial Palace", "Western Expanse"],
};

const GAME_RANK_OPTIONS: Record<GameId, string[]> = {
  valo: ["Ascendant+", "Immortal / Radiant", "Diamond+", "Platinum+", "Gold+", "Open / Any Tier"],
  lol: ["Master / Challenger", "Diamond+", "Emerald+", "Platinum+", "Gold+", "Open / Any Tier"],
  codm: ["Legendary", "Grandmaster+", "Master+", "Pro+", "Open / Any Tier"],
  ml: ["Mythical Immortal", "Mythical Glory", "Mythic+", "Legend+", "Epic+", "Open / Any Tier"],
};

export default function PostScrimModal({
  isOpen,
  onClose,
  defaultGame = "valo",
  onSubmit,
}: PostScrimModalProps) {
  const { user } = useAuth();
  const [allTeams, setAllTeams] = useState<Team[]>(() => getStoredTeams());
  const gameInfo = useMemo(() => getGameInfo(defaultGame), [defaultGame]);

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

  const [manualTeamId, setManualTeamId] = useState<string>("");
  const [manualTeamName, setManualTeamName] = useState<string>("");
  const [formFormat, setFormFormat] = useState("BO3");
  const [formRank, setFormRank] = useState(() => (GAME_RANK_OPTIONS[defaultGame] || GAME_RANK_OPTIONS.valo)[0]);
  const [formMap, setFormMap] = useState(() => (GAME_MAP_OPTIONS[defaultGame] || GAME_MAP_OPTIONS.valo)[0]);
  
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [formDate, setFormDate] = useState(todayStr);
  const [formTime, setFormTime] = useState("14:00");
  const [formNotes, setFormNotes] = useState("");

  // Reset the form defaults each time the modal is (re)opened
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFormMap((GAME_MAP_OPTIONS[defaultGame] || GAME_MAP_OPTIONS.valo)[0]);
      setFormRank((GAME_RANK_OPTIONS[defaultGame] || GAME_RANK_OPTIONS.valo)[0]);
    }
  }

  const userTeamsForGame = useMemo(() => {
    const matching = userTeams.filter((t) => t.gameTitle === defaultGame);
    return matching.length > 0 ? matching : userTeams;
  }, [userTeams, defaultGame]);

  const selectedTeamId =
    manualTeamId && userTeamsForGame.some((t) => t.id === manualTeamId)
      ? manualTeamId
      : userTeamsForGame[0]?.id ?? "";

  const defaultTeamName = user?.university?.name
    ? `${user.university.name} Varsity`
    : `${user?.displayName || "Varsity"} Squad`;

  const formTeamName =
    userTeamsForGame.length > 0
      ? userTeamsForGame.find((t) => t.id === selectedTeamId)?.name ?? ""
      : manualTeamName || defaultTeamName;

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
    setManualTeamId(teamId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTeamName.trim()) return;

    let scheduledIso = new Date().toISOString();
    if (formDate && formTime) {
      const parsed = new Date(`${formDate}T${formTime}`);
      if (!isNaN(parsed.getTime())) {
        scheduledIso = parsed.toISOString();
      }
    }

    onSubmit({
      gameTitle: defaultGame,
      teamId: selectedTeamId || undefined,
      hostTeamName: formTeamName.trim(),
      format: formFormat,
      rankRange: formRank,
      mapPreference: formMap,
      scheduledAt: scheduledIso,
      notes: formNotes,
    });

    setFormNotes("");
    onClose();
  };

  const currentMapOptions = GAME_MAP_OPTIONS[defaultGame] || GAME_MAP_OPTIONS.valo;
  const currentRankOptions = GAME_RANK_OPTIONS[defaultGame] || GAME_RANK_OPTIONS.valo;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="w-full max-w-md bg-[#0D121F]/98 border border-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-primary-brand" />

        <div className="flex items-center justify-between border-b border-[#1C2538] pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary-brand block">
              {"// VARSITY MATCHMAKING"}
            </span>
            <h3 className="font-display text-lg font-black uppercase text-white">
              Post Scrim Offer
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="w-7 h-7 rounded-full bg-[#141A29] border border-[#232D44] text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Locked Current Game Badge */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Esports Title
            </label>
            <div className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={gameInfo.image}
                  alt={gameInfo.name}
                  className="w-6 h-6 rounded-md object-cover border border-[#1E293B]"
                />
                <span className="font-display text-xs font-black uppercase text-white tracking-wider">
                  {gameInfo.name}
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-primary-brand/10 text-primary-brand border border-primary-brand/30">
                ACTIVE GAME
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Host Squad / Team
            </label>
            {userTeamsForGame.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none cursor-pointer"
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
                onChange={(e) => setManualTeamName(e.target.value)}
                placeholder="e.g. UMAK Herons Alpha"
                className="w-full h-11 px-4 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-sm font-sans focus:border-primary-brand focus:outline-none"
              />
            )}
          </div>

          {/* Schedule Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Match Date
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Match Time
              </label>
              <input
                type="time"
                required
                value={formTime}
                onChange={(e) => setFormTime(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Format
              </label>
              <select
                value={formFormat}
                onChange={(e) => setFormFormat(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none cursor-pointer"
              >
                <option value="BO1">BO1 (Best of 1)</option>
                <option value="BO3">BO3 (Best of 3)</option>
                <option value="BO5">BO5 (Best of 5)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Rank
              </label>
              <select
                value={formRank}
                onChange={(e) => setFormRank(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none cursor-pointer"
              >
                {currentRankOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Map Preference
            </label>
            <select
              value={formMap}
              onChange={(e) => setFormMap(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none cursor-pointer"
            >
              {currentMapOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
              Notes / Rules
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Map veto preferences or warm-up objectives..."
              className="w-full p-3 rounded-xl bg-[#080C14] border border-[#1C2538] text-white text-xs font-mono focus:border-primary-brand focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl bg-[#141A29] text-slate-300 hover:text-white border border-[#232D44] text-xs font-mono font-bold uppercase cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-xl game-theme-btn font-mono text-xs font-black uppercase tracking-wider transition-all active:scale-[0.98] shadow-md cursor-pointer"
            >
              Publish Scrim Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
