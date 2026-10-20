import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ScrimBoardModerationList from "@/components/admin/ScrimBoardModerationList";

export default function AdminScrimBoardPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AdminPageHeader
        eyebrow="Circuit"
        title="Scrim board"
        description="Keep the collegiate practice board accurate and free of spam or duplicate entries."
      />

      <ScrimBoardModerationList />
    </div>
  );
}
