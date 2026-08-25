"use client";

import { useEffect, useState } from "react";
import { mockPendingTeamRegistrations } from "@/lib/mock/admin";
import { tournamentsService } from "@/services";
import { Tournament } from "@/types";
import TournamentModerationPanel from "@/components/admin/TournamentModerationPanel";

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tournamentsService
      .getPendingTournaments()
      .then(setTournaments)
      .catch(() => setTournaments([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Tournament &amp; Registration Moderation
      </h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Approve or reject organizer-submitted tournaments — and approve team registrations.
      </p>

      <div className="mt-8">
        {isLoading ? (
          <p className="text-sm font-sans text-secondary-text">Loading pending tournaments…</p>
        ) : (
          <TournamentModerationPanel
            initialTournaments={tournaments}
            initialRegistrations={mockPendingTeamRegistrations}
          />
        )}
      </div>
    </div>
  );
}
