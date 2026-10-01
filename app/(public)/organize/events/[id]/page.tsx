"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
import { SwordsIcon, UsersIcon } from "@/components/ui/Icons";
import BackLink from "@/components/events/BackLink";
import DeleteEventButton from "@/components/events/DeleteEventButton";
import {
  CARD,
  EVENT_STATUS,
  EYEBROW,
  GAME_LABEL,
  HERO_OUTLINE,
  HERO_TITLE,
  MONO_LABEL,
  SECTION_TITLE,
  TEXT_ACTION,
  eventCover,
} from "@/components/events/eventSurfaces";

const PAGE = "flex flex-col flex-1 game-theme-bg relative";
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12";

export default function OrganizeEventPage() {
  const params = useParams();
  const router = useRouter();
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

  const undo = async (matchId: string) => {
    setBracket(await eventsService.clearResult(eventId, matchId));
    // Undoing the final reopens the event, so refresh its status too.
    setEvent(await eventsService.getEvent(eventId));
  };

  // A result can be undone only while the winner hasn't played the next match.
  const undoBlocked = (round: number, slot: number) =>
    !!bracket?.matches.find(
      (m) => m.round === round + 1 && m.slot === Math.floor(slot / 2),
    )?.winnerId;

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
      <div className={PAGE}>
        <div className={`${WRAP} space-y-10`}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div className="space-y-4">
              <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
              <div className="h-16 w-3/4 rounded bg-white/5 animate-pulse" />
              <div className="h-16 w-1/2 rounded bg-white/5 animate-pulse" />
            </div>
            <div className={`h-64 ${CARD} animate-pulse`} />
          </div>
          <div className={`h-80 ${CARD} animate-pulse`} />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={PAGE}>
        <div className={WRAP}>
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6">
            <p className="text-sm text-rose-100/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const pending = teams.filter((t) => t.status === "PENDING");
  const approved = teams.filter((t) => t.status === "APPROVED");
  const inviteUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/events/${event.inviteCode}`;

  const status = EVENT_STATUS[event.status];
  const bracketDrawn = !!bracket && bracket.matches.length > 0;
  const played = bracket?.matches.filter((m) => m.winnerId && !m.isBye).length ?? 0;
  const playable = bracket?.matches.filter((m) => !m.isBye).length ?? 0;

  const stats = [
    { label: "Approved", value: approved.length, tone: "text-emerald-300" },
    { label: "Waiting", value: pending.length, tone: pending.length ? "text-amber-300" : "text-white" },
    { label: "Total", value: teams.length, tone: "text-white" },
  ];

  return (
    <div className={`${PAGE} animate-page-slide-in`}>
      <div className={`${WRAP} space-y-14`}>
        <div className="-mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="2xl:absolute 2xl:left-10 2xl:top-12 2xl:m-0">
            <BackLink href="/organize/events" label="All events" />
          </div>
          <span className="ml-auto">
            <DeleteEventButton
              variant="full"
              eventId={event.id}
              eventName={event.name}
              squadCount={teams.length}
              onDeleted={() => router.push("/organize/events")}
            />
          </span>
        </div>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div className="min-w-0">
            <p className={EYEBROW}>
              <span className="h-px w-8 bg-primary-brand" />
              <Link href="/organize/events" className="hover:text-white transition-colors">
                Events
              </Link>
              <span className="text-primary-brand">{event.gameTitle}</span>
            </p>
            <h1 className={`mt-5 ${HERO_TITLE} break-words`}>
              <span className="block text-white">{event.name}</span>
              <span className={HERO_OUTLINE}>Control room</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
              <span className="text-white font-semibold">{approved.length} approved</span>,{" "}
              <span className="text-white font-semibold">{pending.length} waiting</span>,{" "}
              <span className="text-white font-semibold">{teams.length} total</span> squads.
              Review rosters, then draw the bracket once at least two are in.
            </p>
          </div>

          {/* Invite spotlight */}
          <div className={`group relative overflow-hidden ${CARD}`}>
            <Image
              src={eventCover(event.gameTitle)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/80 to-[#07090F]/25" />

            <div className="relative flex min-h-[260px] flex-col justify-end p-6">
              <span
                className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] ${status.className}`}
              >
                {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                {status.label}
                <span className="text-slate-500">· {GAME_LABEL[event.gameTitle] ?? event.gameTitle}</span>
              </span>

              <div className="mt-3">
                <span className={MONO_LABEL}>Invite link</span>
                <p className="mt-1 rounded-xl border border-white/10 bg-black/55 backdrop-blur-md px-3.5 py-2.5 font-mono text-xs text-slate-100 break-all">
                  {inviteUrl}
                </p>
              </div>

              <dl className="mt-4 grid grid-cols-3">
                {stats.map((s, i) => (
                  <div key={s.label} className={i > 0 ? "pl-4 border-l border-white/[0.1]" : "pr-4"}>
                    <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400">{s.label}</dt>
                    <dd className={`mt-1 font-display text-3xl font-black tabular-nums leading-none ${s.tone}`}>
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>

              {teams.length > 0 && (
                <div className="mt-4 flex gap-1">
                  {teams.map((t) => (
                    <span
                      key={t.id}
                      title={`${t.name} · ${t.status.toLowerCase()}`}
                      className={`h-1.5 flex-1 rounded-full ${
                        t.status === "APPROVED"
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"
                          : t.status === "PENDING"
                            ? "bg-amber-400/70"
                            : "bg-rose-400/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {/* Squads */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-5 h-5 text-primary-brand" />
              <h2 className={SECTION_TITLE}>Squads</h2>
            </div>
            <span className={MONO_LABEL}>
              {pending.length > 0 ? (
                <span className="text-amber-300">{pending.length} need review</span>
              ) : (
                `${teams.length} signed up`
              )}
            </span>
          </div>

          {teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 px-6 text-center">
              <h3 className="font-display text-lg font-black uppercase text-white">No squads yet</h3>
              <p className="mt-2 text-sm text-slate-400">Share the invite link above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <EventSquadReviewCard
                  key={team.id}
                  eventId={eventId}
                  team={team}
                  documents={documents[team.id] ?? []}
                  bracketDrawn={bracketDrawn}
                  onReview={review}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bracket */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <SwordsIcon className="w-5 h-5 text-primary-brand" />
              <h2 className={SECTION_TITLE}>Bracket</h2>
            </div>
            <Link
              href={`/events/bracket/${eventId}`}
              className={`${TEXT_ACTION} text-primary-brand hover:text-white`}
            >
              Open the public bracket →
            </Link>
          </div>

          {bracket && bracket.matches.length === 0 && (
            <div className={`relative overflow-hidden ${CARD} p-8 sm:p-10 text-center`}>
              <SwordsIcon className="w-8 h-8 mx-auto text-slate-600" />
              <h3 className="mt-4 font-display text-xl font-black uppercase text-white">
                Bracket not drawn yet
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {approved.length < 2
                  ? `Approve at least two squads to draw the bracket. ${approved.length} approved so far.`
                  : `${approved.length} approved squads are ready to be seeded.`}
              </p>
              <button
                type="button"
                onClick={generate}
                disabled={approved.length < 2}
                className="game-theme-btn mt-6 h-11 px-6 gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none disabled:grayscale"
              >
                Draw bracket ({approved.length} approved)
              </button>
            </div>
          )}

          {bracket && bracket.matches.length > 0 && (
            <>
              <div className={`${CARD} p-5 sm:p-6 space-y-4`}>
                <div className="flex items-center justify-between gap-3">
                  <span className={MONO_LABEL}>Report results</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 tabular-nums">
                    <span className="text-white">{played}</span>/{playable} played
                  </span>
                </div>
                {playable > 0 && (
                  <div className="flex gap-1">
                    {Array.from({ length: playable }, (_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < played ? "bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {bracket.matches.map((match) => (
                    <EventResultRow
                      key={match.id}
                      match={match}
                      teams={bracket.teams}
                      onUndo={undo}
                      undoBlocked={undoBlocked(match.round, match.slot)}
                      onReport={report}
                    />
                  ))}
                </div>
              </div>
              <EventBracketView bracket={bracket} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
