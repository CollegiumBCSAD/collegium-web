"use client";

import { useEffect, useState } from "react";
import { tournamentsService } from "@/services";
import { Tournament, PendingSquadApplication } from "@/types";
import TournamentModerationPanel from "@/components/admin/TournamentModerationPanel";

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [applications, setApplications] = useState<PendingSquadApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tournamentsService.getPendingTournaments(),
      tournamentsService.getAllPendingApplications(),
    ])
      .then(([tourneys, apps]) => {
        setTournaments(tourneys);
        setApplications(apps);
      })
      .catch(() => {
        setTournaments([]);
        setApplications([]);
      })
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
            initialApplications={applications}
          />
        )}
      </div>
    </div>
  );
}
