import { MatchScoreHeroProps } from "@/types";
import { getUniversityBranding } from "@/lib/universityBranding";
import { CrownIcon } from "@/components/ui/Icons";
import HomeCrest from "@/components/home/HomeCrest";

const brandOf = (name: string) => getUniversityBranding(name, name.toLowerCase().replace(/[^a-z]/g, ""));

/** Scoreboard header: both schools in their colors, kills (or VS) in the middle. */
export default function MatchScoreHero({
  team1Name,
  team2Name,
  team1Kills,
  team2Kills,
  isTeam1Winner,
  isTeam2Winner,
  isLive,
}: MatchScoreHeroProps) {
  const played = team1Kills !== null && team2Kills !== null;
  const c1 = brandOf(team1Name).primary;
  const c2 = brandOf(team2Name).primary;

  const side = (name: string, won: boolean, lost: boolean, align: "left" | "right") => (
    <div className={`flex min-w-0 items-center gap-4 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div className="relative shrink-0">
        <HomeCrest name={name} size="lg" />
        {won && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow-[0_0_16px_rgba(251,191,36,0.7)]">
            <CrownIcon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className={`font-display text-lg sm:text-2xl font-black uppercase leading-tight ${lost ? "text-slate-400" : "text-white"}`}>
          {name}
        </p>
        <p
          className={`mt-1 font-mono text-[10px] font-black uppercase tracking-[0.25em] ${
            won ? "text-amber-300" : lost ? "text-slate-500" : isLive ? "text-rose-300" : "text-slate-500"
          }`}
        >
          {won ? "Victory" : lost ? "Defeat" : isLive ? "In game" : "Starting lineup"}
        </p>
      </div>
    </div>
  );

  return (
    <section
      className="relative overflow-hidden border border-white/[0.06] px-5 py-7 sm:px-8"
      style={{
        background: `linear-gradient(100deg, color-mix(in srgb, ${c1} 26%, #0A0D18) 0%, #0A0D18 38%, #0A0D18 62%, color-mix(in srgb, ${c2} 26%, #0A0D18) 100%)`,
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {side(team1Name, played && isTeam1Winner, played && isTeam2Winner, "left")}

        <div className="flex flex-col items-center">
          {played ? (
            <>
              <div className="flex items-center gap-4 font-display text-5xl sm:text-6xl font-black tabular-nums leading-none">
                <span className={isTeam1Winner ? "text-white" : "text-slate-500"}>{team1Kills}</span>
                <span className="text-2xl text-slate-600">:</span>
                <span className={isTeam2Winner ? "text-white" : "text-slate-500"}>{team2Kills}</span>
              </div>
              <span className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Total kills</span>
            </>
          ) : (
            <>
              <span className="font-display text-4xl font-black text-white/90">VS</span>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.25em] ${
                  isLive ? "border-rose-500/50 bg-rose-500/15 text-rose-300" : "border-white/10 text-slate-400"
                }`}
              >
                {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />}
                {isLive ? "Live now" : "Upcoming"}
              </span>
            </>
          )}
        </div>

        {side(team2Name, played && isTeam2Winner, played && isTeam1Winner, "right")}
      </div>
    </section>
  );
}
