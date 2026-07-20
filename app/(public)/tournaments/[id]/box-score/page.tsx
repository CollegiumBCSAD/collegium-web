"use client";

import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import { useRouter } from "next/navigation";

export default function BoxScorePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 min-h-[80vh]">
      <MatchBoxScoreModal
        isOpen={true}
        onClose={() => router.push("/tournaments")}
        title="MATCH BOX SCORE"
        subtitle="VALORANT • GRAND FINALS • ELIMINATION"
      />
    </div>
  );
}
