import Link from "next/link";

export default function LandingPage() {
  const stats = [
    { value: "48", label: "UNIVERSITIES" },
    { value: "312", label: "ACTIVE TEAMS" },
    { value: "1,204", label: "MATCHES LOGGED" },
  ];

  const featuredGames = [
    {
      title: "VALORANT",
      tournaments: "11 tournaments",
      teams: "16 teams",
      active: true,
    },
    {
      title: "LEAGUE OF LEGENDS",
      tournaments: "18 tournaments",
      teams: "24 teams",
      active: false,
    },
    {
      title: "MOBILE LEGENDS: BANG BANG",
      tournaments: "21 tournaments",
      teams: "30 teams",
      active: false,
    },
    {
      title: "CALL OF DUTY: MOBILE",
      tournaments: "9 tournaments",
      teams: "12 teams",
      active: false,
    },
  ];

  return (
    <div className="flex flex-col flex-1">
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
          <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase mb-4">
            PHILIPPINE COLLEGIATE ESPORTS CIRCUIT
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl leading-tight">
            ONE CIRCUIT.<br />EVERY UNIVERSITY.<br />EVERY GAME.
          </h1>
          <p className="mt-6 max-w-2xl font-sans text-base md:text-lg text-secondary-text leading-relaxed">
            Collegium brings scrim scheduling, tournament brackets, and live rankings for Valorant, League of Legends, MLBB, and CODM into a single home for the collegiate scene.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded bg-primary-brand px-6 text-sm font-bold text-foreground transition-colors hover:bg-opacity-95"
            >
              Register Your Team
            </Link>
            <Link
              href="/tournaments"
              className="inline-flex h-12 items-center justify-center rounded border border-raised-panel bg-card-bg px-6 text-sm font-bold text-foreground transition-colors hover:bg-raised-panel"
            >
              Explore Tournaments
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-raised-panel bg-card-bg/50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="font-display text-5xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="mt-2 font-sans text-xs font-bold tracking-widest text-secondary-text">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
              UAAP–NCAA INVITATIONAL · VALORANT
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mt-2">
              FEATURED MATCHES
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="rounded border border-raised-panel bg-card-bg p-6">
              <div className="flex items-center justify-between border-b border-raised-panel pb-4">
                <span className="font-sans text-xs font-bold tracking-widest text-secondary-text uppercase">
                  SEMIFINALS
                </span>
                <span className="rounded bg-raised-panel px-2.5 py-0.5 font-sans text-2xs font-bold text-success uppercase">
                  Completed
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-base font-semibold text-foreground">Salinggawi</span>
                    <span className="font-sans text-xs text-secondary-text">UST</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-base font-semibold text-secondary-text">Falcons</span>
                    <span className="font-sans text-xs text-secondary-text">ADU</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pl-6 border-l border-raised-panel">
                  <span className="font-display text-xl font-bold text-foreground">2</span>
                  <span className="font-display text-xl font-bold text-secondary-text">0</span>
                </div>
              </div>
            </div>

            <div className="rounded border border-raised-panel bg-card-bg p-6">
              <div className="flex items-center justify-between border-b border-raised-panel pb-4">
                <span className="font-sans text-xs font-bold tracking-widest text-secondary-text uppercase">
                  GRAND FINAL
                </span>
                <span className="rounded bg-primary-brand/10 px-2.5 py-0.5 font-sans text-2xs font-bold text-primary-brand uppercase">
                  Sat - 3:00PM
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-base font-semibold text-foreground">Tamaraws</span>
                    <span className="font-sans text-xs text-secondary-text">FEU</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-base font-semibold text-foreground">Bulldogs</span>
                    <span className="font-sans text-xs text-secondary-text">NU</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4 pl-6 border-l border-raised-panel items-center justify-center min-w-[32px]">
                  <span className="font-display text-sm font-bold text-secondary-text">VS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card-bg/35 border-t border-raised-panel py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12">
            <span className="font-sans text-xs font-bold tracking-widest text-primary-brand uppercase">
              FEATURED GAMES
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mt-2">
              Multi-game competition, all in one home.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredGames.map((game) => (
              <div
                key={game.title}
                className="relative flex flex-col justify-between rounded border border-raised-panel bg-card-bg p-6"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold tracking-wide text-foreground">
                      {game.title}
                    </h3>
                    {game.active && (
                      <span className="rounded bg-success/15 px-2 py-0.5 font-sans text-3xs font-extrabold text-success tracking-wide uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="mt-6 flex flex-col gap-1 text-xs text-secondary-text font-sans">
                    <span>{game.tournaments}</span>
                    <span>{game.teams}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
