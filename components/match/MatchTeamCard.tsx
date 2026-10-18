import Link from "next/link";
import { MatchAthleteLinkProps, MatchPlayerStat, MatchRosterRowProps, MatchStatRowProps, MatchTeamCardProps } from "@/types";
import { CrownIcon } from "@/components/ui/Icons";
import HomeCrest from "@/components/home/HomeCrest";

const kda = (p: MatchPlayerStat) => (p.kills + p.assists) / Math.max(1, p.deaths);

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** Wraps a row in a profile link when the athlete is a registered user. */
function AthleteLink({ userId, className, children }: MatchAthleteLinkProps) {
  return userId ? (
    <Link href={`/athlete/${userId}`} className={`group/athlete ${className} hover:bg-white/[0.04]`}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );
}

function RosterRow({ member, index }: MatchRosterRowProps) {
  const name = member.displayName || member.gameHandle || `Player ${index + 1}`;
  const sub = [member.gameHandle !== name ? member.gameHandle : null, member.preferredRole].filter(Boolean).join(" · ");
  return (
    <AthleteLink userId={member.userId} className="flex items-center gap-3 px-4 py-2.5 transition-colors">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] font-display text-xs font-black text-slate-200">
        {initials(name)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-sans text-sm font-bold text-white group-hover/athlete:text-primary-brand">{name}</span>
          {member.isCaptain && (
            <span className="shrink-0 border border-amber-400/40 bg-amber-400/10 px-1.5 font-mono text-[8px] font-black uppercase tracking-widest text-amber-300">
              Capt
            </span>
          )}
        </span>
        {sub && <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-slate-500">{sub}</span>}
      </span>
      {member.userId && (
        <span className="shrink-0 font-mono text-[9px] font-black uppercase tracking-widest text-slate-600 transition-colors group-hover/athlete:text-primary-brand">
          Profile →
        </span>
      )}
    </AthleteLink>
  );
}

function StatRow({ p, maxKda }: MatchStatRowProps) {
  const value = kda(p);
  const isMvp = maxKda > 0 && value === maxKda;
  return (
    <AthleteLink
      userId={p.userId}
      className={`grid grid-cols-[minmax(0,1fr)_2rem_2rem_2rem_4.5rem] items-center gap-2 px-4 py-2.5 transition-colors ${isMvp ? "bg-amber-400/[0.06]" : ""}`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {isMvp && <CrownIcon className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
        <span className="min-w-0">
          <span className={`block truncate font-sans text-sm font-bold group-hover/athlete:text-primary-brand ${isMvp ? "text-amber-300" : "text-white"}`}>
            {p.name}
          </span>
          {p.displayName && p.displayName !== p.name && (
            <span className="block truncate font-mono text-[10px] text-slate-500">{p.displayName}</span>
          )}
        </span>
      </span>
      <span className="text-center font-mono text-sm font-bold text-white">{p.kills}</span>
      <span className="text-center font-mono text-sm text-slate-400">{p.deaths}</span>
      <span className="text-center font-mono text-sm text-slate-400">{p.assists}</span>
      <span className="flex flex-col items-end gap-1">
        <span className="font-mono text-xs font-black text-emerald-400">{value.toFixed(2)}</span>
        <span className="h-1 w-full overflow-hidden bg-white/[0.06]">
          <span className="block h-full bg-emerald-400/70" style={{ width: `${maxKda > 0 ? (value / maxKda) * 100 : 0}%` }} />
        </span>
      </span>
    </AthleteLink>
  );
}

export default function MatchTeamCard({ name, isWinner, isPlayed, isLive, players, roster, maxKda }: MatchTeamCardProps) {
  const status = !isPlayed ? (isLive ? "Active roster" : "Starting lineup") : isWinner ? "Winner" : "Defeated";
  const sorted = [...players].sort((a, b) => kda(b) - kda(a));

  return (
    <section className={`overflow-hidden border bg-[#0A0D18] ${isPlayed && isWinner ? "border-amber-400/30" : "border-white/[0.06]"}`}>
      <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <span className="flex min-w-0 items-center gap-3">
          <HomeCrest name={name} />
          <span className="truncate font-display text-base font-black uppercase tracking-wide text-white">{name}</span>
        </span>
        <span
          className={`shrink-0 font-mono text-[9px] font-black uppercase tracking-[0.2em] ${
            !isPlayed ? (isLive ? "text-rose-300" : "text-slate-500") : isWinner ? "text-amber-300" : "text-slate-500"
          }`}
        >
          {status}
        </span>
      </header>

      {isPlayed ? (
        <>
          <div className="grid grid-cols-[minmax(0,1fr)_2rem_2rem_2rem_4.5rem] gap-2 border-b border-white/[0.04] px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-500">
            <span>Athlete</span>
            <span className="text-center">K</span>
            <span className="text-center">D</span>
            <span className="text-center">A</span>
            <span className="text-right">KDA</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {sorted.map((p, i) => (
              <StatRow key={`${p.name}-${i}`} p={p} maxKda={maxKda} />
            ))}
          </div>
        </>
      ) : roster && roster.length > 0 ? (
        <div className="divide-y divide-white/[0.04]">
          {roster.map((m, i) => (
            <RosterRow key={m.userId ?? `${m.displayName}-${i}`} member={m} index={i} />
          ))}
        </div>
      ) : (
        <p className="px-4 py-10 text-center text-xs text-slate-500">
          {isLive ? "Lineup not posted yet." : "No roster submitted for this match."}
        </p>
      )}
    </section>
  );
}
