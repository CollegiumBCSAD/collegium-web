"use client";

import { rostersService, ROSTER_CHANGE_REASONS } from "@/services";
import { RosterChangeHistoryProps, RosterChangeStatus } from "@/types";

const STATUS_STYLE: Record<RosterChangeStatus, string> = {
  PENDING: "text-amber-300 bg-amber-500/10",
  APPROVED: "text-emerald-300 bg-emerald-500/10",
  REJECTED: "text-rose-300 bg-rose-500/10",
  CANCELLED: "text-slate-400 bg-white/5",
};

export const reasonLabel = (value: string) => ROSTER_CHANGE_REASONS.find((r) => r.value === value)?.label ?? value;

export default function RosterChangeHistory({ teamId, changes, onChanged }: RosterChangeHistoryProps) {
  if (changes.length === 0) return null;

  const cancel = async (changeId: string) => {
    try {
      await rostersService.cancelChange(teamId, changeId);
    } finally {
      onChanged();
    }
  };

  return (
    <div className="space-y-1.5">
      <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Last-minute changes</h3>
      <ul className="space-y-1.5">
        {changes.map((c) => (
          <li key={c.id} className="px-3 py-2 rounded-lg bg-black/25 text-xs space-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-sans text-white truncate">
                {c.outUser.displayName} → {c.inUser.displayName}
                <span className="text-slate-500"> · {c.tournament.name}</span>
              </span>
              <span className={`shrink-0 px-1.5 rounded text-[9px] font-mono font-black uppercase ${STATUS_STYLE[c.status]}`}>{c.status}</span>
            </div>
            <p className="text-[11px] font-sans text-slate-400">
              <span className="text-slate-300">{reasonLabel(c.reason)}:</span> {c.details}
            </p>
            {c.reviewNote && <p className="text-[11px] font-sans text-slate-500">Organizer: {c.reviewNote}</p>}
            {c.status === "PENDING" && (
              <button type="button" onClick={() => cancel(c.id)} className="text-[10px] font-mono uppercase text-slate-500 hover:text-white cursor-pointer">
                Cancel request
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
