import { mockPendingTournamentPosts, mockPendingTeamRegistrations } from "@/lib/mock/admin";
import TournamentModerationPanel from "@/components/admin/TournamentModerationPanel";

export default function AdminTournamentsPage() {
  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">
        Tournament &amp; Registration Moderation
      </h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Configure bracket format, seeding, and schedule before publishing — and approve team registrations.
      </p>

      <div className="mt-8">
        <TournamentModerationPanel
          initialTournaments={mockPendingTournamentPosts}
          initialRegistrations={mockPendingTeamRegistrations}
        />
      </div>
    </div>
  );
}
