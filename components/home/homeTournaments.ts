import { GameId, Tournament } from "@/types";

const MATCHERS: Record<GameId, (g: string) => boolean> = {
  valo: (g) => g.includes("val"),
  lol: (g) => g.includes("lol") || g.includes("league"),
  codm: (g) => g.includes("cod") || g.includes("call"),
  ml: (g) => g.includes("ml") || g.includes("mobile"),
};

const STATUS_ORDER: Record<string, number> = { LIVE: 0, UPCOMING: 1, OPEN: 1, COMPLETED: 3 };

/** The active game's tournaments, live first and finished last. Untagged ones count for every game. */
export const tournamentsForGame = (tournaments: Tournament[], game: GameId) =>
  tournaments
    .filter((t) => {
      const g = (t.gameTitle || t.game || "").toLowerCase();
      return !g || MATCHERS[game](g);
    })
    .sort((a, b) => (STATUS_ORDER[a.status] ?? 2) - (STATUS_ORDER[b.status] ?? 2));
