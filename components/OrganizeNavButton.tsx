"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGame } from "@/context/GameContext";
import { tournamentsService } from "@/services/tournamentsService";
import { OrganizeNavButtonProps } from "@/types";
import { GAMES, getGameInfo } from "@/lib/games";
import { buildActionQueue } from "@/lib/organize";
import { LayoutGridIcon } from "@/components/ui/Icons";

// Organizer-only entry to their workspace. Lives with the personal controls
// (game, notifications, profile) rather than among the public page links, and
// carries a badge of open to-dos for the selected game, like the bell does.
export default function OrganizeNavButton({ variant = "bar", onNavigate }: OrganizeNavButtonProps) {
  const { user } = useAuth();
  const { selectedGame } = useGame();
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState(0);

  const isOrganizer = user?.role === "ORGANIZER";
  const gameId = (GAMES[selectedGame as keyof typeof GAMES] || GAMES.valo).id;

  // Refresh on navigation so the count drops after acting on Organize.
  useEffect(() => {
    if (!isOrganizer) return;
    let cancelled = false;
    tournamentsService
      .getMyTournaments()
      .then((all) => {
        if (cancelled) return;
        const forGame = all.filter((t) => getGameInfo(t.gameTitle || t.game).id === gameId);
        setOpenItems(buildActionQueue(forGame).length);
      })
      .catch(() => !cancelled && setOpenItems(0));
    return () => {
      cancelled = true;
    };
  }, [isOrganizer, gameId, pathname]);

  if (!isOrganizer) return null;

  const active = pathname.startsWith("/organize");
  const badge = openItems > 0 && (
    <span
      className={`min-w-5 h-5 px-1 flex items-center justify-center rounded-full text-[10px] font-mono font-black tabular-nums ${
        active ? "bg-black/25 text-current" : "bg-primary-brand text-[var(--game-btn-text,#fff)]"
      }`}
      aria-label={`${openItems} items need attention`}
    >
      {openItems}
    </span>
  );

  if (variant === "menu") {
    return (
      <Link
        href="/organize"
        onClick={onNavigate}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
          active ? "border-primary-brand bg-primary-brand/15" : "border-primary-brand/30 bg-primary-brand/5 hover:bg-primary-brand/10"
        }`}
      >
        <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-brand text-[var(--game-btn-text,#fff)]">
          <LayoutGridIcon />
        </span>
        <span className="flex-1">
          <span className="block font-display text-sm font-black uppercase tracking-wider text-white">Organize</span>
          <span className="block text-[10px] font-mono text-slate-400">Your tournament workspace</span>
        </span>
        {badge}
      </Link>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-2.5 sm:gap-3.5">
      <Link
        href="/organize"
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 h-9 pl-3 pr-2.5 rounded-xl border font-display text-xs font-black uppercase tracking-wider transition-all duration-200 ${
          active
            ? "bg-primary-brand border-primary-brand text-[var(--game-btn-text,#fff)] shadow-[0_0_18px_-4px_rgba(var(--game-glow-rgb),0.8)]"
            : "bg-primary-brand/10 border-primary-brand/40 text-white hover:bg-primary-brand/20 hover:border-primary-brand/70"
        } ${openItems > 0 ? "" : "pr-3.5"}`}
      >
        <LayoutGridIcon className="w-3.5 h-3.5" />
        Organize
        {badge}
      </Link>
      <span aria-hidden className="w-px h-6 bg-[#1E293B]" />
    </div>
  );
}
