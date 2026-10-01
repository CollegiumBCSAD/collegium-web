"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EventSummary, GameId } from "@/types";
import { useGame } from "@/context/GameContext";
import { GAMES, GAME_ID_TO_ENUM } from "@/lib/games";
import { eventsService } from "@/services/eventsService";
import { LockIcon, PlusIcon, UsersIcon } from "@/components/ui/Icons";
import { CARD, EVENT_STATUS, MONO_LABEL, eventCover } from "./eventSurfaces";

// Organizer's view of the invite-only strip on Tournaments: the events they
// run, instead of the code box and captain squads players get.
export default function OrganizerInviteEventsPanel() {
  const [allEvents, setEvents] = useState<EventSummary[] | null>(null);
  const { selectedGame } = useGame();
  const gameId = (selectedGame || "valo") as GameId;
  const game = GAMES[gameId] || GAMES.valo;
  const events = allEvents?.filter((e) => e.gameTitle === GAME_ID_TO_ENUM[gameId]) ?? null;

  useEffect(() => {
    let cancelled = false;
    eventsService
      .getMyEvents()
      .then((data) => !cancelled && setEvents(Array.isArray(data) ? data : []))
      .catch(() => !cancelled && setEvents([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const open = events?.filter((e) => e.status === "OPEN").length ?? 0;
  const squads = events?.reduce((sum, e) => sum + (e._count?.teams ?? 0), 0) ?? 0;

  return (
    <section className={`relative overflow-hidden ${CARD}`}>
      <span aria-hidden className="absolute left-6 top-0 h-[3px] w-12 rounded-b-full bg-primary-brand" />

      <div className="grid lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="p-6 sm:p-7 flex flex-col justify-center">
          <span className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">
            <LockIcon className="w-3 h-3" />
            Invite-only events
          </span>
          <h2 className="mt-2 font-display text-2xl font-black uppercase leading-tight text-white">
            Your {game.shortName} cups
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Only visible to you and the squads you invite. They never affect rankings.
          </p>

          {events && events.length > 0 && (
            <dl className="mt-4 grid grid-cols-3 max-w-[260px]">
              {[
                { label: "Events", value: events.length },
                { label: "Open", value: open },
                { label: "Squads", value: squads },
              ].map((s, i) => (
                <div key={s.label} className={i > 0 ? "pl-3 border-l border-white/[0.07]" : "pr-3"}>
                  <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">{s.label}</dt>
                  <dd className="mt-1 font-display text-xl font-black tabular-nums leading-none text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link href="/organize/events#new-event" className="game-theme-btn h-10 px-5 gap-2 text-xs">
              <PlusIcon className="w-3.5 h-3.5" />
              New event
            </Link>
            <Link
              href="/organize/events"
              className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
            >
              Manage all →
            </Link>
          </div>
        </div>

        <div className="border-t lg:border-t-0 lg:border-l border-white/[0.06] p-6 sm:p-7 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            <span className={MONO_LABEL}>Recent events</span>
            {events && events.length > 0 && (
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-600">
                {events.length} total
              </span>
            )}
          </div>

          {events === null ? (
            <div className="mt-3 flex gap-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-[132px] w-[260px] shrink-0 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="mt-3 flex h-[132px] items-center justify-center rounded-xl border border-dashed border-white/10 px-6 text-center">
              <p className="text-sm text-slate-400">
                No {game.shortName} invite-only events yet. Create one for your department.
              </p>
            </div>
          ) : (
            <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 snap-x">
              {events.map((event) => {
                const status = EVENT_STATUS[event.status];
                const teams = event._count?.teams ?? 0;
                return (
                  <li key={event.id} className="snap-start shrink-0 w-[260px]">
                    <Link
                      href={`/organize/events/${event.id}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-black/40 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20"
                    >
                      <div className="relative h-16 overflow-hidden">
                        <Image
                          src={eventCover(event.gameTitle)}
                          alt=""
                          fill
                          sizes="260px"
                          className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D16] to-transparent" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest text-white bg-black/55 backdrop-blur-md border border-white/15">
                          {event.gameTitle}
                        </span>
                      </div>
                      <div className="relative flex-1 px-4 pb-4 -mt-3">
                        <span
                          className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.15em] ${status.className}`}
                        >
                          {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                          {status.label}
                        </span>
                        <p className="mt-0.5 truncate font-display text-lg font-black uppercase leading-tight text-white">
                          {event.name}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.15em]">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <UsersIcon className="w-3 h-3" />
                            {teams} squad{teams === 1 ? "" : "s"}
                            <span className="text-slate-600">·</span>
                            <span className="text-slate-300 tracking-wider">{event.inviteCode}</span>
                          </span>
                          <span className="font-bold text-slate-500 group-hover:text-white transition-colors">
                            Manage <span className="text-primary-brand">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
