"use client";

import { useState } from "react";
import Image from "next/image";
import { coachService } from "@/services";
import { CoachCreateTeamFormProps, ServerGameTitle } from "@/types";
import { GAME_LIST, GAME_ID_TO_ENUM } from "@/lib/games";
import { useGame } from "@/context/GameContext";
import { RECESSED, BRAND_BTN } from "@/components/organize/surfaces";
import { PlusIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";

export default function CoachCreateTeamForm({ onCreated }: CoachCreateTeamFormProps) {
  const { selectedGame } = useGame();
  const [name, setName] = useState("");
  const [gameTitle, setGameTitle] = useState<ServerGameTitle>(
    (GAME_ID_TO_ENUM[selectedGame as keyof typeof GAME_ID_TO_ENUM] as ServerGameTitle) || "VALORANT",
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give the squad a name.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const team = await coachService.createTeam(name.trim(), gameTitle);
      setName("");
      onCreated(team);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not create the team.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <CoachPanel eyebrow="You're assigned as coach" title="Create a Squad" icon={<PlusIcon className="w-4 h-4" />}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Game title">
          {GAME_LIST.map((g) => {
            const value = GAME_ID_TO_ENUM[g.id] as ServerGameTitle;
            const active = value === gameTitle;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setGameTitle(value)}
                className={`relative h-16 overflow-hidden border text-left px-3 transition-all cursor-pointer ${active ? "" : "border-white/[0.08] opacity-60 hover:opacity-100"}`}
                style={active ? { borderColor: g.accentColor, boxShadow: `inset 0 0 0 1px ${g.accentColor}` } : undefined}
              >
                <Image src={g.image} alt="" fill sizes="160px" className="object-cover opacity-30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D16] to-transparent" />
                <span className="relative font-display text-sm font-black uppercase text-white">{g.shortName}</span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={name}
          maxLength={50}
          onChange={(e) => setName(e.target.value)}
          placeholder="Squad name, e.g. UMak Herons"
          className={`${RECESSED} w-full h-11 px-3 border border-white/[0.06] focus:border-primary-brand text-sm text-white font-sans focus:outline-none`}
        />
        <p className="text-[11px] font-sans text-slate-500">Names are unique per university and game. The first athlete to join becomes captain.</p>
        {error && <p className="text-xs font-sans text-rose-400">{error}</p>}
        <button type="submit" disabled={isSaving} className={`h-11 w-full text-xs font-mono font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 ${BRAND_BTN}`}>
          {isSaving ? "Creating..." : "Create Squad"}
        </button>
      </form>
    </CoachPanel>
  );
}
