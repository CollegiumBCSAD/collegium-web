import { mockNewsfeedModerationItems } from "@/lib/mock/admin";
import NewsfeedModerationList from "@/components/admin/NewsfeedModerationList";

export default function AdminNewsfeedPage() {
  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">Newsfeed Content Moderation</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Keep what Guests see on the public Newsfeed accurate and appropriate.
      </p>

      <div className="mt-8">
        <NewsfeedModerationList initialData={mockNewsfeedModerationItems} />
      </div>
    </div>
  );
}
