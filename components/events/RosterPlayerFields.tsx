"use client";

import { RosterPlayer } from "@/types";
import { CARD, FIELD, MONO_LABEL, TEXT_ACTION } from "./eventSurfaces";

interface RosterPlayerFieldsProps {
  index: number;
  player: RosterPlayer;
  onChange: (index: number, patch: Partial<RosterPlayer>) => void;
  onRemove?: (index: number) => void;
}

export default function RosterPlayerFields({
  index,
  player,
  onChange,
  onRemove,
}: RosterPlayerFieldsProps) {
  const label = player.isSubstitute ? "Substitute" : `Player ${index + 1}`;
  const complete =
    !!player.fullName.trim() && !!player.studentNumber.trim() && !!player.ign.trim();

  return (
    <div
      className={`group relative overflow-hidden ${CARD} p-4 sm:p-5 transition-colors focus-within:border-primary-brand/40`}
    >
      <span
        aria-hidden
        className={`absolute left-0 inset-y-0 w-1 transition-colors ${
          complete
            ? "bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]"
            : "bg-white/[0.06] group-focus-within:bg-primary-brand"
        }`}
      />

      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex sm:flex-col items-center sm:items-start justify-between gap-1 sm:w-20 shrink-0">
          <span
            className={`font-display text-3xl font-black leading-none tabular-nums ${
              complete ? "text-white" : "text-transparent [-webkit-text-stroke:1px_rgba(148,163,184,0.5)]"
            }`}
          >
            {player.isSubstitute ? "S" : String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex items-center gap-2">
            <span
              className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${
                player.isSubstitute ? "text-primary-brand" : "text-slate-500"
              }`}
            >
              {label}
            </span>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className={`sm:hidden ${TEXT_ACTION} text-slate-500 hover:text-rose-300`}
              >
                Remove
              </button>
            )}
          </span>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`player-${index}-name`} className={`block mb-1.5 ${MONO_LABEL}`}>
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
            <label htmlFor={`player-${index}-student`} className={`block mb-1.5 ${MONO_LABEL}`}>
              Student number
            </label>
            <input
              id={`player-${index}-student`}
              value={player.studentNumber}
              onChange={(e) => onChange(index, { studentNumber: e.target.value })}
              className={`${FIELD} font-mono`}
              placeholder="2021-00123"
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor={`player-${index}-ign`} className={`block mb-1.5 ${MONO_LABEL}`}>
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

        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="hidden sm:flex w-11 h-[46px] shrink-0 items-center justify-center rounded-xl border border-white/10 text-slate-500 hover:text-rose-300 hover:border-rose-400/40 hover:bg-rose-500/10 transition"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
