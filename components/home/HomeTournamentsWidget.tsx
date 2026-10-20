import Link from "next/link";
import Image from "next/image";
import { HomeTournamentsWidgetProps } from "@/types";
import { GAME_ID_TO_ENUM } from "@/lib/games";
import { eventCover } from "@/components/events/eventSurfaces";
import { tournamentsForGame } from "./homeTournaments";
import HomePanel from "./HomePanel";

const STATUS_STYLE: Record<string, string> = {
  LIVE: "border-primary-brand/50 bg-primary-brand/15 text-primary-brand",
  COMPLETED: "border-white/[0.06] text-slate-500",
};

export default function HomeTournamentsWidget({ tournaments, activeGame }: HomeTournamentsWidgetProps) {
  const shown = tournamentsForGame(tournaments, activeGame).slice(0, 4);
  const cover = eventCover(GAME_ID_TO_ENUM[activeGame]);

  return (
    <HomePanel title="Events" href="/tournaments" hrefLabel="All events">
      {shown.length === 0 ? (
        <p className="px-4 py-10 text-center text-xs text-slate-500">No tournaments in this circuit yet.</p>
      ) : (
        <ul className="divide-y divide-white/[0.04]">
          {shown.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tournaments/${t.id}`}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.025]"
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/[0.06]">
                  <Image
                    src={cover}
                    alt=""
                    fill
                    sizes="40px"
                    className={`object-cover transition-transform duration-500 group-hover:scale-110 ${t.status === "COMPLETED" ? "opacity-40 grayscale" : "opacity-80"}`}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-sans text-[13px] font-bold uppercase text-slate-100 transition-colors group-hover:text-white">
                    {t.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">{t.statusText || t.bulletPoints?.[0]}</span>
                </span>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest ${
                    STATUS_STYLE[t.status] ?? "border-white/10 bg-white/[0.04] text-slate-300"
                  }`}
                >
                  {t.status === "LIVE" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                  {t.status === "COMPLETED" ? "Final" : t.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </HomePanel>
  );
}
