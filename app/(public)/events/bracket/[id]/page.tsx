"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { EventBracket } from "@/types";
import { eventsService } from "@/services/eventsService";
import EventBracketView from "@/components/events/EventBracketView";

export default function EventBracketPage() {
  const params = useParams();
  const eventId = params?.id as string;

  const [bracket, setBracket] = useState<EventBracket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;

    eventsService
      .getBracket(eventId)
      .then((data) => {
        if (cancelled) return;
        setBracket(data);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("That event could not be found.");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16">
        <p className="text-sm text-white/40">Loading bracket…</p>
      </main>
    );
  }

  if (error || !bracket) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
          <h1 className="font-display text-xl text-red-200 mb-2">
            Event not found
          </h1>
          <p className="text-sm text-red-100/80">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-primary-brand">
          {bracket.gameTitle} · {bracket.status.toLowerCase()}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-white">
          {bracket.name}
        </h1>
        <p className="text-sm text-white/50">
          {bracket.teams.length} squad{bracket.teams.length === 1 ? "" : "s"} ·
          friendly event, does not affect rankings
        </p>
      </header>

      <EventBracketView bracket={bracket} />
    </main>
  );
}
