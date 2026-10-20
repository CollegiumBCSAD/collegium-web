import type { ReactNode } from "react";
import { TournamentScope, TournamentScopeToggleProps } from "@/types";
import { LockIcon, TrophyIcon } from "@/components/ui/Icons";

const OPTIONS: { id: TournamentScope; label: string; icon: ReactNode }[] = [
  { id: "CIRCUIT", label: "Circuit", icon: <TrophyIcon className="h-3.5 w-3.5" /> },
  { id: "INTRA", label: "Intra", icon: <LockIcon className="h-3.5 w-3.5" /> },
];

/** Switches the list between sanctioned circuit tournaments and intra (department) events. */
export default function TournamentScopeToggle({ scope, intraCount, onChange }: TournamentScopeToggleProps) {
  return (
    <div role="tablist" aria-label="Tournament type" className="flex rounded-xl border border-white/[0.07] bg-[#090C14] p-1">
      {OPTIONS.map((o) => {
        const active = scope === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`flex h-9 items-center gap-2 rounded-lg px-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
              active ? "bg-primary-brand text-[var(--game-btn-text,#fff)]" : "text-slate-400 hover:text-white"
            }`}
          >
            {o.icon}
            {o.label}
            {o.id === "INTRA" && (
              <span className={`rounded px-1.5 text-[9px] ${active ? "bg-black/25" : "bg-white/[0.06] text-slate-500"}`}>{intraCount}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
