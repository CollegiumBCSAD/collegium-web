"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useConfirm } from "@/context/ConfirmContext";
import { useEffect, useState } from "react";
import { CoachApplication } from "@/types";
import { coachService } from "@/services";
import CoachApprovalQueue from "@/components/admin/CoachApprovalQueue";

export default function AdminCoachesPage() {
  const confirm = useConfirm();
  const [applications, setApplications] = useState<CoachApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    coachService
      .getApplications()
      .then(setApplications)
      .catch(() => setError("Failed to load coach applications."))
      .finally(() => setLoading(false));
  }, []);

  const handleReview = async (userId: string, approve: boolean) => {
    if (!(await confirm(approve ? { title: "Approve this coach?", message: "They'll be able to sign in and manage squads.", confirmLabel: "Approve" } : { title: "Deny this coach?", message: "Their coach account request will be declined.", confirmLabel: "Deny", tone: "danger" }))) return;
    setError("");
    try {
      await coachService.reviewApplication(userId, approve);
      setApplications((prev) => prev.filter((a) => a.id !== userId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to review the application.");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AdminPageHeader
        eyebrow="Review queue"
        title="Coach approvals"
        description="Coach accounts can't sign in until approved here. Denied coaches may reapply by registering again with the same email."
      />

      {error && <p className="text-xs font-sans text-rose-400">{error}</p>}

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-400">Loading approval queue...</div>
      ) : (
        <CoachApprovalQueue applications={applications} onReview={handleReview} />
      )}
    </div>
  );
}
