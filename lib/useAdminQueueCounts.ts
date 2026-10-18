"use client";

import { useEffect, useState } from "react";
import { coachService, scrimsService, tournamentsService } from "@/services";
import { eventsService } from "@/services/eventsService";
import { mockFlaggedMatches } from "@/lib/mock/admin";
import { AdminQueueCounts } from "@/types";

const EMPTY: AdminQueueCounts = { tournaments: 0, events: 0, coaches: 0, disputes: 0, scrims: 0 };

/**
 * Sizes of the admin review queues. Re-fetches whenever `refreshKey` changes
 * (the sidebar passes the pathname, so counts update after each review page).
 */
export function useAdminQueueCounts(refreshKey?: unknown) {
  const [counts, setCounts] = useState<AdminQueueCounts>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      tournamentsService.getPendingTournaments().catch(() => []),
      eventsService.getPendingApproval().catch(() => []),
      coachService.getApplications().catch(() => []),
      scrimsService.getScrims().catch(() => []),
    ]).then(([tournaments, events, coaches, scrims]) => {
      if (cancelled) return;
      setCounts({
        tournaments: tournaments.length,
        events: events.length,
        coaches: coaches.length,
        // Disputes have no API yet; the queue page reads the same mock list.
        disputes: mockFlaggedMatches.length,
        scrims: scrims.length,
      });
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const pendingTotal = counts.tournaments + counts.events + counts.coaches + counts.disputes;
  return { counts, pendingTotal, loaded };
}
