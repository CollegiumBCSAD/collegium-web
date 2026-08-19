import { mockUniversityVerifications } from "@/lib/mock/admin";
import UniversityVerificationList from "@/components/admin/UniversityVerificationList";

export default function AdminUniversitiesPage() {
  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">University Verification</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Review submitted .edu.ph domain proof and approve or reject new institutions.
      </p>
      <p className="mt-1 text-sm font-sans text-secondary-text">
        Approved universities can immediately register Athlete accounts under their domain.
      </p>

      <div className="mt-8">
        <UniversityVerificationList initialData={mockUniversityVerifications} />
      </div>
    </div>
  );
}
