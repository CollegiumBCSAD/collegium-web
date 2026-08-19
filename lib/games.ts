import { GameId, GameInfo } from "@/types";

export type { GameId, GameInfo };

export const GAMES: Record<GameId, GameInfo> = {
  valo: {
    id: "valo",
    name: "VALORANT",
    shortName: "VALO",
    subtitle: "Tactical 5v5 Character-Based Shooter",
    tagline: "DEFY THE LIMITS",
    publisher: "Riot Games",
    image: "/valorant.png",
    accentColor: "#E53A4C",
    borderColor: "border-[#E53A4C]",
    activeTournaments: 18,
    activeTeams: 24,
    genre: "Tactical FPS",
  },
  lol: {
    id: "lol",
    name: "LEAGUE OF LEGENDS",
    shortName: "LoL",
    subtitle: "Strategic Multiplayer Online Battle Arena",
    tagline: "WELCOME TO THE RIFT",
    publisher: "Riot Games",
    image: "/lol.png",
    accentColor: "#00A3FF",
    borderColor: "border-[#00A3FF]",
    activeTournaments: 11,
    activeTeams: 16,
    genre: "MOBA",
  },
  codm: {
    id: "codm",
    name: "CALL OF DUTY: MOBILE",
    shortName: "CODM",
    subtitle: "High-Octane First-Person Tactical Shooter",
    tagline: "CALL THE SHOTS",
    publisher: "Activision",
    image: "/codm.png",
    accentColor: "#FFFFFF",
    borderColor: "border-[#FFFFFF]",
    activeTournaments: 9,
    activeTeams: 12,
    genre: "Mobile FPS",
  },
  ml: {
    id: "ml",
    name: "MOBILE LEGENDS: BANG BANG",
    shortName: "MLBB",
    subtitle: "5v5 Mobile MOBA Action",
    tagline: "BE LEGENDARY",
    publisher: "Moonton",
    image: "/mlbb.png",
    accentColor: "#F59E0B",
    borderColor: "border-[#F59E0B]",
    activeTournaments: 21,
    activeTeams: 30,
    genre: "Mobile MOBA",
  },
};

export function getGameInfo(gameTitle?: string): GameInfo {
  if (!gameTitle) return GAMES.valo;
  const key = gameTitle.toLowerCase();
  if (key.includes("val") || key === "valorant") return GAMES.valo;
  if (key === "lol" || key.includes("league")) return GAMES.lol;
  if (key === "codm" || key.includes("call")) return GAMES.codm;
  if (key === "ml" || key === "mlbb" || key.includes("mobile")) return GAMES.ml;
  return GAMES[gameTitle as GameId] || GAMES.valo;
}

export const GAME_LIST: GameInfo[] = [
  GAMES.valo,
  GAMES.lol,
  GAMES.codm,
  GAMES.ml,
];

export const STORAGE_KEY = "collegium_selected_game";
