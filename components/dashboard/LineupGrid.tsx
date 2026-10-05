"use client";

import { LineupGridProps, LineupSlotProps } from "@/types";
import { captainFirst, DEFAULT_ROLES, maxRosterFor, STARTER_COUNT } from "@/lib/teams";
import OctagonAvatar from "@/components/ui/OctagonAvatar";
import { CrownIcon, PlusIcon } from "@/components/ui/Icons";

function LineupSlot({ slot, gameHandle, displayName, role, isCaptain }: LineupSlotProps) {
  return (
    <div
      className={`group relative flex items-center gap-3 py-3 pr-3 rounded-xl border overflow-hidden transition-colors ${
        isCaptain
          ? "border-amber-400/30 bg-gradient-to-r from-amber-400/[0.07] to-transparent"
          : "border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent hover:border-primary-brand/40"
      }`}
    >
      <span className={`absolute left-0 inset-y-0 w-[3px] ${isCaptain ? "bg-amber-400" : "bg-primary-brand/60 group-hover:bg-primary-brand"}`} />
      <span className="w-9 pl-2 text-center font-display text-xl font-black tabular-nums text-white/15 shrink-0">
        {String(slot).padStart(2, "0")}
      </span>
      <OctagonAvatar label={gameHandle || displayName} highlight={isCaptain} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-black uppercase tracking-wide text-white truncate flex items-center gap-1.5">
          <span className="truncate">{gameHandle || displayName}</span>
          {isCaptain && <CrownIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
        </p>
        <p className="text-[11px] font-sans text-slate-400 truncate">{displayName}</p>
      </div>
      <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider text-primary-brand bg-primary-brand/10 border border-primary-brand/25">
        {role}
      </span>
    </div>
  );
}

// Starting five plus bench, captain always in slot 01.
export default function LineupGrid({ members, captainId, gameTitle, onRecruit }: LineupGridProps) {
  const ordered = captainFirst(members, captainId);
  const roles = DEFAULT_ROLES[gameTitle] ?? DEFAULT_ROLES.valo;
  const starters = ordered.slice(0, STARTER_COUNT);
  const bench = ordered.slice(STARTER_COUNT);
  const openStarterSlots = Math.max(0, STARTER_COUNT - starters.length);
  const benchCapacity = maxRosterFor(gameTitle) - STARTER_COUNT;

  const renderSlot = (m: (typeof members)[number], index: number) => (
    <LineupSlot
      key={m.id}
      slot={index + 1}
      gameHandle={m.gameHandle}
      displayName={m.displayName}
      role={m.preferredRole || roles[index] || "Substitute"}
      isCaptain={m.userId === captainId}
    />
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Starting Five <span className="text-white">{starters.length}/{STARTER_COUNT}</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {starters.map(renderSlot)}
          {Array.from({ length: openStarterSlots }).map((_, i) => (
            <button
              key={`open-${i}`}
              type="button"
              onClick={onRecruit}
              disabled={!onRecruit}
              className="flex items-center gap-3 py-3 pr-3 rounded-xl border border-dashed border-white/10 text-left enabled:hover:border-primary-brand/50 enabled:cursor-pointer group"
            >
              <span className="w-9 pl-2 text-center font-display text-xl font-black tabular-nums text-white/10">
                {String(starters.length + i + 1).padStart(2, "0")}
              </span>
              <span className="w-10 h-10 flex items-center justify-center text-slate-500 group-enabled:group-hover:text-primary-brand">
                <PlusIcon className="w-4 h-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm font-bold uppercase text-slate-500">Open Slot</span>
                <span className="block text-[11px] font-sans text-slate-600">{roles[starters.length + i]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {(bench.length > 0 || starters.length === STARTER_COUNT) && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
            Bench <span className="text-white">{bench.length}/{benchCapacity}</span>
          </h4>
          {bench.length === 0 ? (
            <p className="text-[11px] font-sans text-slate-500">No substitutes yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {bench.map((m, i) => renderSlot(m, STARTER_COUNT + i))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
