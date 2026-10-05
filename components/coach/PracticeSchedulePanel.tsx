"use client";

import { useCallback, useEffect, useState } from "react";
import { coachService } from "@/services";
import { CoachTeamPanelProps, PracticeSchedule } from "@/types";
import { RECESSED, BRAND_BTN } from "@/components/organize/surfaces";
import { CalendarIcon, PlusIcon, TrashIcon } from "@/components/ui/Icons";
import CoachPanel from "./CoachPanel";

const INPUT = `${RECESSED} h-10 px-3 border border-white/[0.06] focus:border-primary-brand text-sm text-white font-sans focus:outline-none`;

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export default function PracticeSchedulePanel({ team, onChanged }: CoachTeamPanelProps) {
  const [schedules, setSchedules] = useState<PracticeSchedule[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(() => {
    coachService.getSchedules(team.id).then(setSchedules).catch(() => setSchedules([]));
  }, [team.id]);

  useEffect(load, [load]);

  const upcoming = schedules.filter((s) => new Date(s.endsAt ?? s.startsAt) >= new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startsAt) {
      setError("A practice needs a title and a start time.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await coachService.createSchedule(team.id, {
        title: title.trim(),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        location: location.trim() || undefined,
      });
      setTitle("");
      setStartsAt("");
      setEndsAt("");
      setLocation("");
      setIsFormOpen(false);
      load();
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not schedule the practice.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    try {
      await coachService.deleteSchedule(team.id, scheduleId);
      load();
      onChanged();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not cancel the practice.");
    }
  };

  return (
    <CoachPanel
      eyebrow="Calendar"
      title="Practice Schedule"
      icon={<CalendarIcon className="w-4 h-4" />}
      action={
        <button
          type="button"
          onClick={() => setIsFormOpen((o) => !o)}
          aria-expanded={isFormOpen}
          className="h-8 px-3 border border-white/10 hover:border-primary-brand/60 text-[10px] font-mono font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusIcon className={`w-3 h-3 transition-transform ${isFormOpen ? "rotate-45" : ""}`} />
          {isFormOpen ? "Close" : "Schedule"}
        </button>
      }
    >
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-black/30 border border-white/[0.06]">
          <input className={`${INPUT} sm:col-span-2`} value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Session title, e.g. Scrim block vs. DLSU" autoFocus />
          <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 space-y-1">
            <span>Starts</span>
            <input type="datetime-local" className={`${INPUT} w-full`} value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          </label>
          <label className="text-[9px] font-mono uppercase tracking-widest text-slate-500 space-y-1">
            <span>Ends (optional)</span>
            <input type="datetime-local" className={`${INPUT} w-full`} value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
          </label>
          <input className={`${INPUT} sm:col-span-2`} value={location} maxLength={120} onChange={(e) => setLocation(e.target.value)} placeholder="Location or voice channel (optional)" />
          {error && <p className="sm:col-span-2 text-xs font-sans text-rose-400">{error}</p>}
          <button type="submit" disabled={isSaving} className={`sm:col-span-2 h-10 text-xs font-mono font-black uppercase tracking-wider cursor-pointer disabled:opacity-50 ${BRAND_BTN}`}>
            {isSaving ? "Scheduling..." : "Schedule & Notify Roster"}
          </button>
        </form>
      )}

      {upcoming.length === 0 ? (
        <p className="text-xs font-sans text-slate-500">No upcoming sessions.</p>
      ) : (
        <ol className="space-y-2">
          {upcoming.map((s) => {
            const start = new Date(s.startsAt);
            return (
              <li key={s.id} className="group flex items-stretch gap-3 bg-black/25 border border-white/[0.05] hover:border-primary-brand/30 transition-colors">
                <div className="w-14 shrink-0 flex flex-col items-center justify-center py-2 bg-primary-brand/10 border-r border-primary-brand/20">
                  <span className="text-[9px] font-mono font-black uppercase text-primary-brand">{start.toLocaleDateString(undefined, { month: "short" })}</span>
                  <span className="font-display text-2xl font-black leading-none text-white tabular-nums">{start.getDate()}</span>
                  <span className="text-[9px] font-mono uppercase text-slate-500">{start.toLocaleDateString(undefined, { weekday: "short" })}</span>
                </div>
                <div className="flex-1 min-w-0 py-2.5">
                  <p className="text-sm font-sans font-semibold text-white truncate">{s.title}</p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {timeOf(s.startsAt)}
                    {s.endsAt && ` – ${timeOf(s.endsAt)}`}
                    {s.location && <span className="text-slate-500"> · {s.location}</span>}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  aria-label={`Cancel ${s.title}`}
                  className="px-3 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </CoachPanel>
  );
}
