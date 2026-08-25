"use client";

import { useState } from "react";
import { University } from "@/types";
import { universitiesService } from "@/services";

interface UniversityListProps {
  universities: University[];
  onChanged: () => void;
}

export default function UniversityList({ universities, onChanged }: UniversityListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const startEdit = (u: University) => {
    setEditingId(u.id);
    setEditName(u.name);
    setEditDomain(u.domain);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setError("");
  };

  const saveEdit = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      await universitiesService.updateUniversity(id, { name: editName.trim(), domain: editDomain.trim() });
      setEditingId(null);
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update university.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      await universitiesService.deleteUniversity(id);
      setConfirmDeleteId(null);
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to remove university.");
      setConfirmDeleteId(null);
    } finally {
      setBusyId(null);
    }
  };

  if (universities.length === 0) {
    return <p className="text-sm font-sans text-secondary-text">No universities added yet.</p>;
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs font-sans text-error bg-error/10 border border-error/30 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      {universities.map((u) => {
        const isAutoCreated = u.name.toLowerCase().includes("unregistered");
        const isEditing = editingId === u.id;
        const isConfirmingDelete = confirmDeleteId === u.id;

        if (isEditing) {
          return (
            <div key={u.id} className="rounded-[6px] border border-primary-brand/50 bg-card-bg px-6 py-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="University name"
                  className="h-10 px-3 rounded-md bg-background border border-panel-border text-foreground text-sm font-sans focus:border-primary-brand focus:outline-none"
                />
                <input
                  type="text"
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  placeholder="domain.edu.ph"
                  className="h-10 px-3 rounded-md bg-background border border-panel-border text-foreground text-sm font-sans focus:border-primary-brand focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-1.5 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveEdit(u.id)}
                  disabled={busyId === u.id}
                  className="px-4 py-1.5 rounded-md bg-primary-brand/60 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-primary-brand/80 transition-colors cursor-pointer disabled:opacity-50"
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
            className="rounded-[6px] border border-panel-border px-6 py-5 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-display text-lg font-bold text-foreground truncate">{u.name}</p>
              {isAutoCreated && (
                <p className="mt-1 text-xs font-sans text-secondary-text">
                  Auto-created when a student registered before this domain was added — rename it to the real institution name.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-sans text-secondary-text">@{u.domain}</span>
              {isAutoCreated ? (
                <span className="text-xs font-sans font-semibold text-secondary-brand uppercase">Needs Review</span>
              ) : (
                <span className="text-xs font-sans font-semibold text-success uppercase">Verified</span>
              )}

              {isConfirmingDelete ? (
                <>
                  <span className="text-xs font-sans text-secondary-text">Remove?</span>
                  <button
                    onClick={() => handleDelete(u.id)}
                    disabled={busyId === u.id}
                    className="px-3 py-1 rounded-md bg-error/80 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-error transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {busyId === u.id ? "..." : "Yes"}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="px-3 py-1 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    No
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(u)}
                    className="px-3 py-1 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-foreground hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(u.id)}
                    className="px-3 py-1 rounded-md bg-white/10 text-[11px] font-sans font-bold uppercase text-error hover:bg-error/20 transition-colors cursor-pointer"
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
  );
}
