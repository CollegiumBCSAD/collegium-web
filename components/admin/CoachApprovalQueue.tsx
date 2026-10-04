"use client";

import { useState } from "react";
import { CoachApprovalQueueProps } from "@/types";
import { CheckCircleIcon, XCircleIcon } from "@/components/ui/Icons";

export default function CoachApprovalQueue({ applications, onReview }: CoachApprovalQueueProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  if (applications.length === 0) {
    return (
      <div className="p-12 text-center text-xs font-mono text-neutral-400 border border-[#1A1A1A] rounded-xl">
        No coach accounts awaiting review.
      </div>
    );
  }

  const review = async (userId: string, approve: boolean) => {
    setBusyId(userId);
    try {
      await onReview(userId, approve);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ul className="space-y-2">
      {applications.map((app) => (
        <li
          key={app.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A]"
        >
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-white uppercase truncate">{app.displayName}</p>
            <p className="text-xs font-mono text-neutral-400 truncate">{app.email}</p>
            <p className="text-[11px] font-sans text-neutral-500 mt-0.5">
              {app.university.name} · applied {new Date(app.createdAt).toLocaleDateString()}
              {!app.emailVerified && <span className="text-amber-400"> · email not yet verified</span>}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              disabled={busyId === app.id}
              onClick={() => review(app.id, false)}
              className="h-9 px-3 rounded-lg text-[11px] font-mono font-bold uppercase text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <XCircleIcon className="w-3.5 h-3.5" />
              Deny
            </button>
            <button
              type="button"
              disabled={busyId === app.id}
              onClick={() => review(app.id, true)}
              className="h-9 px-3 rounded-lg text-[11px] font-mono font-bold uppercase text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircleIcon className="w-3.5 h-3.5" />
              Approve
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
