"use client";

import { useEffect, useState } from "react";
import { coachService } from "@/services";
import { CoachAuditLogPanelProps, TeamAuditEntry } from "@/types";
import { AUDIT_LABELS, AUDIT_TONE, timeAgo } from "@/lib/coach";
import CoachPanel from "./CoachPanel";
import { ClockIcon } from "@/components/ui/Icons";

const DOT: Record<string, string> = {
  brand: "bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]",
  good: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
  bad: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.7)]",
  muted: "bg-slate-500",
};

export default function CoachAuditLogPanel({ teamId, refreshKey }: CoachAuditLogPanelProps) {
  const [entries, setEntries] = useState<TeamAuditEntry[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    coachService
      .getAuditLog(teamId)
      .then((rows) => {
        setEntries(rows);
        setNow(Date.now());
      })
      .catch(() => setEntries([]));
  }, [teamId, refreshKey]);

  return (
    <CoachPanel eyebrow="Audit trail" title="Activity" icon={<ClockIcon className="w-4 h-4" />}>
      {entries.length === 0 ? (
        <p className="text-xs font-sans text-slate-500">No recorded actions yet.</p>
      ) : (
        <ol className="relative max-h-80 overflow-y-auto pr-1">
          <span aria-hidden className="absolute left-[5px] top-2 bottom-2 w-px bg-white/10" />
          {entries.map((e) => (
            <li key={e.id} className="relative flex gap-3 pb-3 last:pb-0">
              <span className={`relative mt-1.5 w-[11px] h-[11px] shrink-0 rounded-full border-2 border-[#0E1220] ${DOT[AUDIT_TONE[e.action] ?? "brand"]}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-sans text-slate-100">{AUDIT_LABELS[e.action] ?? e.action.replace(/_/g, " ").toLowerCase()}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">
                  {e.actor.displayName} ·{" "}
                  <time dateTime={e.createdAt} title={new Date(e.createdAt).toLocaleString()}>
                    {timeAgo(e.createdAt, now)}
                  </time>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </CoachPanel>
  );
}
