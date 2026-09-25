"use client";

import Link from "next/link";
import { SquadModeTabsProps } from "@/types";
import { PlusIcon, UsersIcon } from "@/components/ui/Icons";

const TABS = [
  { key: "create", href: "/team/create", label: "Create Squad", Icon: PlusIcon },
  { key: "join", href: "/team/join", label: "Join Squad", Icon: UsersIcon },
] as const;

// Create/Join switcher shared by both squad pages. The active tab is a
// rounded pill that sits inside the track (no clipped trapezoid). The close
// button is sized to the track: 44px tab + 2×4px padding + 2×1px border.
export default function SquadModeTabs({ active, onClose }: SquadModeTabsProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <nav aria-label="Squad mode" className="flex-1 grid grid-cols-2 gap-1 p-1 rounded-2xl bg-[#080C14] border border-[#1C2538]">
        {TABS.map(({ key, href, label, Icon }) => {
          const selected = key === active;
          return (
            <Link
              key={key}
              href={href}
              // Switching tabs replaces the history entry, so "close" (router.back)
              // leaves the squad screen in one step instead of replaying every tab.
              replace
              aria-current={selected ? "page" : undefined}
              className={`h-11 rounded-xl flex items-center justify-center gap-2 text-xs font-display uppercase tracking-wider transition-all ${
                selected
                  ? "bg-primary-brand text-[var(--game-btn-text,#fff)] font-black shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_-8px_rgba(var(--game-glow-rgb),0.8)]"
                  : "text-slate-400 font-bold hover:text-white hover:bg-[#141A29]"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onClose}
        title="Close window"
        aria-label="Close window"
        className="w-[54px] h-[54px] shrink-0 rounded-2xl border border-[#1C2538] bg-[#080C14] text-slate-400 flex items-center justify-center text-base font-bold transition-all hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-500/40 active:scale-95"
      >
        ✕
      </button>
    </div>
  );
}
