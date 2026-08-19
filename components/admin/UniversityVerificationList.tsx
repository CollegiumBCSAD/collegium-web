"use client";

import { useState } from "react";
import { UniversityVerification } from "@/types";

interface UniversityVerificationListProps {
  initialData: UniversityVerification[];
}

export default function UniversityVerificationList({ initialData }: UniversityVerificationListProps) {
  const [universities, setUniversities] = useState(initialData);

  const decide = (id: string, decision: "VERIFIED" | "REJECTED") => {
    setUniversities((prev) =>
      decision === "REJECTED"
        ? prev.filter((u) => u.id !== id)
        : prev.map((u) =>
            u.id === id ? { ...u, status: "VERIFIED", detail: "Approved just now" } : u
          )
    );
  };

  const pending = universities.filter((u) => u.status === "PENDING");
  const verified = universities.filter((u) => u.status === "VERIFIED");

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Pending Registrations</h2>
        {pending.length === 0 ? (
          <p className="text-sm font-sans text-secondary-text">No universities awaiting verification.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((u) => (
              <div
                key={u.id}
                className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-display text-lg font-bold text-foreground truncate">{u.name}</p>
                  <p className="mt-1 text-xs font-sans text-secondary-text">{u.detail}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-sans text-secondary-text">{u.domain}</span>
                  <button
                    onClick={() => decide(u.id, "REJECTED")}
                    className="px-4 py-1.5 rounded-md bg-white/60 text-[11px] font-sans font-bold uppercase text-background hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => decide(u.id, "VERIFIED")}
                    className="px-4 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-foreground mb-4">Verified Universities</h2>
        <div className="space-y-3">
          {verified.map((u) => (
            <div
              key={u.id}
              className="rounded-[6px] border border-panel-border px-6 py-5 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-foreground truncate">{u.name}</p>
                <p className="mt-1 text-xs font-sans text-secondary-text">{u.detail}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-sans text-secondary-text">{u.domain}</span>
                <span className="text-xs font-sans font-semibold text-success">VERIFIED</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
