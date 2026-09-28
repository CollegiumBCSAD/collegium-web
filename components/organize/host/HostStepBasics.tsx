"use client";

import { HostStepProps } from "@/types";
import { hostGameFor } from "@/lib/hostTournament";
import { LockIcon } from "@/components/ui/Icons";

const NAME_LIMIT = 80;

// The title isn't chosen here: new tournaments are hosted for the game picked
// in the header switcher, and an existing tournament keeps its own game.
export default function HostStepBasics({ draft, onChange }: HostStepProps) {
  const game = hostGameFor(draft.gameTitle);

  return (
    <div className="space-y-6">
      <div className="relative h-20 overflow-hidden border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.art} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F1A] via-[#0B0F1A]/85 to-transparent" />
        <span aria-hidden className="absolute left-0 top-0 h-full w-1 bg-primary-brand" />
        <div className="relative h-full flex items-center justify-between gap-4 px-5">
          <div>
            <span className="block text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400">Hosting for</span>
            <span className="block font-display text-xl font-black uppercase text-white leading-tight">{game.label}</span>
          </div>
          <span className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-300 bg-black/50 backdrop-blur-md border border-white/15">
            <LockIcon className="w-3 h-3" />
            Set by game switcher
          </span>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="host-name" className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Tournament name
          </label>
          <span className="text-[10px] font-mono text-slate-600 tabular-nums">
            {draft.name.length}/{NAME_LIMIT}
          </span>
        </div>
        <input
          id="host-name"
          autoFocus
          maxLength={NAME_LIMIT}
          value={draft.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g. Philippine Collegiate Invitational — Season 2"
          className="w-full h-12 px-4 bg-black/40 border border-white/10 hover:border-white/20 focus:border-primary-brand focus:shadow-[0_0_0_3px_rgba(var(--game-glow-rgb),0.15)] text-white text-sm font-sans placeholder:text-slate-600 focus:outline-none transition-all"
        />
        <p className="mt-2 text-[11px] font-sans text-slate-500">
          This is what squads see on the public circuit. You can change it until an admin sanctions it.
        </p>
      </div>
    </div>
  );
}
