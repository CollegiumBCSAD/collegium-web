"use client";

import { useState } from "react";
import { universitiesService } from "@/services";

interface AddUniversityFormProps {
  onCreated: () => void;
}

export default function AddUniversityForm({ onCreated }: AddUniversityFormProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !domain.trim()) return;

    setIsSubmitting(true);
    setError("");
    try {
      await universitiesService.createUniversity(name.trim(), domain.trim());
      setName("");
      setDomain("");
      onCreated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add university.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[10px] border border-panel-border bg-card-bg px-6 py-5 space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">Add University</h2>

      {error && (
        <p className="text-xs font-sans text-error bg-error/10 border border-error/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
            University Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Silliman University"
            className="w-full h-10 px-3 rounded-md bg-background border border-panel-border text-foreground text-sm font-sans focus:border-primary-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[11px] font-sans font-semibold uppercase tracking-wider text-secondary-text mb-1">
            .edu.ph Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. su.edu.ph"
            className="w-full h-10 px-3 rounded-md bg-background border border-panel-border text-foreground text-sm font-sans focus:border-primary-brand focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 px-5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? "Adding..." : "Add University"}
      </button>
    </form>
  );
}
