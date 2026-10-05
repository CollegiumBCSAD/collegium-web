"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  EventBracket,
  EventDocument,
  EventSummary,
  EventTeam,
  EventTeamStatus,
} from "@/types";
import { eventsService } from "@/services/eventsService";
import EventSquadReviewCard from "@/components/events/EventSquadReviewCard";
import EventResultRow from "@/components/events/EventResultRow";
import EventBracketView from "@/components/events/EventBracketView";

export default function OrganizeEventPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [event, setEvent] = useState<EventSummary | null>(null);
  const [teams, setTeams] = useState<EventTeam[]>([]);
  const [documents, setDocuments] = useState<Record<string, EventDocument[]>>({});
  const [bracket, setBracket] = useState<EventBracket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    Promise.all([
      eventsService.getEvent(eventId),
      eventsService.getEventTeams(eventId),
      eventsService.getBracket(eventId),
    ])
      .then(async ([loadedEvent, loadedTeams, loadedBracket]) => {
        const docs = await Promise.all(
          loadedTeams.map((team) =>
            eventsService
              .getTeamDocuments(team.editToken)
              .then((list) => [team.id, list] as const)
              .catch(() => [team.id, [] as EventDocument[]] as const),
          ),
        );
        if (cancelled) return;
        setEvent(loadedEvent);
        setTeams(loadedTeams);
        setDocuments(Object.fromEntries(docs));
        setBracket(loadedBracket);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load this event.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const review = async (
    teamId: string,
    status: EventTeamStatus,
    reviewNote?: string,
  ) => {
    await eventsService.reviewTeam(eventId, teamId, status, reviewNote);
    setTeams(await eventsService.getEventTeams(eventId));
  };

  const generate = async () => {
    setError(null);
    try {
      setBracket(await eventsService.generateBracket(eventId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw it.");
    }
  };

  const report = async (
    matchId: string,
    winnerId: string,
    scoreA: number,
    scoreB: number,
  ) => {
    setBracket(
      await eventsService.reportResult(eventId, matchId, {
        winnerId,
        scoreA,
        scoreB,
      }),
    );
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-16">
        <p className="text-sm text-white/40">Loading event…</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-16">
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
          <p className="text-sm text-red-100/80">{error}</p>
        </div>
      </main>
    );
  }

  const pending = teams.filter((t) => t.status === "PENDING");
  const approved = teams.filter((t) => t.status === "APPROVED");
  const inviteUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/events/${event.inviteCode}`;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14 flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-primary-brand">
          {event.gameTitle} · {event.status.toLowerCase()}
        </span>
        <h1 className="font-display text-3xl text-white">{event.name}</h1>
        <div className="flex flex-col gap-1 text-sm text-white/50">
          <span>
            {approved.length} approved · {pending.length} waiting ·{" "}
            {teams.length} total
          </span>
          <span className="font-mono text-xs text-white/40 break-all">
            {inviteUrl}
          </span>
        </div>
      </header>

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-sm tracking-[0.14em] uppercase text-white/50">
          Squads
        </h2>
        {teams.length === 0 ? (
          <p className="text-sm text-white/40">
            No squads yet. Share the invite link above.
          </p>
        ) : (
          teams.map((team) => (
            <EventSquadReviewCard
              key={team.id}
              eventId={eventId}
              team={team}
              documents={documents[team.id] ?? []}
              onReview={review}
            />
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm tracking-[0.14em] uppercase text-white/50">
            Bracket
          </h2>
          {bracket && bracket.matches.length === 0 && (
            <button
              type="button"
              onClick={generate}
              disabled={approved.length < 2}
              className="rounded-lg bg-primary-brand px-4 py-2 text-sm text-[var(--game-btn-text,#fff)] hover:brightness-110 disabled:opacity-40 transition"
            >
              Draw bracket ({approved.length} approved)
            </button>
          )}
        </div>

        {bracket && bracket.matches.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              {bracket.matches.map((match) => (
                <EventResultRow
                  key={match.id}
                  match={match}
                  teams={bracket.teams}
                  onReport={report}
                />
              ))}
            </div>
            <EventBracketView bracket={bracket} />
          </>
        )}
      </section>

      <Link
        href={`/events/bracket/${eventId}`}
        className="self-start text-sm text-primary-brand hover:underline"
      >
        Open the public bracket
      </Link>
    </main>
  );
}
