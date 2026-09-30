"use client";

import { OrganizeTitleStripProps } from "@/types";
import { GAME_LIST, getGameInfo } from "@/lib/games";
import { pendingApplicationCount } from "@/lib/organize";
import { RAISED } from "./surfaces";

/**
 * Organizers run events in several titles at once. This strip summarizes the
 * whole workspace per title and switches the console between them.
 */
export default function OrganizeTitleStrip({ tournaments, activeGameId, onSelect }: OrganizeTitleStripProps) {
  return (
    <nav aria-label="Hosted titles" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {GAME_LIST.map((game) => {
        const hosted = tournaments.filter((t) => getGameInfo(t.gameTitle || t.game).id === game.id);
        const live = hosted.filter((t) => t.status === "LIVE").length;
        const waiting = hosted.reduce((sum, t) => sum + pendingApplicationCount(t), 0);
        const isActive = game.id === activeGameId;

        return (
          <button
            key={game.id}
            type="button"
            onClick={() => onSelect(game.id)}
            aria-current={isActive ? "page" : undefined}
            className={`relative text-left px-4 py-3 ${RAISED} transition-colors cursor-pointer ${
              isActive ? "" : "opacity-70 hover:opacity-100"
            }`}
            style={isActive ? { borderColor: game.accentColor } : undefined}
          >
            <span aria-hidden className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: game.accentColor }} />
            <span className="block font-display text-sm font-black uppercase text-white leading-tight">{game.shortName}</span>
            <span className="mt-1 block text-[10px] font-mono uppercase tracking-wider text-slate-400 tabular-nums">
              {hosted.length} hosted
              {live > 0 && <span className="text-emerald-400"> · {live} live</span>}
              {waiting > 0 && <span className="text-amber-400"> · {waiting} waiting</span>}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
