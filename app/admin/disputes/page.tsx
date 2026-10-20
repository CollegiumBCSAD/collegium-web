import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { mockFlaggedMatches } from "@/lib/mock/admin";
import MatchDisputeReviewList from "@/components/admin/MatchDisputeReviewList";

export default function AdminDisputesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AdminPageHeader
        eyebrow="Review queue"
        title="Match disputes"
        description="Review flagged results and submitted evidence, then confirm or correct the official score."
      />

      <div>
        <MatchDisputeReviewList initialData={mockFlaggedMatches} />
      </div>
    </div>
  );
}
