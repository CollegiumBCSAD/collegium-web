"use client";

import TournamentBracketModal from "@/components/TournamentBracketModal";
import { useRouter } from "next/navigation";

export default function BracketPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 min-h-[80vh]">
      <TournamentBracketModal
        isOpen={true}
        onClose={() => router.push("/tournaments")}
        title="TOURNAMENT BRACKET"
        subtitle="SINGLE ELIMINATION • 8 TEAMS"
      />
    </div>
  );
}

