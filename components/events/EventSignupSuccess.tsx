"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventTeam } from "@/types";

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
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5">
        <h2 className="font-display text-lg text-emerald-200 mb-1">
          {team.name} is signed up
        </h2>
        <p className="text-sm text-emerald-100/80">
          The organizer will review your roster and documents. You do not need
          an account.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="font-display text-sm tracking-[0.14em] uppercase text-white/50 mb-2">
          Save this link
        </h3>
        <p className="text-sm text-white/60 mb-4">
          It is the only way back into your squad to upload documents or fix
          details. Bookmark it, or send it to yourself. If you lose it, ask the
          organizer to resend it.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            readOnly
            id="edit-link"
            value={editUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-xs text-white/80 font-mono"
          />
          <button
            type="button"
            onClick={copy}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <Link
        href={`/events/team/${team.editToken}`}
        className="self-start rounded-lg bg-primary-brand px-6 py-3 font-display text-sm tracking-wide text-[var(--game-btn-text,#fff)] hover:brightness-110 transition"
      >
        Upload documents
      </Link>
    </div>
  );
}
