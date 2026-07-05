import { mockBracket } from "@/lib/mock/tournaments";
import Link from "next/link";

export default function BracketPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
            SINGLE ELIMINATION • 8 TEAMS
          </span>
          <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-foreground mt-2">
            TOURNAMENT BRACKET
          </h1>
        </div>
        <div>
          <Link
            href="/tournaments/1/box-score"
            className="inline-flex h-10 items-center justify-center rounded border border-raised-panel bg-card-bg px-6 text-sm font-bold text-foreground transition-colors hover:bg-raised-panel"
          >
            View Match Box Score
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto pb-8">
        <div className="flex min-w-[1000px] gap-8 justify-between relative">
          {mockBracket.map((round) => (
            <div key={round.name} className="flex-1 flex flex-col gap-6">
              <h2 className="font-display text-base font-bold tracking-widest text-secondary-text border-b border-raised-panel pb-3 mb-2 uppercase text-center">
                {round.name}
              </h2>
              <div className="flex flex-col justify-around flex-grow gap-8">
                {round.matches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded border border-raised-panel bg-card-bg p-4 flex flex-col gap-3 shadow-md hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex flex-col gap-2 font-sans text-sm">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            match.team1.isWinner ? "text-foreground" : "text-secondary-text"
                          }`}
                        >
                          {match.team1.name}
                        </span>
                        <span className="font-display font-bold text-foreground">
                          {match.team1.score}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold ${
                            match.team2.isWinner ? "text-foreground" : "text-secondary-text"
                          }`}
                        >
                          {match.team2.name}
                        </span>
                        <span className="font-display font-bold text-foreground">
                          {match.team2.score}
                        </span>
                      </div>
                    </div>
                    {match.timeLabel && (
                      <div className="border-t border-raised-panel pt-2 flex items-center justify-between">
                        <span className="font-sans text-3xs font-extrabold text-secondary-text uppercase tracking-widest">
                          {match.timeLabel}
                        </span>
                        <Link
                          href="/tournaments/1/box-score"
                          className="font-sans text-2xs font-extrabold text-primary-brand hover:underline uppercase tracking-wide"
                        >
                          Box Score &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex-1 flex flex-col gap-6">
            <h2 className="font-display text-base font-bold tracking-widest text-primary-brand border-b border-raised-panel pb-3 mb-2 uppercase text-center">
              CHAMPION
            </h2>
            <div className="flex items-center justify-center flex-grow">
              <div className="rounded border-2 border-primary-brand bg-card-bg p-6 flex flex-col items-center gap-4 text-center shadow-lg max-w-[240px]">
                <div className="rounded-full bg-primary-brand/10 p-4 text-primary-brand">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="font-sans text-3xs font-extrabold tracking-widest text-secondary-text uppercase">
                    WINNER
                  </span>
                  <h3 className="font-display text-lg font-bold text-foreground tracking-wide mt-1">
                    UNIVERSITY OF MAKATI
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
