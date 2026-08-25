"use client";

import { useEffect, useState } from "react";
import { universitiesService } from "@/services";
import { University } from "@/types";
import AddUniversityForm from "@/components/admin/AddUniversityForm";
import UniversityList from "@/components/admin/UniversityList";

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = () => {
    universitiesService
      .getUniversities()
      .then(setUniversities)
      .catch(() => setUniversities([]))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="px-12 py-10">
      <h1 className="font-display text-3xl font-bold text-foreground">Universities</h1>
      <p className="mt-2 text-base font-sans text-secondary-text">
        Add a university&apos;s .edu.ph domain directly — no submission or approval step. Students from that
        domain can register the moment it&apos;s added.
      </p>

      <div className="mt-8 space-y-10">
        <AddUniversityForm onCreated={refresh} />

        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Universities</h2>
          {isLoading ? (
            <p className="text-sm font-sans text-secondary-text">Loading universities…</p>
          ) : (
            <UniversityList universities={universities} onChanged={refresh} />
          )}
        </section>
      </div>
    </div>
  );
}
