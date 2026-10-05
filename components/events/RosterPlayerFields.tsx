"use client";

import { RosterPlayer } from "@/types";

interface RosterPlayerFieldsProps {
  index: number;
  player: RosterPlayer;
  onChange: (index: number, patch: Partial<RosterPlayer>) => void;
  onRemove?: (index: number) => void;
}

const FIELD =
  "w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary-brand/70 focus:ring-1 focus:ring-primary-brand/40 transition";

export default function RosterPlayerFields({
  index,
  player,
  onChange,
  onRemove,
}: RosterPlayerFieldsProps) {
  const label = player.isSubstitute ? "Substitute" : `Player ${index + 1}`;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="font-display text-xs tracking-[0.14em] uppercase text-white/50">
          {label}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs text-white/40 hover:text-red-300 transition"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label
            htmlFor={`player-${index}-name`}
            className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
          >
            Full name
          </label>
          <input
            id={`player-${index}-name`}
            value={player.fullName}
            onChange={(e) => onChange(index, { fullName: e.target.value })}
            className={FIELD}
            placeholder="Juan Dela Cruz"
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor={`player-${index}-student`}
            className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
          >
            Student number
          </label>
          <input
            id={`player-${index}-student`}
            value={player.studentNumber}
            onChange={(e) => onChange(index, { studentNumber: e.target.value })}
            className={FIELD}
            placeholder="2021-00123"
            autoComplete="off"
          />
        </div>

        <div>
          <label
            htmlFor={`player-${index}-ign`}
            className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
          >
            In-game name
          </label>
          <input
            id={`player-${index}-ign`}
            value={player.ign}
            onChange={(e) => onChange(index, { ign: e.target.value })}
            className={FIELD}
            placeholder="JDC"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
