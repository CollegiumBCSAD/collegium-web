"use client";

import { useState } from "react";
import { coachService } from "@/services";
import { PracticeSchedule, PracticeSummary, TeamCoachStripProps } from "@/types";
import { CalendarIcon, ShieldIcon } from "@/components/ui/Icons";

// Coach line on a roster card: who coaches the team (or a captain-only invite
// form when nobody does), plus a read-only peek at the coach's practice plan.
export default function TeamCoachStrip({ teamId, coachName, isCaptain, onChanged }: TeamCoachStripProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [practice, setPractice] = useState<{ upcoming: PracticeSchedule[]; summary: PracticeSummary } | null>(null);
  const [showPractice, setShowPractice] = useState(false);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSending(true);
    setMessage(null);
    try {
      await coachService.inviteCoach(teamId, email.trim());
      setEmail("");
      setMessage({ text: "Invitation sent. It expires in 7 days.", ok: true });
      onChanged?.();
    } catch (err: unknown) {
      setMessage({ text: err instanceof Error ? err.message : "Could not send the invitation.", ok: false });
    } finally {
      setIsSending(false);
    }
  };

  const togglePractice = async () => {
    const next = !showPractice;
    setShowPractice(next);
    if (!next || practice) return;
    const [schedules, records] = await Promise.all([
      coachService.getSchedules(teamId).catch((): PracticeSchedule[] => []),
      coachService.getPracticeRecords(teamId).catch(() => null),
    ]);
    setPractice({
      upcoming: schedules.filter((s) => new Date(s.endsAt ?? s.startsAt) >= new Date()).slice(0, 3),
      summary: records?.summary ?? { wins: 0, losses: 0, total: 0 },
    });
  };

  return (
    <div className="space-y-2 text-xs" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-slate-300 font-sans truncate flex items-center gap-1.5">
          <ShieldIcon className="w-3.5 h-3.5 text-primary-brand shrink-0" />
          {coachName ? (
            <span>
              Coach: <strong className="text-white">{coachName}</strong>
            </span>
          ) : (
            <span className="text-slate-400">No coach · captain handles registrations</span>
          )}
        </p>
        <button
          type="button"
          onClick={togglePractice}
          className="shrink-0 text-[10px] font-mono font-bold uppercase text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
          aria-expanded={showPractice}
        >
          <CalendarIcon className="w-3 h-3" />
          Practice
        </button>
      </div>

      {!coachName && isCaptain && (
        <form onSubmit={sendInvite} className="flex gap-1.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Coach's .edu.ph email"
            aria-label="Coach email"
            className="flex-1 min-w-0 h-8 px-2.5 bg-[#050711] border border-[#182338] focus:border-primary-brand text-white font-sans focus:outline-none"
          />
          <button
            type="submit"
            disabled={isSending}
            className="h-8 px-3 game-theme-btn text-[10px] font-mono font-black uppercase cursor-pointer disabled:opacity-50"
          >
            {isSending ? "..." : "Invite Coach"}
          </button>
        </form>
      )}
      {message && <p className={message.ok ? "text-emerald-400" : "text-rose-400"}>{message.text}</p>}

      {showPractice && (
        <div className="p-2.5 bg-[#050711] border border-[#162034] space-y-1">
          {!practice ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <>
              <p className="text-[10px] font-mono text-slate-400 uppercase">
                Scrim record: {practice.summary.total ? `${practice.summary.wins}W – ${practice.summary.losses}L` : "none logged"}
              </p>
              {practice.upcoming.length === 0 ? (
                <p className="text-slate-500">No upcoming practice.</p>
              ) : (
                practice.upcoming.map((s) => (
                  <p key={s.id} className="text-slate-200 truncate">
                    {new Date(s.startsAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {s.title}
                  </p>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
