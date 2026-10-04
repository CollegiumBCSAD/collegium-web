"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { rostersService, ROSTER_CHANGE_REASONS } from "@/services";
import { RosterChangeModalProps, RosterChangeReason } from "@/types";

const FIELD = "w-full h-10 px-3 rounded-lg bg-black/40 border border-white/10 focus:border-primary-brand text-sm text-white font-sans focus:outline-none";
const MIN_DETAILS = 15;

// File a last-minute substitution on a lineup already submitted to a
// tournament. The organizer reviews it; the reason and explanation are required.
export default function RosterChangeModal({ roster, onClose, onFiled }: RosterChangeModalProps) {
  const [applicationId, setApplicationId] = useState(roster.locks[0]?.applicationId ?? "");
  const [outUserId, setOutUserId] = useState("");
  const [inUserId, setInUserId] = useState("");
  const [reason, setReason] = useState<RosterChangeReason>("INJURY");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const lock = roster.locks.find((l) => l.applicationId === applicationId);
  const locked = new Set(lock?.lockedUserIds ?? []);
  const starters = roster.members.filter((m) => locked.has(m.userId));
  const bench = roster.members.filter((m) => !locked.has(m.userId));

  const submit = async () => {
    if (!lock || !outUserId || !inUserId) {
      setError("Pick the tournament, the player going out, and the player coming in.");
      return;
    }
    if (details.trim().length < MIN_DETAILS) {
      setError(`Explain the reason in at least ${MIN_DETAILS} characters so the organizer can verify it.`);
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await rostersService.requestChange(roster.team.id, { applicationId, outUserId, inUserId, reason, details: details.trim() });
      onFiled();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not file the change.");
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-[#0E1220] border border-white/10 p-5 space-y-3 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black uppercase tracking-wide text-white">Last-Minute Roster Change</h2>
            <p className="text-[11px] font-sans text-slate-400">The tournament organizer must approve it before the lineup updates.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close Modal" className="text-slate-400 hover:text-white text-xl leading-none cursor-pointer">×</button>
        </div>

        <label className="block space-y-1 text-[10px] font-mono uppercase text-slate-500">
          <span>Tournament</span>
          <select className={FIELD} value={applicationId} onChange={(e) => { setApplicationId(e.target.value); setOutUserId(""); setInUserId(""); }}>
            {roster.locks.map((l) => (
              <option key={l.applicationId} value={l.applicationId} className="bg-[#0E1220]">{l.tournamentName}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1 text-[10px] font-mono uppercase text-slate-500">
            <span>Player out</span>
            <select className={FIELD} value={outUserId} onChange={(e) => setOutUserId(e.target.value)}>
              <option value="" className="bg-[#0E1220]">Select…</option>
              {starters.map((m) => <option key={m.userId} value={m.userId} className="bg-[#0E1220]">{m.gameHandle}</option>)}
            </select>
          </label>
          <label className="block space-y-1 text-[10px] font-mono uppercase text-slate-500">
            <span>Player in</span>
            <select className={FIELD} value={inUserId} onChange={(e) => setInUserId(e.target.value)} disabled={bench.length === 0}>
              <option value="" className="bg-[#0E1220]">{bench.length ? "Select…" : "No bench players"}</option>
              {bench.map((m) => <option key={m.userId} value={m.userId} className="bg-[#0E1220]">{m.gameHandle}</option>)}
            </select>
          </label>
        </div>
        {bench.length === 0 && (
          <p className="text-[11px] font-sans text-amber-300">Add the replacement to your team first (share the invite link), then file the change.</p>
        )}

        <label className="block space-y-1 text-[10px] font-mono uppercase text-slate-500">
          <span>Reason</span>
          <select className={FIELD} value={reason} onChange={(e) => setReason(e.target.value as RosterChangeReason)}>
            {ROSTER_CHANGE_REASONS.map((r) => <option key={r.value} value={r.value} className="bg-[#0E1220]">{r.label}</option>)}
          </select>
        </label>

        <label className="block space-y-1 text-[10px] font-mono uppercase text-slate-500">
          <span>Explanation ({details.trim().length}/{MIN_DETAILS} min)</span>
          <textarea
            className={`${FIELD} h-24 py-2 resize-none normal-case`}
            value={details}
            maxLength={1000}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Sprained wrist during Thursday practice; cleared to return in 2 weeks per team physician."
          />
        </label>

        {error && <p className="text-xs font-sans text-rose-400">{error}</p>}

        <button type="button" onClick={submit} disabled={isSaving} className="w-full h-10 rounded-lg game-theme-btn text-xs font-mono font-black uppercase tracking-wider cursor-pointer disabled:opacity-50">
          {isSaving ? "Filing..." : "Submit for Approval"}
        </button>
      </div>
    </div>,
    document.body,
  );
}
