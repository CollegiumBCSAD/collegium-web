"use client";

import { ReactNode, useCallback, useState } from "react";
import { TournamentReviewDeskProps } from "@/types";
import { LockIcon, TrophyIcon } from "@/components/ui/Icons";
import AdminPageHeader from "./AdminPageHeader";
import EventApprovalQueue from "./EventApprovalQueue";
import TournamentModerationPanel from "./TournamentModerationPanel";

type Queue = "tournaments" | "events";

/** Both tournament review queues on one page, as tabs with live counts. */
export default function TournamentReviewDesk({ initialTournaments }: TournamentReviewDeskProps) {
  const [tournamentCount, setTournamentCount] = useState(initialTournaments.length);
  const [eventCount, setEventCount] = useState<number | null>(null);
  // Open on whichever queue has work; default to tournaments.
  const [picked, setPicked] = useState<Queue | null>(null);
  const queue: Queue = picked ?? (initialTournaments.length === 0 && (eventCount ?? 0) > 0 ? "events" : "tournaments");

  const onTournamentCount = useCallback((n: number) => setTournamentCount(n), []);
  const onEventCount = useCallback((n: number) => setEventCount(n), []);

  const tabs: { id: Queue; label: string; count: number | null; icon: ReactNode }[] = [
    { id: "tournaments", label: "Public tournaments", count: tournamentCount, icon: <TrophyIcon className="h-4 w-4" /> },
    { id: "events", label: "Invite-only events", count: eventCount, icon: <LockIcon className="h-4 w-4" /> },
  ];
  const total = tournamentCount + (eventCount ?? 0);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Review queue"
        title="Tournament sanctioning"
        description="Approve organizer-submitted tournaments and invite-only events before they go live or open sign-ups."
        stats={[
          { label: "Waiting in total", value: total, tone: total > 0 ? "warn" : "good" },
          { label: "Public tournaments", value: tournamentCount, tone: tournamentCount > 0 ? "warn" : "default" },
          { label: "Invite-only events", value: eventCount ?? "—", tone: (eventCount ?? 0) > 0 ? "warn" : "default" },
        ]}
      />

      <div className="flex gap-1 border-b border-white/[0.06]" role="tablist">
        {tabs.map((t) => {
          const active = queue === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setPicked(t.id)}
              className={`relative -mb-px flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                active ? "text-white" : "text-neutral-500 hover:text-neutral-200"
              }`}
            >
              <span className={active ? "text-emerald-400" : ""}>{t.icon}</span>
              {t.label}
              {t.count !== null && (
                <span
                  className={`min-w-5 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                    t.count > 0 ? "bg-amber-400/15 text-amber-300" : "bg-white/[0.05] text-neutral-500"
                  }`}
                >
                  {t.count}
                </span>
              )}
              {active && <span aria-hidden className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Both stay mounted so their counts stay live while hidden. */}
      <div hidden={queue !== "tournaments"}>
        <TournamentModerationPanel initialTournaments={initialTournaments} onCountChange={onTournamentCount} />
      </div>
      <div hidden={queue !== "events"}>
        <EventApprovalQueue onCountChange={onEventCount} />
      </div>
    </div>
  );
}
