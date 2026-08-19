import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";

export default function AdminDashboardPage() {
  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        A quick summary of everything waiting on your review.
      </p>

      <div className="mt-8">
        <AdminDashboardOverview />
      </div>
    </div>
  );
}
