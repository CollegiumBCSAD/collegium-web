"use client";

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
    <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-7xl">
      <div className="border-b border-[#1A1A1A] pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase px-3 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
            INSTITUTION DIRECTORY
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
          University Domains &amp; Campus Registry
        </h1>
        <p className="font-sans text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
          Manage accredited collegiate .edu.ph domains. Students registering with these domains are verified automatically.
        </p>
      </div>

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
