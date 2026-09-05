"use client";

import { useParams, useRouter } from "next/navigation";
import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";

export default function TournamentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params?.id as string;

  return (
    <div className="flex flex-col flex-1 min-h-[80vh]">
      <TournamentBracketModal
        isOpen={true}
        onClose={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push("/tournaments");
          }
        }}
        tournamentId={tournamentId}
        title="TOURNAMENT DETAILS & BRACKET"
        subtitle="OFFICIAL COLLEGIATE CHAMPIONSHIP"
      />
    </div>
  );
}
