"use client";

import Image from "next/image";
import { CoachTeamSwitcherProps } from "@/types";
import { getGameInfo } from "@/lib/games";
import { PlusIcon } from "@/components/ui/Icons";

// Squad picker: one card per team in its own game's key art and accent.
// Choosing a team also switches the site to that game's theme.
export default function CoachTeamSwitcher({ teams, activeTeamId, onSelect, isCreating, onToggleCreate }: CoachTeamSwitcherProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Your squads">
      {teams.map((team) => {
        const game = getGameInfo(team.gameTitle);
        const active = team.id === activeTeamId;
        const fill = Math.min(100, Math.round((team.members.length / team.max_roster_size) * 100));
        return (
          <button
            key={team.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(team)}
            className={`group relative snap-start shrink-0 w-56 h-28 overflow-hidden text-left border transition-all duration-300 cursor-pointer ${
              active ? "-translate-y-0.5" : "border-white/[0.08] opacity-70 hover:opacity-100 hover:-translate-y-0.5"
            }`}
            style={{
              clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
              borderColor: active ? game.accentColor : undefined,
              boxShadow: active ? `inset 0 0 0 1px ${game.accentColor}, 0 12px 30px -12px ${game.accentColor}` : undefined,
            }}
          >
            <Image src={game.image} alt="" fill sizes="224px" className="object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D16] via-[#0A0D16]/85 to-[#0A0D16]/30" />
            <span className="absolute left-0 inset-y-0 w-[3px]" style={{ backgroundColor: game.accentColor }} />

            <div className="relative h-full flex flex-col justify-between p-3.5 pl-4">
              <div className="min-w-0">
                <p className="text-[9px] font-mono font-black uppercase tracking-[0.2em]" style={{ color: game.accentColor }}>
                  {game.shortName}
                </p>
                <p className="font-display text-sm font-black uppercase tracking-wide text-white leading-tight line-clamp-2">{team.name}</p>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-mono uppercase text-slate-400">
                  <span>Roster</span>
                  <span className="text-white">{team.members.length}/{team.max_roster_size}</span>
                </div>
                <div className="h-1 bg-white/10 overflow-hidden">
                  <div className="h-full transition-all duration-500" style={{ width: `${fill}%`, backgroundColor: game.accentColor }} />
                </div>
              </div>
            </div>
            {team._count.members > 0 && (
              <span className="absolute top-2.5 right-3 min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-[10px] font-mono font-black text-black flex items-center justify-center" title="Pending join requests">
                {team._count.members}
              </span>
            )}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onToggleCreate}
        aria-pressed={isCreating}
        className={`group snap-start shrink-0 w-40 h-28 flex flex-col items-center justify-center gap-2 border border-dashed transition-colors cursor-pointer ${
          isCreating ? "border-primary-brand text-primary-brand bg-primary-brand/10" : "border-white/15 text-slate-400 hover:text-white hover:border-white/30"
        }`}
        style={{ clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" }}
      >
        <PlusIcon className={`w-5 h-5 transition-transform duration-300 ${isCreating ? "rotate-45" : "group-hover:rotate-90"}`} />
        <span className="text-[10px] font-mono font-black uppercase tracking-widest">{isCreating ? "Close" : "New Team"}</span>
      </button>
    </div>
  );
}
