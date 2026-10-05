"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventTeam } from "@/types";
import { CheckCircleIcon, LockIcon } from "@/components/ui/Icons";
import { CARD, MONO_LABEL } from "./eventSurfaces";

interface EventSignupSuccessProps {
  team: EventTeam;
}

export const editLinkStorageKey = (eventId: string) =>
  `collegium:event:${eventId}:editToken`;

export default function EventSignupSuccess({ team }: EventSignupSuccessProps) {
  const [copied, setCopied] = useState(false);

  const editUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/events/team/${team.editToken}`;

  useEffect(() => {
    try {
      window.localStorage.setItem(
        editLinkStorageKey(team.eventId),
        team.editToken,
      );
    } catch {
      return;
    }
  }, [team.editToken, team.eventId]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(editUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] animate-page-slide-in">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.06] p-7">
        <span aria-hidden className="absolute left-0 inset-y-0 w-1 bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]" />
        <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-300">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          Sign-up sent
        </span>
        <h2 className="mt-3 font-display text-3xl font-black uppercase leading-tight text-white break-words">
          {team.name} is signed up
        </h2>
        <p className="mt-2 text-sm text-emerald-100/80">
          The organizer will review your roster and documents. You do not need
          an account.
        </p>
        <Link
          href={`/events/team/${team.editToken}`}
          className="game-theme-btn mt-6 h-11 px-6 gap-2 text-sm"
        >
          Upload documents
          <span>→</span>
        </Link>
      </div>

      <div className={`relative overflow-hidden ${CARD} p-7`}>
        <span aria-hidden className="absolute left-6 top-0 h-[3px] w-12 rounded-b-full bg-primary-brand" />
        <div className="flex items-center gap-2">
          <LockIcon className="w-4 h-4 text-primary-brand" />
          <h3 className={MONO_LABEL}>Save this link</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          It is the only way back into your squad to upload documents or fix
          details. Bookmark it, or send it to yourself. If you lose it, ask the
          organizer to resend it.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            id="edit-link"
            value={editUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 rounded-xl bg-[#0E121C] border border-white/10 px-4 py-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-primary-brand/70"
          />
          <button
            type="button"
            onClick={copy}
            className={`tactical-btn-secondary h-11 px-6 text-xs ${copied ? "!text-emerald-300" : ""}`}
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
