import { HomeMatchRowProps, TeamInMatch } from "@/types";
import HomeCrest from "./HomeCrest";

const STATUS_CHIP = {
  LIVE: "border-primary-brand/50 bg-primary-brand/15 text-primary-brand",
  UPCOMING: "border-white/10 bg-white/[0.04] text-slate-300",
  COMPLETED: "border-white/[0.06] bg-transparent text-slate-500",
} as const;

const STATUS_LABEL = { LIVE: "Live", UPCOMING: "Upcoming", COMPLETED: "Final" } as const;

const clock = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : null;

/** One vlr.gg-style fixture: kickoff | both teams stacked with scores | event | status. */
export default function HomeMatchRow({ match, domains, onOpenBoxScore }: HomeMatchRowProps) {
  const status = (match.status in STATUS_LABEL ? match.status : "UPCOMING") as keyof typeof STATUS_LABEL;
  const isLive = status === "LIVE";
  const isDone = status === "COMPLETED";
  const s1 = match.team1.score ?? 0;
  const s2 = match.team2.score ?? 0;
  const won1 = Boolean(match.team1.isWinner || (isDone && s1 > s2));
  const won2 = Boolean(match.team2.isWinner || (isDone && s2 > s1));

  const line = (team: TeamInMatch, score: number, won: boolean) => (
    <div className="flex items-center gap-2.5">
      <HomeCrest name={team.name} domain={team.universityId ? domains[team.universityId] : undefined} size="sm" />
      <span
        className={`min-w-0 flex-1 truncate font-sans text-[13px] font-bold uppercase tracking-wide ${
          isDone && !won ? "text-slate-500" : "text-slate-100"
        }`}
      >
        {team.name}
      </span>
      <span
        className={`w-6 text-right font-display text-base font-black tabular-nums ${
          status === "UPCOMING" ? "text-slate-700" : won ? "text-white" : isLive ? "text-slate-200" : "text-slate-600"
        }`}
      >
        {status === "UPCOMING" ? "–" : score}
      </span>
    </div>
  );

  return (
    <button
      type="button"
      onClick={() => onOpenBoxScore(match)}
      className={`group relative grid w-full grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-4 border-b border-white/[0.04] px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-white/[0.025] md:grid-cols-[3.75rem_minmax(0,1fr)_12rem_5.5rem] ${
        isLive ? "bg-primary-brand/[0.04]" : ""
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-0 left-0 w-[2px] transition-colors ${isLive ? "bg-primary-brand" : "bg-transparent group-hover:bg-primary-brand/60"}`}
      />

      <span className="font-mono text-[11px] font-bold uppercase text-slate-400">
        {isLive ? <span className="text-primary-brand">Now</span> : (clock(match.playedAt) ?? "TBD")}
      </span>

      <div className="min-w-0 space-y-1.5">
        {line(match.team1, s1, won1)}
        {line(match.team2, s2, won2)}
      </div>

      <div className="hidden min-w-0 border-l border-white/[0.06] pl-4 md:block">
        <p className="truncate font-sans text-xs font-bold uppercase text-slate-300 transition-colors group-hover:text-white">
          {match.tournamentTitle || "Varsity match"}
        </p>
        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {match.stageName || "Playoffs"}
          {match.matchMode === "SCRIM" && <span className="text-cyan-400"> · Scrim</span>}
          {match.isForfeit && <span className="text-rose-400"> · Forfeit</span>}
        </p>
      </div>

      <span className="hidden justify-end md:flex">
        <span
          className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 font-mono text-[9px] font-black uppercase tracking-widest ${STATUS_CHIP[status]}`}
        >
          {isLive && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
          {isDone ? <span className="group-hover:hidden">{STATUS_LABEL[status]}</span> : STATUS_LABEL[status]}
          {isDone && <span className="hidden text-slate-300 group-hover:inline">Stats →</span>}
        </span>
      </span>
    </button>
  );
}
