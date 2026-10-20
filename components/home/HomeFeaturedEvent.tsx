import Link from "next/link";
import Image from "next/image";
import { HomeFeaturedEventProps } from "@/types";
import { GAME_ID_TO_ENUM, GAMES } from "@/lib/games";
import { eventCover } from "@/components/events/eventSurfaces";

const KICKER: Record<string, string> = {
  LIVE: "Now live",
  COMPLETED: "Latest results",
};

/** Key-art card for the circuit's headline event: the live one if any, else the next up. */
export default function HomeFeaturedEvent({ tournament, activeGame }: HomeFeaturedEventProps) {
  const isLive = tournament?.status === "LIVE";

  return (
    <Link
      href={tournament ? `/tournaments/${tournament.id}` : "/tournaments"}
      className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E19] p-6 shadow-[0_30px_80px_-30px_rgba(var(--game-glow-rgb),0.45)] transition-colors hover:border-primary-brand/40"
    >
      <Image
        src={eventCover(GAME_ID_TO_ENUM[activeGame])}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 560px, 100vw"
        className="object-cover object-right opacity-70 transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-[#070A12]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#070A12]/90 via-[#070A12]/30 to-transparent" />

      <div className="relative">
        <span
          className={`inline-flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.25em] ${isLive ? "text-primary-brand" : "text-slate-300"}`}
        >
          {isLive && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-brand opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-brand" />
            </span>
          )}
          {tournament ? (KICKER[tournament.status] ?? "Up next") : `${GAMES[activeGame].shortName} circuit`}
        </span>
        <h2 className="mt-2 line-clamp-2 font-display text-3xl font-black uppercase leading-[0.95] text-white sm:text-4xl">
          {tournament?.title ?? "Season brackets"}
        </h2>
        <p className="mt-2 line-clamp-1 text-sm text-slate-300">
          {tournament?.statusText || "Browse every sanctioned collegiate event."}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary-brand px-4 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-primary-brand/30 transition-transform group-hover:translate-x-0.5">
          {tournament ? "Open bracket" : "View events"} <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
