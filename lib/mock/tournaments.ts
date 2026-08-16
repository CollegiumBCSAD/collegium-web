import {
  TeamInMatch,
  Tournament,
  TournamentMatch,
  BracketRound,
  PlayerStats,
  MatchBoxScore,
} from "@/types";

export type {
  TeamInMatch,
  Tournament,
  TournamentMatch,
  BracketRound,
  PlayerStats,
  MatchBoxScore,
};

export const mockTournaments: Tournament[] = [
  {
    id: "1",
    title: "UNIVERSITY CIRCUIT OPEN",
    game: "VALORANT",
    status: "COMPLETED",
    statusText: "Final standings published",
    bulletPoints: ["8 participating teams", "Eliminations"],
    image: "/valorant.png",
    bgGradient: "from-[#8E2632] via-[#48161D] to-[#11141C]",
  },
  {
    id: "2",
    title: "Campus Clash Invitational",
    game: "LEAGUE OF LEGENDS",
    status: "UPCOMING",
    statusText: "Registration closes in 10 days",
    bulletPoints: ["8 participating teams", "Round robin format"],
    image: "/lol.png",
    bgGradient: "from-[#233568] via-[#141C38] to-[#11141C]",
  },
  {
    id: "3",
    title: "METRO LEAGUE FINALS",
    game: "MOBILE LEGENDS: BANG BANG",
    status: "UPCOMING",
    statusText: "Registration closes in 4 days",
    bulletPoints: ["8 participating teams", "Best-of-5 finals"],
    image: "/mlbb.png",
    bgGradient: "from-[#8E6519] via-[#42300E] to-[#11141C]",
  },
];

export const mockBracket: BracketRound[] = [
  {
    name: "QUARTERFINALS",
    matches: [
      {
        id: "m1",
        team1: { name: "University Of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "FEU Tamaraws", code: "FEU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m2",
        team1: { name: "Ateneo Eagles", code: "ADMU", score: 2, isWinner: true },
        team2: { name: "UP Fighting Maroons", code: "UP", score: 1, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m3",
        team1: { name: "UST Growling Tigers", code: "UST", score: 2, isWinner: true },
        team2: { name: "Mapúa Marauders", code: "MU", score: 1, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m4",
        team1: { name: "DLSU Green Archers", code: "DLSU", score: 2, isWinner: true },
        team2: { name: "Adamson Falcons", code: "AdU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
    ],
  },
  {
    name: "SEMIFINALS",
    matches: [
      {
        id: "m5",
        team1: { name: "University Of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "Ateneo Eagles", code: "ADMU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m6",
        team1: { name: "UST Growling Tigers", code: "UST", score: 1, isWinner: false },
        team2: { name: "DLSU Green Archers", code: "DLSU", score: 2, isWinner: true },
        status: "COMPLETED",
      },
    ],
  },
  {
    name: "GRAND FINALS",
    matches: [
      {
        id: "m7",
        team1: { name: "University Of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "DLSU Green Archers", code: "DLSU", score: 1, isWinner: false },
        status: "COMPLETED",
        timeLabel: "Bo3",
      },
    ],
  },
];

export const mockBoxScore: MatchBoxScore = {
  title: "MATCH BOX SCORE",
  subtitle: "Valorant • Grand Finals • Bo3",
  team1: {
    name: "University Of Makati",
    code: "UMak",
    players: [
      { name: "Dyeel", role: "Duelist", agent: "Reyna", kills: 25, deaths: 18, assists: 5, kda: 1.67, acs: 295 },
      { name: "rinkinn", role: "Flex", agent: "Jett", kills: 17, deaths: 15, assists: 6, kda: 1.53, acs: 218 },
      { name: "Ychann", role: "Initiator", agent: "Sova", kills: 16, deaths: 13, assists: 9, kda: 1.92, acs: 205 },
      { name: "kcee", role: "Sentinel", agent: "Killjoy", kills: 14, deaths: 19, assists: 8, kda: 1.16, acs: 182 },
      { name: "LEB", role: "Controller", agent: "Omen", kills: 18, deaths: 11, assists: 10, kda: 2.55, acs: 215 },
    ],
  },
  team2: {
    name: "DLSU Green Archers",
    code: "DLSU",
    players: [
      { name: "Striker", role: "Duelist", agent: "Jett", kills: 28, deaths: 14, assists: 7, kda: 2.50, acs: 332 },
      { name: "Bulldog", role: "Controller", agent: "Astra", kills: 18, deaths: 16, assists: 12, kda: 1.88, acs: 268 },
      { name: "Phantom", role: "Initiator", agent: "Skye", kills: 15, deaths: 17, assists: 13, kda: 1.65, acs: 248 },
      { name: "Saber", role: "Sentinel", agent: "Chamber", kills: 16, deaths: 18, assists: 8, kda: 1.33, acs: 208 },
      { name: "Vortex", role: "Flex", agent: "Neon", kills: 19, deaths: 20, assists: 9, kda: 1.40, acs: 242 },
    ],
  },
};
