import { mockFlaggedMatches } from "@/lib/mock/admin";
import MatchDisputeReviewList from "@/components/admin/MatchDisputeReviewList";

export default function AdminDisputesPage() {
  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">Match Dispute Review</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Review flagged results and submitted evidence, then confirm or correct the official score.
      </p>
      <p className="mt-1 text-sm font-sans text-secondary-text">
        Resolving a dispute automatically updates both teams&apos; match history and rankings.
      </p>

      <div className="mt-8">
        <MatchDisputeReviewList initialData={mockFlaggedMatches} />
      </div>
    </div>
  );
}
