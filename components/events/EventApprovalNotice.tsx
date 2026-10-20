"use client";

import { useState } from "react";
import { EventApprovalNoticeProps } from "@/types";
import { AlertTriangleIcon, ClockIcon } from "@/components/ui/Icons";

/** Organizer-facing banner while an event waits on, or was turned down by, an admin. */
export default function EventApprovalNotice({ event, onResubmit }: EventApprovalNoticeProps) {
  const [busy, setBusy] = useState(false);

  if (event.approvalStatus === "PENDING") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/[0.06] px-5 py-4">
        <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <div>
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">Awaiting admin approval</p>
          <p className="mt-1 text-sm text-amber-100/80">
            An admin needs to approve this event before sign-ups can open. The invite link won&apos;t work until then, so
            hold off on sharing it. You&apos;ll get a notification when it&apos;s reviewed.
          </p>
        </div>
      </div>
    );
  }

  if (event.approvalStatus === "REJECTED") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/[0.06] px-5 py-4">
        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
        <div>
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-rose-200">Rejected by admin</p>
          {event.rejectionReason && <p className="mt-1 text-sm text-rose-100/90">“{event.rejectionReason}”</p>}
          <p className="mt-1 text-sm text-rose-100/70">Fix what the admin flagged, then send it back for another review.</p>
          {onResubmit && (
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onResubmit();
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-3 h-9 px-4 font-mono text-[11px] font-black uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
            >
              {busy ? "Resubmitting…" : "Resubmit for review"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
