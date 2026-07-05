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
      tournaments: "18 tournaments",
      teams: "24 teams",
      image: "/valorant.png",
    },
    {
      title: "LEAGUE OF LEGENDS",
      tournaments: "11 tournaments",
      teams: "16 teams",
      image: "/lol.png",
    },
    {
      title: "MOBILE LEGENDS: BANG BANG",
      tournaments: "21 tournaments",
      teams: "30 teams",
      image: "/mlbb.png",
    },
    {
      title: "CALL OF DUTY: MOBILE",
      tournaments: "9 tournaments",
      teams: "12 teams",
      image: "/codm.png",
    },
  ];

  const matches = [
    {
      team1: { code: "UST", name: "Salinggawi", score: 2 },
      team2: { code: "FEU", name: "Tamaraws", score: 0 },
    },
    {
      team1: { code: "NU", name: "Bulldogs", score: 1 },
      team2: { code: "ADU", name: "Falcons", score: 2 },
    },
  ];

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-r from-[#CC0000]/25 from-0% to-[#0A0C10] to-[40%]">
      <section className="mx-auto max-w-[1800px] w-full px-6 md:px-10 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="font-sans text-xs font-400 tracking-widest text-secondary-brand uppercase mb-6 flex items-center gap-2">
              <span className="h-0.5 w-6 bg-secondary-brand" />
              PHILIPPINE COLLEGIATE ESPORTS CIRCUIT
            </span>
            <h1 className="font-display text-4xl md:text-5xl xl:text-6xl font-semibold tracking-tight text-foreground leading-none">
              ONE CIRCUIT.<br />
              <span className="whitespace-nowrap">EVERY <span className="text-primary-brand">UNIVERSITY.</span></span><br />
              EVERY GAME.
            </h1>
            <p className="mt-6 max-w-lg font-sans text-sm md:text-base text-secondary-text leading-relaxed">
              Collegium brings scrim scheduling, tournament brackets, and live rankings for Valorant, League of Legends, MLBB, and CODM into a single home for the collegiate scene.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/tournaments"
                className="inline-flex h-12 items-center justify-center rounded bg-primary-brand px-6 text-sm font-400 text-foreground transition-colors hover:bg-opacity-90"
              >
                Explore Tournaments
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded border border-raised-panel bg-transparent px-6 text-sm font-400 text-foreground transition-colors hover:bg-raised-panel"
              >
                Register Your Team
              </Link>
            </div>

            <div className="mt-16 w-full pt-8">
              <div className="flex flex-wrap gap-12">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="font-display text-2xl text-foreground">
                      {stat.value}
                    </span>
                    <span className="mt-1 font-sans tracking-widest text-secondary-text uppercase">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 w-full lg:mt-24">
            <div className="rounded-lg border border-raised-panel bg-card-bg/15 p-6 shadow-xl backdrop-blur-xs">
              <div className="flex items-center justify-between gap-3 text-xs font-400 uppercase tracking-wider mb-6">
                <span className="text-secondary-text whitespace-nowrap">UAAP–NCAA INVITATIONAL · VALORANT</span>
                <span className="text-secondary-text whitespace-nowrap">SEMIFINALS</span>
              </div>

              <div className="flex flex-col gap-4">
                {matches.map((m) => {
                  const t1Wins = m.team1.score > m.team2.score;
                  return (
                    <div
                      key={m.team1.code}
                      className="flex items-center gap-3 font-sans text-sm"
                    >
                      <div
                        className={`flex-1 min-w-0 grid grid-cols-[auto_1fr_auto] items-center gap-2 border rounded px-4 py-2.5 bg-card-bg ${
                          t1Wins ? "border-secondary-brand" : "border-raised-panel"
                        }`}
                      >
                        <span className="text-3xs text-secondary-text font-400 whitespace-nowrap">
                          {m.team1.code}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {m.team1.name}
                        </span>
                        <span
                          className={`font-display font-400 justify-self-end ${
                            t1Wins ? "text-secondary-brand" : "text-foreground"
                          }`}
                        >
                          {m.team1.score}
                        </span>
                      </div>
                      <span className="shrink-0 text-2xs text-secondary-text px-1 lowercase">vs</span>
                      <div
                        className={`flex-1 min-w-0 grid grid-cols-[auto_1fr_auto] items-center gap-2 border rounded px-4 py-2.5 bg-card-bg ${
                          !t1Wins ? "border-secondary-brand" : "border-raised-panel"
                        }`}
                      >
                        <span className="text-3xs text-secondary-text font-400 whitespace-nowrap">
                          {m.team2.code}
                        </span>
                        <span className="font-semibold text-foreground truncate">
                          {m.team2.name}
                        </span>
                        <span
                          className={`font-display font-400 justify-self-end ${
                            !t1Wins ? "text-secondary-brand" : "text-foreground"
                          }`}
                        >
                          {m.team2.score}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-2 border border-secondary-brand bg-card-bg rounded px-6 py-4 flex items-center justify-center gap-6 font-sans">
                  <span className="font-display text-sm font-400 tracking-wider text-secondary-text text-opacity-95">
                    GRAND FINAL
                  </span>
                  <span className="font-display text-xs font-400 text-secondary-text tracking-widest uppercase">
                    Sat - 3:00PM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1800px] w-full px-10 md:px-10 lg:px-16">
          <hr className="border-t border-raised-panel mb-12" />
          <div className="mb-12">
            <span className="font-sans text-3xl font-bold tracking-widest  uppercase">
              FEATURED GAMES
            </span>
            <h2 className="font-display text-2xs font-400 tracking-tight text-primary-brand mt-2">
              Multi-game competition, all in one home.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredGames.map((game) => (
              <div
                key={game.title}
                className="relative flex flex-col justify-between rounded-xl border border-raised-panel bg-card-bg p-4"
              >
                <div>
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full aspect-[16/9] object-cover rounded-xl mb-4"
                  />
                  <h3 className="font-display text-base font-400 tracking-wide text-foreground px-1 mb-3">
                    {game.title}
                  </h3>
                  <ul className="space-y-1 text-xs text-secondary-text font-sans px-1">
                    <li className="flex items-center gap-1.5">
                      <span className="text-primary-brand font-400">•</span>
                      <span>{game.tournaments}</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-primary-brand font-400">•</span>
                      <span>{game.teams}</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 border-t border-raised-panel/50 pt-4 flex items-center justify-between px-1">
                  <span className="font-sans text-xs font-bold text-foreground tracking-wide uppercase">
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
