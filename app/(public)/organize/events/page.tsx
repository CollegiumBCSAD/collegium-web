"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventSummary, GameId } from "@/types";
import { useGame } from "@/context/GameContext";
import { GAMES, GAME_ID_TO_ENUM } from "@/lib/games";
import { eventsService } from "@/services/eventsService";
import { LockIcon, PlusIcon, TrophyIcon } from "@/components/ui/Icons";
import BackLink from "@/components/events/BackLink";
import DeleteEventButton from "@/components/events/DeleteEventButton";
import {
  CARD,
  EVENT_STATUS,
  EYEBROW,
  FIELD,
  GAME_LABEL,
  HERO_OUTLINE,
  HERO_TITLE,
  MONO_LABEL,
  SECTION_TITLE,
  eventCover,
} from "@/components/events/eventSurfaces";

export default function OrganizeEventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // One title at a time, driven by the game switcher in the header, the same
  // way the Organize workspace scopes everything.
  const { selectedGame } = useGame();
  const gameId = (selectedGame || "valo") as GameId;
  const game = GAMES[gameId] || GAMES.valo;
  const gameTitle = GAME_ID_TO_ENUM[gameId] ?? "VALORANT";

  useEffect(() => {
    let cancelled = false;

    eventsService
      .getMyEvents()
      .then((data) => {
        if (cancelled) return;
        setEvents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Could not load your events. Are you signed in as organizer?");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    setError(null);
    try {
      await eventsService.createEvent({ name: name.trim(), gameTitle });
      setEvents(await eventsService.getMyEvents());
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create it.");
    } finally {
      setBusy(false);
    }
  };

  const open = async (event: EventSummary) => {
    setError(null);
    try {
      await eventsService.updateEvent(event.id, { status: "OPEN" });
      setEvents(await eventsService.getMyEvents());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open sign-ups.");
    }
  };

  const gameEvents = events.filter((e) => e.gameTitle === gameTitle);
  const openCount = gameEvents.filter((e) => e.status === "OPEN").length;
  const squadCount = gameEvents.reduce((sum, e) => sum + (e._count?.teams ?? 0), 0);

  return (
    <div className="flex flex-col flex-1 game-theme-bg relative animate-page-slide-in">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12 space-y-12">
        <div className="-mb-4 2xl:absolute 2xl:left-10 2xl:top-12 2xl:m-0">
          <BackLink href="/organize" label="Back to Organize" />
        </div>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div>
            <p className={EYEBROW}>
              <span className="h-px w-8 bg-primary-brand" />
              <Link href="/organize" className="hover:text-white transition-colors">
                Organize
              </Link>
              <span className="text-primary-brand">Invite-only · {game.shortName}</span>
            </p>
            <h1 className={`mt-5 ${HERO_TITLE}`}>
              <span className="block text-white">Your department.</span>
              <span className={HERO_OUTLINE}>Your bracket.</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
              Intra-department tournaments. Separate from varsity tournaments
              and they never affect rankings.{" "}
              {!loading && (
                <>
                  <span className="text-white font-semibold">{gameEvents.length} {game.shortName} events</span>,{" "}
                  <span className="text-white font-semibold">{openCount} open</span>,{" "}
                  <span className="text-white font-semibold">{squadCount} squads</span> signed up.
                </>
              )}
            </p>
          </div>

          {/* Create */}
          <form
            id="new-event"
            onSubmit={create}
            className={`group relative overflow-hidden scroll-mt-24 ${CARD}`}
          >
            <Image
              key={gameTitle}
              src={eventCover(gameTitle)}
              alt=""
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-30 animate-page-slide-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/85 to-[#07090F]/40" />
            <span aria-hidden className="absolute left-6 top-0 h-[3px] w-12 rounded-b-full bg-primary-brand transition-all duration-500 group-focus-within:w-28" />

            <div className="relative p-6 sm:p-7 space-y-5">
              <div>
                <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">
                  <PlusIcon className="w-3 h-3" />
                  New event
                </span>
                <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">
                  Start a {game.shortName} cup
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  You get an invite code to share with squad captains.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label htmlFor="event-name" className={`block mb-1.5 ${MONO_LABEL}`}>
                    Name
                  </label>
                  <input
                    id="event-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={FIELD}
                    placeholder="InfoTech Cup 2026"
                  />
                </div>

                <div>
                  <span className={`block mb-1.5 ${MONO_LABEL}`}>Game</span>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0E121C]/80 px-4 py-3">
                    <span className="flex items-center gap-2.5 text-sm font-semibold text-white">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" />
                      {GAME_LABEL[gameTitle] ?? game.name}
                    </span>
                    <span className="flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">
                      <LockIcon className="w-2.5 h-2.5" />
                      Set by game title
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    Switch the game title in the header to host for another game.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="game-theme-btn h-11 w-full gap-2 text-sm disabled:opacity-50 disabled:pointer-events-none"
              >
                {busy ? "Creating…" : "Create event"}
                {!busy && <span>→</span>}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        {/* List */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-3">
            <h2 className={SECTION_TITLE}>Your events</h2>
            {!loading && <span className={MONO_LABEL}>{gameEvents.length} {game.shortName}</span>}
          </div>

          {loading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className={`h-72 ${CARD} animate-pulse`} />
              ))}
            </div>
          ) : gameEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-16 px-6 text-center">
              <TrophyIcon className="w-7 h-7 mx-auto text-slate-600" />
              <h3 className="mt-3 font-display text-lg font-black uppercase text-white">
                No {game.shortName} events yet
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {events.length > 0
                  ? `You have ${events.length} event${events.length === 1 ? "" : "s"} under other game titles. Switch the title in the header to see them.`
                  : `Create your first ${game.name} invite-only event above.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {gameEvents.map((event) => {
                const squads = event._count?.teams ?? 0;
                const status = EVENT_STATUS[event.status];
                const stats = [
                  { label: "Game", value: event.gameTitle },
                  { label: "Squads", value: squads },
                  { label: "Invite code", value: event.inviteCode, mono: true },
                ];

                return (
                  <article
                    key={event.id}
                    className={`group relative flex flex-col overflow-hidden ${CARD} transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14]`}
                  >
                    {/* Cover art */}
                    <div className="relative h-36 overflow-hidden">
                      <Image
                        src={eventCover(event.gameTitle)}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover opacity-60 transition-all duration-700 group-hover:opacity-85 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] via-[#090C14]/40 to-transparent" />
                      <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-black/55 backdrop-blur-md border border-white/15">
                          {GAME_LABEL[event.gameTitle] ?? event.gameTitle}
                        </span>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-slate-200 bg-black/55 backdrop-blur-md border border-white/15">
                          <LockIcon className="w-2.5 h-2.5" />
                          Invite-only
                        </span>
                      </div>
                    </div>

                    <div className="relative flex-1 flex flex-col px-6 pb-6 -mt-6">
                      <span
                        className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] ${status.className}`}
                      >
                        {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                        {status.label}
                      </span>
                      <Link
                        href={`/organize/events/${event.id}`}
                        className="mt-1.5 font-display text-2xl font-black uppercase leading-tight tracking-tight text-white truncate hover:text-primary-brand transition-colors"
                      >
                        {event.name}
                      </Link>

                      <dl className="mt-5 grid grid-cols-3">
                        {stats.map((s, i) => (
                          <div key={s.label} className={i > 0 ? "pl-4 border-l border-white/[0.07]" : "pr-4"}>
                            <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">
                              {s.label}
                            </dt>
                            <dd
                              className={`mt-1 truncate leading-tight text-white ${
                                s.mono
                                  ? "font-mono text-sm font-bold tracking-wider pt-1"
                                  : "font-display text-xl font-black tabular-nums"
                              }`}
                            >
                              {s.value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-end gap-3">
                        <span className="mr-auto">
                          <DeleteEventButton
                            eventId={event.id}
                            eventName={event.name}
                            squadCount={squads}
                            onDeleted={() =>
                              setEvents((prev) => prev.filter((e) => e.id !== event.id))
                            }
                          />
                        </span>
                        {event.status === "DRAFT" && (
                          <button
                            type="button"
                            onClick={() => open(event)}
                            className="tactical-btn-secondary h-10 px-5 text-xs"
                          >
                            Open sign-ups
                          </button>
                        )}
                        <Link
                          href={`/organize/events/${event.id}`}
                          className="game-theme-btn h-10 px-5 gap-2 text-xs"
                        >
                          Manage
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
