"use client";

import { useEffect, useState } from "react";
import { CoachApplication } from "@/types";
import { coachService } from "@/services";
import CoachApprovalQueue from "@/components/admin/CoachApprovalQueue";

export default function AdminCoachesPage() {
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
    setError("");
    try {
      await coachService.reviewApplication(userId, approve);
      setApplications((prev) => prev.filter((a) => a.id !== userId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to review the application.");
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-5xl">
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            COACH / MANAGER TIER
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          Coach Approvals
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Coach accounts can&apos;t sign in until approved here. Denied coaches may reapply by registering again with
          the same email.
        </p>
      </div>

      {error && <p className="text-xs font-sans text-rose-400">{error}</p>}

      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-neutral-400">Loading approval queue...</div>
      ) : (
        <CoachApprovalQueue applications={applications} onReview={handleReview} />
      )}
    </div>
  );
}
