import { GameId, HostGameTitle, HostTournamentDraft, Tournament } from "@/types";

export const HOST_GAMES: { title: HostGameTitle; gameId: GameId; label: string; art: string }[] = [
  { title: "VALORANT", gameId: "valo", label: "Valorant", art: "/valorant-art-1.png" },
  { title: "LOL", gameId: "lol", label: "League of Legends", art: "/lol-art-1.png" },
  { title: "MLBB", gameId: "ml", label: "Mobile Legends", art: "/ml-art-1.jpg" },
  { title: "CODM", gameId: "codm", label: "Call of Duty: Mobile", art: "/codm-art-1.png" },
];

export const HOST_FORMATS = [
  { value: "Single Elimination", blurb: "Lose once and you're out. Fastest to run." },
  { value: "Double Elimination", blurb: "Upper & lower brackets. Every team gets a second life." },
  { value: "Round Robin + Playoffs", blurb: "Everyone plays everyone, top seeds advance." },
];

export const HOST_QUOTAS = [8, 16, 32];

export function hostGameFor(title: string) {
  return HOST_GAMES.find((g) => g.title === title) ?? HOST_GAMES[0];
}

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function draftFrom(tournament: Tournament | null | undefined, fallbackGame: GameId | null): HostTournamentDraft {
  const fallbackTitle = HOST_GAMES.find((g) => g.gameId === fallbackGame)?.title ?? "VALORANT";
  if (!tournament) {
    return {
      gameTitle: fallbackTitle,
      name: "",
      bracketFormat: HOST_FORMATS[0].value,
      teamQuota: 8,
      startDate: "",
      rules: "",
      imagePreview: "",
      imageFile: null,
    };
  }
  return {
    gameTitle: (HOST_GAMES.find((g) => g.title === tournament.gameTitle)?.title ?? fallbackTitle) as HostGameTitle,
    name: tournament.title || "",
    bracketFormat: tournament.bracketFormat || HOST_FORMATS[0].value,
    teamQuota: tournament.teamQuota || 8,
    startDate: toLocalInput(tournament.startDate),
    rules: tournament.rules || "",
    imagePreview: tournament.image || "",
    imageFile: null,
  };
}

export function formatDraftStart(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
