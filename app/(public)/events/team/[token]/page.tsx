"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { EventDocument, EventTeam } from "@/types";
import { eventsService } from "@/services/eventsService";
import PlayerDocumentUploader from "@/components/events/PlayerDocumentUploader";
import BackLink from "@/components/events/BackLink";
import { UploadIcon } from "@/components/ui/Icons";
import {
  CARD,
  EYEBROW,
  HERO_OUTLINE,
  HERO_TITLE,
  MONO_LABEL,
  SECTION_TITLE,
  TEAM_STATUS,
  TEXT_ACTION,
  eventCover,
} from "@/components/events/eventSurfaces";

const STATUS_COPY: Record<string, string> = {
  PENDING: "Waiting for the organizer to review your squad.",
  APPROVED: "Your squad is approved and in the bracket. Details are locked.",
  REJECTED: "The organizer sent your squad back. Fix the note below and it returns to review.",
};

const PAGE = "flex flex-col flex-1 game-theme-bg relative";
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12 py-8 sm:py-12";

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
          <div className={`h-48 ${CARD} animate-pulse`} />
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={PAGE}>
        <div className={WRAP}>
          <div className="rounded-2xl border border-dashed border-rose-400/30 bg-rose-500/[0.06] py-16 px-6 text-center">
            <h1 className="font-display text-2xl font-black uppercase text-rose-200">
              Squad not found
            </h1>
            <p className="mt-2 text-sm text-rose-100/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const locked = team.status === "APPROVED";
  const status = TEAM_STATUS[team.status];
  const uploaded = team.roster.reduce(
    (sum, player) =>
      sum + documents.filter((d) => d.rosterPlayerId === player.id).length,
    0,
  );
  const required = team.roster.length * 2;

  return (
    <div className={`${PAGE} animate-page-slide-in`}>
      <div className={`${WRAP} space-y-14`}>
        <div className="-mb-6 2xl:absolute 2xl:left-10 2xl:top-12 2xl:m-0">
          <BackLink href="/tournaments" label="Back" useHistory />
        </div>

        {/* Hero */}
        <section className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-end">
          <div className="min-w-0">
            <p className={EYEBROW}>
              <span className="h-px w-8 bg-primary-brand" />
              {team.event?.name ?? "Event"}
              {team.event?.gameTitle && (
                <span className="text-primary-brand">{team.event.gameTitle}</span>
              )}
            </p>
            <h1 className={`mt-5 ${HERO_TITLE} break-words`}>
              <span className="block text-white">{team.name}</span>
              <span className={HERO_OUTLINE}>Squad file</span>
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
              Captain <span className="text-white font-semibold">{team.captainName}</span>
              <span className="text-slate-600"> · </span>
              {team.captainEmail}
            </p>
          </div>

          {/* Status spotlight */}
          <div className={`relative overflow-hidden ${CARD}`}>
            <Image
              src={eventCover(team.event?.gameTitle)}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090F] via-[#07090F]/85 to-[#07090F]/30" />
            <span aria-hidden className={`absolute left-0 inset-y-0 w-1 ${status.bar}`} />

            <div className="relative flex min-h-[240px] flex-col justify-end p-6">
              <span
                className={`flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.25em] ${status.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${team.status === "PENDING" ? "animate-pulse" : ""}`} />
                Squad status
              </span>
              <h2 className={`mt-2 font-display text-3xl font-black uppercase leading-tight ${status.text}`}>
                {status.label}
              </h2>
              <p className="mt-1 text-sm text-slate-300">{STATUS_COPY[team.status]}</p>

              {team.reviewNote && (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/55 backdrop-blur-md px-4 py-3">
                  <p className={`${MONO_LABEL} mb-1`}>Note from the organizer</p>
                  <p className="text-sm text-white">{team.reviewNote}</p>
                </div>
              )}

              <div className="mt-5">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  <span>Documents uploaded</span>
                  <span className="text-white tabular-nums">
                    {uploaded}/{required}
                  </span>
                </div>
                <div className="mt-1.5 flex gap-1">
                  {Array.from({ length: required }, (_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        i < uploaded ? "bg-primary-brand shadow-[0_0_8px_var(--primary-brand)]" : "bg-white/15"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <UploadIcon className="w-5 h-5 text-primary-brand" />
                <h2 className={SECTION_TITLE}>Player documents</h2>
              </div>
              <p className="mt-2 max-w-xl text-sm text-slate-400">
                A PDF Certificate of Registration and a photo of the school ID
                for each player. Only the organizer can open them.
              </p>
            </div>
            <Link
              href={`/events/bracket/${team.eventId}`}
              className={`${TEXT_ACTION} text-primary-brand hover:text-white`}
            >
              View the bracket →
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
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
          </div>
        </section>
      </div>
    </div>
  );
}
