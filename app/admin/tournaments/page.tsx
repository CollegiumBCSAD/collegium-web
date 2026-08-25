import { Tournament } from "@/types";
import { tournamentsService } from "@/services";
import TournamentModerationPanel from "@/components/admin/TournamentModerationPanel";

export default async function AdminTournamentsPage() {
  let pendingTournaments: Tournament[] = [];
  try {
    pendingTournaments = await tournamentsService.getPendingTournaments();
  } catch (err) {
    console.error("Failed to fetch pending tournaments server-side:", err);
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            CIRCUIT SANCTIONING &amp; AUDIT
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Tournament Sanctioning &amp; Moderation
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Review, sanction, and approve organizer-submitted collegiate esports tournaments before they go live on the circuit.
        </p>
      </div>

      <TournamentModerationPanel initialTournaments={pendingTournaments} />
    </div>
  );
}
