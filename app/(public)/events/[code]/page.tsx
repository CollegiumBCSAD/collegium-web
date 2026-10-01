"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { EventInvite, EventTeam } from "@/types";
import { eventsService } from "@/services/eventsService";
import EventSignupForm from "@/components/events/EventSignupForm";
import EventSignupSuccess from "@/components/events/EventSignupSuccess";
import BackLink from "@/components/events/BackLink";
import { LockIcon, ShieldIcon } from "@/components/ui/Icons";
import {
  CARD,
  EVENT_STATUS,
  EYEBROW,
  HERO_OUTLINE,
  HERO_TITLE,
  MONO_LABEL,
  TEXT_ACTION,
  eventCover,
} from "@/components/events/eventSurfaces";

const GAME_LABEL: Record<string, string> = {
  VALORANT: "VALORANT",
  LOL: "League of Legends",
  MLBB: "Mobile Legends: Bang Bang",
  CODM: "Call of Duty: Mobile",
};

const STEPS = [
  { title: "Register the roster", body: "Five starters plus any substitutes, with student numbers and IGNs." },
  { title: "Upload documents", body: "A COR (PDF) and a school ID photo for each player, using your private link." },
  { title: "Get reviewed", body: "The organizer approves your squad or sends it back with a note." },
];

const PAGE = "flex flex-col flex-1 game-theme-bg relative";
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12";

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
      <div className={PAGE}>
        <div className={`${WRAP} space-y-10`}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div className="space-y-4">
              <div className="h-3 w-48 rounded bg-white/5 animate-pulse" />
              <div className="h-16 w-2/3 rounded bg-white/5 animate-pulse" />
              <div className="h-16 w-1/2 rounded bg-white/5 animate-pulse" />
            </div>
            <div className={`h-64 ${CARD} animate-pulse`} />
          </div>
          <div className={`h-96 ${CARD} animate-pulse`} />
        </div>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className={PAGE}>
        <div className={WRAP}>
          <div className="rounded-2xl border border-dashed border-rose-400/30 bg-rose-500/[0.06] py-16 px-6 text-center">
            <h1 className="font-display text-2xl font-black uppercase text-rose-200">
              Invite not found
            </h1>
            <p className="mt-2 text-sm text-rose-100/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const closed = !invite.signupsOpen;
  const status = EVENT_STATUS[invite.status];
  const closesAt = invite.signupsCloseAt
    ? new Date(invite.signupsCloseAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className={`${PAGE} animate-page-slide-in`}>
      <div className={`${WRAP} space-y-12`}>
        <div className="-mb-4 2xl:absolute 2xl:left-10 2xl:top-12 2xl:m-0">
          <BackLink href="/tournaments" label="Back" useHistory />
        </div>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div className="min-w-0">
            <p className={EYEBROW}>
              <span className="h-px w-8 bg-primary-brand" />
              {GAME_LABEL[invite.gameTitle] ?? invite.gameTitle}
              <span className="flex items-center gap-1.5 text-primary-brand">
                <LockIcon className="w-3 h-3" />
                Invite only
              </span>
            </p>
            <h1 className={`mt-5 ${HERO_TITLE} break-words`}>
              <span className="block text-white">{invite.name}</span>
              <span className={HERO_OUTLINE}>Squad sign-up</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
              Register your whole squad here.{" "}
              <span className="text-white font-semibold">No account needed</span>, one
              person signs up for the team.
            </p>
          </div>

          {/* How it works */}
          <div className={`group relative overflow-hidden ${CARD}`}>
            <Image
              src={eventCover(invite.gameTitle)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-35 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/85 to-[#07090F]/40" />

            <div className="relative p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] ${
                    closed ? "text-amber-300" : status.className
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full bg-current ${closed ? "" : "animate-pulse"}`} />
                  {closed ? "Sign-ups closed" : "Sign-ups open"}
                </span>
                {closesAt && !closed && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    Closes {closesAt}
                  </span>
                )}
              </div>

              <ol className="mt-5 space-y-4">
                {STEPS.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="font-display text-3xl font-black leading-none tabular-nums text-transparent [-webkit-text-stroke:1px_var(--primary-brand)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-display text-base font-black uppercase tracking-wide text-white leading-tight">
                        {step.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <dl className="mt-6 pt-4 border-t border-white/[0.08] grid grid-cols-2">
                <div className="pr-4">
                  <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Starters</dt>
                  <dd className="mt-1 font-display text-2xl font-black tabular-nums leading-none text-white">5</dd>
                </div>
                <div className="pl-4 border-l border-white/[0.08]">
                  <dt className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-500">Max subs</dt>
                  <dd className="mt-1 font-display text-2xl font-black tabular-nums leading-none text-white">
                    {invite.maxSubs}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {invite.rules && (
          <section className={`relative overflow-hidden ${CARD} p-6 sm:p-7`}>
            <span aria-hidden className="absolute left-6 top-0 h-[3px] w-12 rounded-b-full bg-primary-brand" />
            <div className="flex items-center gap-2">
              <ShieldIcon className="w-4 h-4 text-primary-brand" />
              <h2 className={MONO_LABEL}>Rules</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
              {invite.rules}
            </p>
          </section>
        )}

        {submitted ? (
          <EventSignupSuccess team={submitted} />
        ) : closed ? (
          <section className="rounded-2xl border border-dashed border-amber-400/30 bg-amber-500/[0.06] py-14 px-6 text-center">
            <LockIcon className="w-7 h-7 mx-auto text-amber-300/80" />
            <h2 className="mt-3 font-display text-2xl font-black uppercase text-amber-100">
              Sign-ups are closed
            </h2>
            <p className="mt-2 text-sm text-amber-100/80">
              The organizer has stopped accepting squads for this event.
            </p>
            <Link
              href={`/events/bracket/${invite.id}`}
              className={`inline-block mt-5 ${TEXT_ACTION} text-primary-brand hover:text-white`}
            >
              View the bracket →
            </Link>
          </section>
        ) : (
          <EventSignupForm
            invite={invite}
            code={code}
            onSubmitted={setSubmitted}
          />
        )}
      </div>
    </div>
  );
}
