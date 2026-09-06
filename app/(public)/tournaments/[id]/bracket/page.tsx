"use client";

import TournamentBracketModal from "@/components/tournaments/TournamentBracketModal";
import { useParams, useRouter } from "next/navigation";

export default function BracketPage() {
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
        title="TOURNAMENT BRACKET"
      />
    </div>
  );
}
