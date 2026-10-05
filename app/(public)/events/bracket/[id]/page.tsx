"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { EventBracket } from "@/types";
import { eventsService } from "@/services/eventsService";
import EventBracketView from "@/components/events/EventBracketView";
import BackLink from "@/components/events/BackLink";
import { CrownIcon, LockIcon, SwordsIcon } from "@/components/ui/Icons";
import {
  CARD,
  EVENT_STATUS,
  EYEBROW,
  GAME_LABEL,
  HERO_OUTLINE,
  HERO_TITLE,
  MONO_LABEL,
  SECTION_TITLE,
  eventCover,
} from "@/components/events/eventSurfaces";

const FORMAT_LABEL: Record<string, string> = {
  SINGLE_ELIM: "Single Elimination",
  DOUBLE_ELIM: "Double Elimination",
  ROUND_ROBIN: "Round Robin",
  TWO_STAGE: "Two Stage",
};

const PAGE = "flex flex-col flex-1 game-theme-bg relative";
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12";

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
      <div className={PAGE}>
        <div className={`${WRAP} space-y-10`}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
            <div className="space-y-4">
              <div className="h-3 w-40 rounded bg-white/5 animate-pulse" />
              <div className="h-16 w-2/3 rounded bg-white/5 animate-pulse" />
              <div className="h-16 w-1/2 rounded bg-white/5 animate-pulse" />
            </div>
            <div className={`h-60 ${CARD} animate-pulse`} />
          </div>
          <div className={`h-80 ${CARD} animate-pulse`} />
        </div>
      </div>
    );
  }

  if (error || !bracket) {
    return (
      <div className={PAGE}>
        <div className={WRAP}>
          <div className="rounded-2xl border border-dashed border-rose-400/30 bg-rose-500/[0.06] py-16 px-6 text-center">
            <h1 className="font-display text-2xl font-black uppercase text-rose-200">
              Event not found
            </h1>
            <p className="mt-2 text-sm text-rose-100/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const status = EVENT_STATUS[bracket.status];
  const nameOf = (id: string | null) =>
    id ? (bracket.teams.find((t) => t.id === id)?.name ?? "Unknown squad") : null;

  const rounds = bracket.matches.map((m) => m.round);
  const finalRound = rounds.length ? Math.max(...rounds) : 0;
  const final = bracket.matches.find((m) => m.round === finalRound);
  const champion = final?.winnerId ? nameOf(final.winnerId) : null;
  const playable = bracket.matches.filter((m) => !m.isBye);
  const played = playable.filter((m) => m.winnerId).length;
  const next = playable
    .filter((m) => !m.winnerId && m.teamAId && m.teamBId)
    .sort((a, b) => a.round - b.round || a.slot - b.slot)[0];

  const stats = [
    { label: "Squads", value: bracket.teams.length },
    { label: "Played", value: playable.length ? `${played}/${playable.length}` : "—" },
    { label: "Format", value: FORMAT_LABEL[bracket.bracketFormat] ?? bracket.bracketFormat, small: true },
  ];

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
              {GAME_LABEL[bracket.gameTitle] ?? bracket.gameTitle}
              <span className="flex items-center gap-1.5 text-primary-brand">
                <LockIcon className="w-3 h-3" />
                Invite only
              </span>
            </p>
            <h1 className={`mt-5 ${HERO_TITLE} break-words`}>
              <span className="block text-white">{bracket.name}</span>
              <span className={HERO_OUTLINE}>Bracket</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
              <span className="text-white font-semibold">
                {bracket.teams.length} squad{bracket.teams.length === 1 ? "" : "s"}
              </span>{" "}
              · friendly event, does not affect rankings
            </p>
          </div>

          {/* Spotlight: champion, next match, or progress */}
          <div className={`group relative overflow-hidden ${CARD}`}>
            <Image
              src={eventCover(bracket.gameTitle)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/80 to-[#07090F]/25" />

            <div className="relative flex min-h-[250px] flex-col justify-end p-6">
              <span
                className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] ${status.className}`}
              >
                {status.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                {status.label}
              </span>

              {champion ? (
                <>
                  <span className="mt-3 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-amber-300">
                    <CrownIcon className="w-3.5 h-3.5" />
                    Champion
                  </span>
                  <h2 className="mt-1 font-display text-4xl font-black uppercase leading-none text-white drop-shadow-[0_0_24px_rgba(251,191,36,0.35)] break-words">
                    {champion}
                  </h2>
                  {final && final.scoreA !== null && (
                    <p className="mt-1 text-xs text-slate-300">
                      Won the final {Math.max(final.scoreA, final.scoreB ?? 0)}–{Math.min(final.scoreA, final.scoreB ?? 0)} vs{" "}
                      {nameOf(final.winnerId === final.teamAId ? final.teamBId : final.teamAId)}
                    </p>
                  )}
                </>
              ) : next ? (
                <>
                  <span className="mt-3 flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-primary-brand">
                    <SwordsIcon className="w-3.5 h-3.5" />
                    Up next · Best of {next.bestOf}
                  </span>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase leading-tight text-white break-words">
                    {nameOf(next.teamAId)} <span className="text-slate-500">vs</span> {nameOf(next.teamBId)}
                  </h2>
                </>
              ) : (
                <h2 className="mt-3 font-display text-2xl font-black uppercase leading-tight text-white">
                  {bracket.matches.length ? "Waiting on results" : "Bracket not drawn yet"}
                </h2>
              )}

              {playable.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                    <span>Bracket progress</span>
                    <span className="text-white tabular-nums">
                      {played}/{playable.length}
                    </span>
                  </div>
                  <div className="mt-1.5 flex gap-1">
                    {playable.map((m, i) => (
                      <span
                        key={m.id}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < played ? "bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" : "bg-white/15"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bracket */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <SwordsIcon className="w-5 h-5 text-primary-brand" />
              <h2 className={SECTION_TITLE}>Matches</h2>
            </div>
            <dl className="flex items-start">
              {stats.map((s, i) => (
                <div key={s.label} className={i > 0 ? "pl-4 ml-4 border-l border-white/[0.07]" : ""}>
                  <dt className={MONO_LABEL}>{s.label}</dt>
                  <dd
                    className={`mt-1 font-display font-black leading-none text-white tabular-nums ${
                      s.small ? "text-sm pt-1" : "text-xl"
                    }`}
                  >
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <EventBracketView bracket={bracket} />
        </section>
      </div>
    </div>
  );
}
