"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useConfirm } from "@/context/ConfirmContext";
import { eventsService } from "@/services/eventsService";
import { AdminQueueCountProps, PendingEventApproval } from "@/types";
import { GAME_LABEL, eventCover } from "@/components/events/eventSurfaces";
import { CheckCircleIcon, LockIcon, XCircleIcon } from "@/components/ui/Icons";

const CHIP = "rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-300";

/** Admin queue for invite-only events: approve, or reject with a reason the organizer sees. */
export default function EventApprovalQueue({ onCountChange }: AdminQueueCountProps) {
  const confirm = useConfirm();
  const [events, setEvents] = useState<PendingEventApproval[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventsService
      .getPendingApproval()
      .then(setEvents)
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    if (events) onCountChange?.(events.length);
  }, [events, onCountChange]);

  const review = async (id: string, approve: boolean) => {
    if (!approve && !reason.trim()) {
      setError("Add a reason so the organizer knows what to fix.");
      return;
    }
    if (
      !(await confirm(
        approve
          ? {
              title: "Approve this event?",
              message: "The organizer can then open sign-ups and share the invite link.",
              confirmLabel: "Approve",
            }
          : {
              title: "Reject this event?",
              message: "Sign-ups stay closed and the organizer sees your reason.",
              confirmLabel: "Reject",
              tone: "danger",
            },
      ))
    )
      return;
    setBusyId(id);
    setError(null);
    try {
      await eventsService.reviewEvent(id, approve, approve ? undefined : reason.trim());
      setEvents((prev) => prev?.filter((e) => e.id !== id) ?? null);
      setRejectingId(null);
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the review.");
    } finally {
      setBusyId(null);
    }
  };

  if (events === null) {
    return <div className="h-40 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.02]" />;
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-dashed border-white/10 px-6 py-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/25">
          <LockIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-black uppercase tracking-wide text-white">All caught up</h3>
          <p className="text-sm text-neutral-500">No invite-only events waiting for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-200">{error}</p>}

      {events.map((ev) => (
        <article
          key={ev.id}
          className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#0A0C0B] transition-colors hover:border-emerald-500/30"
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative h-32 shrink-0 overflow-hidden md:h-auto md:w-56">
              <Image src={eventCover(ev.gameTitle)} alt="" fill sizes="224px" className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C0B] to-transparent md:bg-gradient-to-r md:from-transparent md:to-[#0A0C0B]" />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md bg-black/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/30 backdrop-blur">
                <LockIcon className="h-2.5 w-2.5" /> Invite-only
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-display text-xl font-black uppercase tracking-wide text-white">{ev.name}</h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    by <span className="text-neutral-300">{ev.organizer.displayName}</span> · {ev.organizer.email} · submitted{" "}
                    {new Date(ev.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-400/10 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-300 ring-1 ring-amber-400/30">
                  Awaiting approval
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={CHIP}>{GAME_LABEL[ev.gameTitle] ?? ev.gameTitle}</span>
                <span className={CHIP}>{ev.bracketFormat.replace(/_/g, " ").toLowerCase()}</span>
                <span className={CHIP}>Up to {ev.maxSubs} subs</span>
                {ev.signupsCloseAt && <span className={CHIP}>Sign-ups close {new Date(ev.signupsCloseAt).toLocaleDateString()}</span>}
              </div>

              {ev.rules && (
                <p className="line-clamp-3 whitespace-pre-line rounded-lg border border-white/[0.05] bg-black/30 px-3.5 py-2.5 text-xs leading-relaxed text-neutral-400">
                  {ev.rules}
                </p>
              )}

              {rejectingId === ev.id && (
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  autoFocus
                  placeholder="Why is it rejected? e.g. missing rules or eligibility details"
                  className="h-10 rounded-lg border border-rose-500/30 bg-black/40 px-3.5 text-sm text-white placeholder:text-neutral-600 focus:border-rose-500/60 focus:outline-none"
                />
              )}

              <div className="mt-auto flex flex-wrap justify-end gap-2 border-t border-white/[0.05] pt-4">
                {rejectingId === ev.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(null);
                        setReason("");
                        setError(null);
                      }}
                      className="h-10 px-4 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={busyId === ev.id}
                      onClick={() => review(ev.id, false)}
                      className="h-10 px-5 rounded-lg bg-rose-600 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-500 disabled:opacity-50"
                    >
                      Reject event
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      disabled={busyId === ev.id}
                      onClick={() => {
                        setRejectingId(ev.id);
                        setReason("");
                        setError(null);
                      }}
                      className="flex h-10 items-center gap-1.5 rounded-lg px-4 text-xs font-bold uppercase tracking-wider text-rose-300 ring-1 ring-rose-500/30 hover:bg-rose-500/10 disabled:opacity-50"
                    >
                      <XCircleIcon className="h-4 w-4" /> Reject
                    </button>
                    <button
                      type="button"
                      disabled={busyId === ev.id}
                      onClick={() => review(ev.id, true)}
                      className="flex h-10 items-center gap-1.5 rounded-lg bg-emerald-400 px-5 text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-300 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="h-4 w-4" /> {busyId === ev.id ? "Saving…" : "Approve"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
