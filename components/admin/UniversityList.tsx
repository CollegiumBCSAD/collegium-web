"use client";

import { useState } from "react";
import { University } from "@/types";
import { universitiesService } from "@/services";

interface UniversityListProps {
  initialUniversities: University[];
}

export default function UniversityList({ initialUniversities }: UniversityListProps) {
  const [universities, setUniversities] = useState<University[]>(initialUniversities);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const startEdit = (u: University) => {
    setEditingId(u.id);
    setEditName(u.name);
    setEditDomain(u.domain);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDomain("");
  };

  const handleSave = async (id: string) => {
    if (!editName.trim() || !editDomain.trim()) return;
    setBusyId(id);
    try {
      const updated = await universitiesService.updateUniversity(id, {
        name: editName.trim(),
        domain: editDomain.trim().toLowerCase(),
      });
      setUniversities((prev) => prev.map((u) => (u.id === id ? updated : u)));
      cancelEdit();
    } catch (err) {
      console.error("Failed to update university:", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      await universitiesService.deleteUniversity(id);
      setUniversities((prev) => prev.filter((u) => u.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error("Failed to delete university:", err);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = universities.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Search Input Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities by name or domain..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl bg-[#0A0A0A] border border-[#1A1A1A] text-white text-xs font-mono placeholder:text-neutral-500 focus:border-emerald-500/60 focus:outline-none transition-all shadow-sm"
          />
          <svg
            className="w-4 h-4 text-neutral-500 absolute left-4 top-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <span className="text-[11px] font-mono text-neutral-400">
          Showing <strong className="text-white">{filtered.length}</strong> of {universities.length} institutions
        </span>
      </div>

      {/* University Cards Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((u) => {
          const isEditing = editingId === u.id;
          const isConfirmingDelete = confirmDeleteId === u.id;
          const isAutoCreated = u.name.startsWith("Domain @");

          if (isEditing) {
            return (
              <div
                key={u.id}
                className="rounded-2xl border border-emerald-500/50 bg-[#0E1712] p-5 space-y-4 shadow-lg shadow-emerald-500/5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      University Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#050505] border border-[#222222] text-white text-xs font-sans focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                      Domain (e.g. admu.edu.ph)
                    </label>
                    <input
                      type="text"
                      value={editDomain}
                      onChange={(e) => setEditDomain(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-xl bg-[#050505] border border-[#222222] text-white text-xs font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#171717]">
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSave(u.id)}
                    disabled={busyId === u.id}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-xs font-mono font-extrabold text-black uppercase transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {busyId === u.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={u.id}
              className="rounded-2xl border border-[#1A1A1A] bg-[#0A0A0A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-emerald-500/30 hover:bg-[#111A15]/10 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#222222] text-emerald-400 flex items-center justify-center font-display font-black text-sm shrink-0 group-hover:border-emerald-500/40 group-hover:scale-105 transition-all shadow-inner">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                      {u.name}
                    </p>
                    {isAutoCreated ? (
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30 uppercase">
                        Needs Review
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase flex items-center gap-1">
                        <span>✓</span>
                        <span>Verified Domain</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs font-mono text-neutral-400">
                    <span className="text-emerald-400 font-semibold">@{u.domain}</span>
                    {isAutoCreated && " · Auto-provisioned from student registration"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                {isConfirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-400">Confirm delete?</span>
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={busyId === u.id}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 border border-rose-500 text-xs font-mono font-bold text-white transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {busyId === u.id ? "..." : "Yes, Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(u)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#141414] border border-[#222222] text-xs font-mono font-semibold text-neutral-300 hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(u.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#190D10] border border-rose-900/40 text-xs font-mono font-semibold text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
