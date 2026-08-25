"use client";

import { useState } from "react";
import { universitiesService } from "@/services";

interface AddUniversityFormProps {
  onCreated?: () => void;
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
      onCreated?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add university.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-6 space-y-5 shadow-sm">
      <div>
        <span className="text-[10px] font-mono font-bold text-emerald-400 block mb-1">
          {"// REGISTRY PROVISIONING"}
        </span>
        <h2 className="font-display text-base font-bold text-white uppercase tracking-wider">
          Add University Domain
        </h2>
      </div>

      {error && (
        <p className="text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            University Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Silliman University"
            className="w-full h-11 px-4 rounded-xl bg-[#050505] border border-[#171717] text-white text-xs font-mono placeholder:text-neutral-600 focus:border-emerald-500/60 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
            .edu.ph Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="e.g. su.edu.ph"
            className="w-full h-11 px-4 rounded-xl bg-[#050505] border border-[#171717] text-white text-xs font-mono placeholder:text-neutral-600 focus:border-emerald-500/60 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all cursor-pointer disabled:opacity-50 shadow-lg shadow-emerald-500/20 active:scale-95"
      >
        {isSubmitting ? "Adding..." : "+ Register University"}
      </button>
    </form>
  );
}
