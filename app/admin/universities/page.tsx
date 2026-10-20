"use client";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { useEffect, useState } from "react";
import { University } from "@/types";
import { universitiesService } from "@/services";
import UniversityList from "@/components/admin/UniversityList";
import AddUniversityForm from "@/components/admin/AddUniversityForm";

export default function AdminUniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    universitiesService
      .getUniversities()
      .then((data) => {
        if (active) setUniversities(data);
      })
      .catch((err) => {
        console.error("Failed to load universities:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await universitiesService.getUniversities();
      setUniversities(data);
    } catch (err) {
      console.error("Failed to load universities:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <AdminPageHeader
        eyebrow="Circuit"
        title="Universities"
        description="Manage accredited collegiate .edu.ph domains. Students registering with these domains are verified automatically."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        <div className="lg:sticky lg:top-8">
          <AddUniversityForm onCreated={fetchUniversities} />
        </div>
        <div>
          {loading && universities.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-400">Loading university registry...</div>
          ) : (
            <UniversityList initialUniversities={universities} />
          )}
        </div>
      </div>
    </div>
  );
}
