import { mockBoxScore } from "@/lib/mock/tournaments";
import Link from "next/link";

export default function BoxScorePage() {
  const { title, subtitle, team1, team2 } = mockBoxScore;

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
            {subtitle}
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
            {title}
          </h1>
          <p className="mt-4 font-sans text-sm text-secondary-text max-w-xl leading-relaxed">
            Individual player statistics for Tournament Mode matches. KDA = (Kills + Assists) / Deaths
          </p>
        </div>
        <div>
          <Link
            href="/tournaments/1/bracket"
            className="inline-flex h-10 items-center justify-center rounded border border-raised-panel bg-card-bg px-6 text-sm font-bold text-foreground transition-colors hover:bg-raised-panel"
          >
            Back to Bracket
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <div className="rounded border border-raised-panel bg-card-bg overflow-hidden">
          <div className="bg-background/40 border-b border-raised-panel px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-wider text-foreground">
              {team1.name} ({team1.code})
            </h2>
            <span className="rounded bg-success/15 px-3 py-1 font-sans text-2xs font-extrabold text-success tracking-wide uppercase">
              WIN
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-raised-panel bg-background/25 text-2xs font-bold tracking-widest text-secondary-text uppercase">
                  <th className="px-6 py-3">PLAYER</th>
                  <th className="px-6 py-3">ROLE / AGENT</th>
                  <th className="px-6 py-3 text-right">K</th>
                  <th className="px-6 py-3 text-right">D</th>
                  <th className="px-6 py-3 text-right">A</th>
                  <th className="px-6 py-3 text-right">KDA</th>
                  <th className="px-6 py-3 text-right">ACS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-raised-panel font-semibold">
                {team1.players.map((player) => (
                  <tr key={player.name} className="hover:bg-raised-panel/20 transition-colors">
                    <td className="px-6 py-4 text-foreground font-display text-base">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 text-secondary-text">
                      {player.role} / <span className="text-foreground">{player.agent}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-foreground">
                      {player.kills}
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-secondary-text">
                      {player.deaths}
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-secondary-text">
                      {player.assists}
                    </td>
                    <td className="px-6 py-4 text-right text-success">
                      {player.kda.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-foreground">
                      {player.acs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border border-raised-panel bg-card-bg overflow-hidden">
          <div className="bg-background/40 border-b border-raised-panel px-6 py-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold tracking-wider text-foreground">
              {team2.name} ({team2.code})
            </h2>
            <span className="rounded bg-error/15 px-3 py-1 font-sans text-2xs font-extrabold text-error tracking-wide uppercase">
              LOSS
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead>
                <tr className="border-b border-raised-panel bg-background/25 text-2xs font-bold tracking-widest text-secondary-text uppercase">
                  <th className="px-6 py-3">PLAYER</th>
                  <th className="px-6 py-3">ROLE / AGENT</th>
                  <th className="px-6 py-3 text-right">K</th>
                  <th className="px-6 py-3 text-right">D</th>
                  <th className="px-6 py-3 text-right">A</th>
                  <th className="px-6 py-3 text-right">KDA</th>
                  <th className="px-6 py-3 text-right">ACS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-raised-panel font-semibold">
                {team2.players.map((player) => (
                  <tr key={player.name} className="hover:bg-raised-panel/20 transition-colors">
                    <td className="px-6 py-4 text-foreground font-display text-base">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 text-secondary-text">
                      {player.role} / <span className="text-foreground">{player.agent}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-foreground">
                      {player.kills}
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-secondary-text">
                      {player.deaths}
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-secondary-text">
                      {player.assists}
                    </td>
                    <td className="px-6 py-4 text-right text-foreground">
                      {player.kda.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-display text-base text-foreground">
                      {player.acs}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
