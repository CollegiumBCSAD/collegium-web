"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventSummary } from "@/types";
import { eventsService } from "@/services/eventsService";

const GAMES = [
  { value: "MLBB", label: "Mobile Legends" },
  { value: "CODM", label: "Call of Duty: Mobile" },
  { value: "VALORANT", label: "VALORANT" },
  { value: "LOL", label: "League of Legends" },
];

const FIELD =
  "w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-primary-brand/70 transition";

export default function OrganizeEventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [name, setName] = useState("");
  const [gameTitle, setGameTitle] = useState("MLBB");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-primary-brand">
          Organize
        </span>
        <h1 className="font-display text-3xl text-white">Invite-only events</h1>
        <p className="text-sm text-white/50">
          Intra-department tournaments. Separate from varsity tournaments and
          they never affect rankings.
        </p>
      </header>

      <form
        onSubmit={create}
        className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-5 flex flex-col gap-4"
      >
        <h2 className="font-display text-sm tracking-[0.14em] uppercase text-white/50">
          New event
        </h2>

        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <div>
            <label
              htmlFor="event-name"
              className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
            >
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
            <label
              htmlFor="event-game"
              className="block text-[11px] uppercase tracking-wider text-white/40 mb-1"
            >
              Game
            </label>
            <select
              id="event-game"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className={FIELD}
            >
              {GAMES.map((game) => (
                <option key={game.value} value={game.value}>
                  {game.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-primary-brand px-5 py-2 text-sm text-[var(--game-btn-text,#fff)] hover:brightness-110 disabled:opacity-50 transition"
          >
            {busy ? "Creating…" : "Create"}
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-sm tracking-[0.14em] uppercase text-white/50">
          Your events
        </h2>

        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-white/40">Nothing yet.</p>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <Link
                  href={`/organize/events/${event.id}`}
                  className="font-display text-base text-white hover:text-primary-brand transition"
                >
                  {event.name}
                </Link>
                <p className="text-xs text-white/40">
                  {event.gameTitle} · {event.status.toLowerCase()} ·{" "}
                  {event._count?.teams ?? 0} squad
                  {(event._count?.teams ?? 0) === 1 ? "" : "s"}
                </p>
                <p className="mt-1 font-mono text-xs text-white/50">
                  code {event.inviteCode}
                </p>
              </div>

              {event.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() => open(event)}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5 transition"
                >
                  Open sign-ups
                </button>
              )}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
