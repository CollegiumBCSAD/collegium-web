"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { EventInvite, EventTeam } from "@/types";
import { eventsService } from "@/services/eventsService";
import EventSignupForm from "@/components/events/EventSignupForm";
import EventSignupSuccess from "@/components/events/EventSignupSuccess";

const GAME_LABEL: Record<string, string> = {
  VALORANT: "VALORANT",
  LOL: "League of Legends",
  MLBB: "Mobile Legends: Bang Bang",
  CODM: "Call of Duty: Mobile",
};

export default function EventInvitePage() {
  const params = useParams();
  const code = params?.code as string;

  const [invite, setInvite] = useState<EventInvite | null>(null);
  const [submitted, setSubmitted] = useState<EventTeam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;

    eventsService
      .getInvite(code)
      .then(setInvite)
      .catch(() =>
        setError(
          "That invite link is not valid. Check the code with your organizer.",
        ),
      )
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16">
        <p className="text-white/40 text-sm">Loading event…</p>
      </main>
    );
  }

  if (error || !invite) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-16">
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-6">
          <h1 className="font-display text-xl text-red-200 mb-2">
            Invite not found
          </h1>
          <p className="text-sm text-red-100/80">{error}</p>
        </div>
      </main>
    );
  }

  const closed = !invite.signupsOpen;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <span className="font-display text-[11px] tracking-[0.2em] uppercase text-primary-brand">
          {GAME_LABEL[invite.gameTitle] ?? invite.gameTitle} · Invite only
        </span>
        <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight">
          {invite.name}
        </h1>
        <p className="text-sm text-white/50">
          Register your whole squad here. No account needed — one person signs
          up for the team.
        </p>
      </header>

      {invite.rules && (
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-display text-sm tracking-[0.14em] uppercase text-white/50 mb-2">
            Rules
          </h2>
          <p className="text-sm text-white/70 whitespace-pre-line">
            {invite.rules}
          </p>
        </section>
      )}

      {submitted ? (
        <EventSignupSuccess team={submitted} />
      ) : closed ? (
        <section className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-6">
          <h2 className="font-display text-lg text-amber-100 mb-1">
            Sign-ups are closed
          </h2>
          <p className="text-sm text-amber-100/80">
            The organizer has stopped accepting squads for this event.
          </p>
          <Link
            href={`/events/bracket/${invite.id}`}
            className="inline-block mt-4 text-sm text-primary-brand hover:underline"
          >
            View the bracket
          </Link>
        </section>
      ) : (
        <EventSignupForm
          invite={invite}
          code={code}
          onSubmitted={setSubmitted}
        />
      )}
    </main>
  );
}
