import { mockScrimBoardPosts } from "@/lib/mock/admin";
import ScrimBoardModerationList from "@/components/admin/ScrimBoardModerationList";

export default function AdminScrimBoardPage() {
  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">Scrim Board Post Moderation</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Keep the practice board accurate and free of spam or duplicate entries.
      </p>

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-foreground mb-1">Pending / Flagged Posts</h2>
        <p className="text-sm font-sans text-secondary-text mb-4">
          Approve, edit, or remove postings before they go live.
        </p>
        <ScrimBoardModerationList initialData={mockScrimBoardPosts} />
      </div>
    </div>
  );
}
