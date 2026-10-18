import Link from "next/link";
import Image from "next/image";
import { IntraEventCardProps } from "@/types";
import { LockIcon } from "@/components/ui/Icons";
import { CARD, EVENT_STATUS, GAME_LABEL, eventCover } from "./eventSurfaces";

const FORMAT: Record<string, string> = {
  SINGLE_ELIM: "Single Elimination",
  DOUBLE_ELIM: "Double Elimination",
  ROUND_ROBIN: "Round Robin",
  TWO_STAGE: "Two Stage",
};

/** Spectator card for an intra (invite-only) event; opens its public bracket. */
export default function IntraEventCard({ event }: IntraEventCardProps) {
  const status = EVENT_STATUS[event.status];
  const live = event.status === "ONGOING";
  const stats = [
    { label: "Format", value: FORMAT[event.bracketFormat] ?? event.bracketFormat },
    { label: "Squads", value: event._count.teams },
    { label: "Host", value: event.organizer.displayName },
  ];

  return (
    <Link
      href={`/events/bracket/${event.id}`}
      className={`group relative flex flex-col overflow-hidden sm:flex-row ${CARD} transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.16] ${
        live ? "ring-1 ring-primary-brand/30" : ""
      }`}
    >
      <div className="relative h-36 shrink-0 overflow-hidden sm:h-auto sm:w-64">
        <Image
          src={eventCover(event.gameTitle)}
          alt=""
          fill
          sizes="(min-width: 640px) 256px, 100vw"
          className="object-cover opacity-60 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#090C14]" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            {GAME_LABEL[event.gameTitle] ?? event.gameTitle}
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-200 backdrop-blur-md">
            <LockIcon className="h-2.5 w-2.5" /> Intra
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <span className={`flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] ${status.className}`}>
          {status.pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {status.label}
        </span>
        <h3 className="mt-1.5 truncate font-display text-2xl font-black uppercase leading-tight tracking-tight text-white transition-colors group-hover:text-primary-brand">
          {event.name}
        </h3>

        <dl className="mt-4 grid grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.label} className={`min-w-0 ${i > 0 ? "border-l border-white/[0.07] pl-4" : "pr-4"}`}>
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-slate-500">{s.label}</dt>
              <dd className="mt-1 truncate font-display text-base font-black text-white">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <span className="text-xs text-slate-500">Department cup · doesn&apos;t affect rankings</span>
          <span className="game-theme-btn h-9 shrink-0 gap-2 px-4 text-[11px]">
            {live ? "Watch bracket" : "View bracket"} <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
