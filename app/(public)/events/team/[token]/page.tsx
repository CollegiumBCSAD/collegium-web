"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { EventDocument, EventTeam } from "@/types";
import { eventsService } from "@/services/eventsService";
import PlayerDocumentUploader from "@/components/events/PlayerDocumentUploader";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  APPROVED: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
  REJECTED: "border-red-400/30 bg-red-500/10 text-red-100",
};

const STATUS_COPY: Record<string, string> = {
  PENDING: "Waiting for the organizer to review your squad.",
  APPROVED: "Your squad is approved and in the bracket. Details are locked.",
  REJECTED: "The organizer sent your squad back. Fix the note below and it returns to review.",
};

export default function EventTeamPage() {
  const params = useParams();
  const token = params?.token as string;

  const [team, setTeam] = useState<EventTeam | null>(null);
  const [documents, setDocuments] = useState<EventDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    Promise.all([
      eventsService.getTeamByToken(token),
      eventsService.getTeamDocuments(token),
    ])
      .then(([loadedTeam, loadedDocuments]) => {
        if (cancelled) return;
        setTeam(loadedTeam);
        setDocuments(loadedDocuments);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("That link is not valid. Ask your organizer to resend it.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16">
        <p className="text-sm text-white/40">Loading your squad…</p>
      </main>
    );
  }

  if (error || !team) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
          <h1 className="font-display text-xl text-red-200 mb-2">
            Squad not found
          </h1>
          <p className="text-sm text-red-100/80">{error}</p>
        </div>
      </main>
    );
  }

  const locked = team.status === "APPROVED";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-white/40">
          {team.event?.name ?? "Event"}
        </span>
        <h1 className="font-display text-3xl text-white">{team.name}</h1>
        <p className="text-sm text-white/50">
          Captain {team.captainName} · {team.captainEmail}
        </p>
      </header>

      <section
        className={`rounded-xl border p-5 ${STATUS_STYLE[team.status] ?? ""}`}
      >
        <h2 className="font-display text-sm tracking-[0.14em] uppercase mb-1">
          {team.status.toLowerCase()}
        </h2>
        <p className="text-sm opacity-80">{STATUS_COPY[team.status]}</p>
        {team.reviewNote && (
          <p className="mt-3 rounded-lg bg-black/30 px-3 py-2 text-sm">
            {team.reviewNote}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-display text-sm tracking-[0.14em] uppercase text-white/50">
            Player documents
          </h2>
          <p className="text-xs text-white/40 mt-1">
            A PDF Certificate of Registration and a photo of the school ID for
            each player. Only the organizer can open them.
          </p>
        </div>

        {team.roster.map((player) => (
          <PlayerDocumentUploader
            key={player.id ?? player.studentNumber}
            token={token}
            player={player}
            documents={documents}
            disabled={locked}
            onChanged={setDocuments}
          />
        ))}
      </section>

      <Link
        href={`/events/bracket/${team.eventId}`}
        className="self-start text-sm text-primary-brand hover:underline"
      >
        View the bracket
      </Link>
    </main>
  );
}
