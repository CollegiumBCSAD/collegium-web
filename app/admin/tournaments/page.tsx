import { Tournament } from "@/types";
import { tournamentsService } from "@/services";
import TournamentReviewDesk from "@/components/admin/TournamentReviewDesk";

export default async function AdminTournamentsPage() {
  let pendingTournaments: Tournament[] = [];
  try {
    pendingTournaments = await tournamentsService.getPendingTournaments();
  } catch (err) {
    console.error("Failed to fetch pending tournaments server-side:", err);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <TournamentReviewDesk initialTournaments={pendingTournaments} />
    </div>
  );
}
