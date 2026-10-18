import Link from "next/link";
import Image from "next/image";
import { HomeHeroStripProps } from "@/types";
import { TrophyIcon } from "@/components/ui/Icons";
import { tournamentsForGame } from "./homeTournaments";
import HomeFeaturedEvent from "./HomeFeaturedEvent";

/** The pitch, the circuit's headline numbers and the featured event, above the hub. */
export default function PublicHeroBroadcast({ activeGame, selectedGameInfo, openGameSelector, stats, tournaments }: HomeHeroStripProps) {
  const featured = tournamentsForGame(tournaments, activeGame)[0] ?? null;

  return (
    <section className="relative">
      <div className="mx-auto grid w-full max-w-[1600px] items-center gap-8 px-4 pb-6 pt-8 sm:px-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:gap-12 lg:pt-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-px w-8 bg-amber-400/70" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-amber-400">
              Philippine collegiate esports
            </span>
            {selectedGameInfo && (
              <button
                type="button"
                onClick={openGameSelector}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-200 transition-colors hover:border-primary-brand/60"
              >
                <Image src={selectedGameInfo.image} alt="" width={16} height={16} className="h-4 w-4 object-contain" />
                {selectedGameInfo.shortName}
                <span aria-hidden className="text-slate-500">
                  ▾
                </span>
              </button>
            )}
          </div>

          <h1 className="mt-5 font-display text-5xl font-black uppercase leading-[0.88] tracking-tight text-white sm:text-6xl xl:text-7xl">
            One circuit.
            <br />
            Every university.
            <br />
            <span className="bg-gradient-to-r from-primary-brand to-[rgba(var(--game-glow-rgb),0.55)] bg-clip-text text-transparent">
              Live telemetry.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-400">
            Official varsity brackets, real-time match scoring, player telemetry, and verified collegiate scrims across top Philippine
            universities.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/tournaments" className="game-theme-btn inline-flex h-11 items-center gap-2 px-5 text-xs">
              <TrophyIcon className="h-4 w-4" />
              <span>Explore brackets</span>
            </Link>
            <Link
              href="/community"
              className="inline-flex h-11 items-center rounded-md border border-white/10 bg-white/[0.03] px-5 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-200 transition-colors hover:border-white/25 hover:text-white"
            >
              Circuit news
            </Link>
          </div>

          <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{s.label}</dt>
                <dd className="font-display text-4xl font-black leading-none tabular-nums text-white">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HomeFeaturedEvent tournament={featured} activeGame={activeGame} />
      </div>
    </section>
  );
}
