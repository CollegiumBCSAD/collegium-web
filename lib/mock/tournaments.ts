import {
  TeamInMatch,
  Tournament,
  TournamentMatch,
  BracketRound,
} from "@/types";

export type { TeamInMatch, Tournament, TournamentMatch, BracketRound };

export const mockTournaments: Tournament[] = [
  // VALORANT Tournaments
  {
    id: "1",
    title: "UNIVERSITY CIRCUIT OPEN",
    game: "VALORANT",
    status: "COMPLETED",
    statusText: "Final standings published",
    bulletPoints: ["8 participating teams", "Double elimination playoffs"],
    image: "/valorant-art-1.png",
    bgGradient: "from-[#8E2632] via-[#48161D] to-[#11141C]",
  },
  {
    id: "v-open-2",
    title: "METRO MANILA VALORANT CLASH",
    game: "VALORANT",
    status: "LIVE",
    statusText: "Quarterfinals in progress",
    bulletPoints: ["16 participating universities", "Best of 3 series"],
    image: "/valorant-art-2.png",
    bgGradient: "from-[#8E2632] via-[#48161D] to-[#11141C]",
  },

  // LEAGUE OF LEGENDS Tournaments
  {
    id: "2",
    title: "Campus Clash Invitational",
    game: "LEAGUE OF LEGENDS",
    status: "UPCOMING",
    statusText: "Registration closes in 10 days",
    bulletPoints: ["8 participating teams", "Round robin & single elim"],
    image: "/lol-art-3.png",
    bgGradient: "from-[#233568] via-[#141C38] to-[#11141C]",
  },
  {
    id: "lol-major-2",
    title: "COLLEGIATE RIFT SHOWDOWN",
    game: "LEAGUE OF LEGENDS",
    status: "LIVE",
    statusText: "Group Stage Day 3",
    bulletPoints: ["12 participating universities", "Best-of-3 format"],
    image: "/lol-art-2.jpg",
    bgGradient: "from-[#233568] via-[#141C38] to-[#11141C]",
  },

  // MOBILE LEGENDS Tournaments
  {
    id: "3",
    title: "METRO LEAGUE FINALS",
    game: "MOBILE LEGENDS: BANG BANG",
    status: "UPCOMING",
    statusText: "Registration closes in 4 days",
    bulletPoints: ["8 participating teams", "Best-of-5 grand finals"],
    image: "/ml-art-3.jpg",
    bgGradient: "from-[#8E6519] via-[#42300E] to-[#11141C]",
  },
  {
    id: "ml-clash-2",
    title: "CAMPUS LEGENDS CHAMPIONSHIP",
    game: "MOBILE LEGENDS: BANG BANG",
    status: "LIVE",
    statusText: "Semifinals underway",
    bulletPoints: ["16 participating teams", "Live broadcast on Discord"],
    image: "/ml-art-2.png",
    bgGradient: "from-[#8E6519] via-[#42300E] to-[#11141C]",
  },

  // CALL OF DUTY: MOBILE Tournaments
  {
    id: "4",
    title: "VARSITY WARFARE CHAMPIONSHIPS",
    game: "CALL OF DUTY: MOBILE",
    status: "UPCOMING",
    statusText: "Registration open nationwide",
    bulletPoints: ["16 participating teams", "Search & Destroy, Hardpoint"],
    image: "/codm-art-2.jpg",
    bgGradient: "from-[#4B5563] via-[#1F2937] to-[#11141C]",
  },
  {
    id: "codm-major-2",
    title: "COLLEGIATE MAJOR: CODM",
    game: "CALL OF DUTY: MOBILE",
    status: "COMPLETED",
    statusText: "Final standings published",
    bulletPoints: ["8 participating universities", "LAN Finals Manila"],
    image: "/codm-art-3.jpg",
    bgGradient: "from-[#4B5563] via-[#1F2937] to-[#11141C]",
  },
];

// 1. Fully Completed Tournament Bracket (e.g. University Circuit Open)
export const mockCompletedBracket: BracketRound[] = [
  {
    name: "QUARTERFINALS",
    matches: [
      {
        id: "m1",
        team1: { name: "University of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "Far Eastern University", code: "FEU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m2",
        team1: { name: "Ateneo de Manila University", code: "ADMU", score: 2, isWinner: true },
        team2: { name: "University of the Philippines", code: "UP", score: 1, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m3",
        team1: { name: "University of Santo Tomas", code: "UST", score: 2, isWinner: true },
        team2: { name: "Mapúa University", code: "MU", score: 1, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m4",
        team1: { name: "De La Salle University", code: "DLSU", score: 2, isWinner: true },
        team2: { name: "Adamson University", code: "AdU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
    ],
  },
  {
    name: "SEMIFINALS",
    matches: [
      {
        id: "m5",
        team1: { name: "University of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "Ateneo de Manila University", code: "ADMU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "m6",
        team1: { name: "University of Santo Tomas", code: "UST", score: 1, isWinner: false },
        team2: { name: "De La Salle University", code: "DLSU", score: 2, isWinner: true },
        status: "COMPLETED",
      },
    ],
  },
  {
    name: "GRAND FINALS",
    matches: [
      {
        id: "m7",
        team1: { name: "University of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "De La Salle University", code: "DLSU", score: 1, isWinner: false },
        status: "COMPLETED",
        timeLabel: "Bo3",
      },
    ],
  },
];

// 2. Active LIVE Tournament Bracket (Quarterfinals in progress, Semis and Finals in contention)
export const mockLiveBracket: BracketRound[] = [
  {
    name: "QUARTERFINALS",
    matches: [
      {
        id: "live-m1",
        team1: { name: "University of Makati", code: "UMak", score: 2, isWinner: true },
        team2: { name: "Far Eastern University", code: "FEU", score: 0, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "live-m2",
        team1: { name: "Ateneo de Manila University", code: "ADMU", score: 2, isWinner: true },
        team2: { name: "University of the Philippines", code: "UP", score: 1, isWinner: false },
        status: "COMPLETED",
      },
      {
        id: "live-m3",
        team1: { name: "University of Santo Tomas", code: "UST", score: 1, isWinner: false },
        team2: { name: "Mapúa University", code: "MU", score: 1, isWinner: false },
        status: "LIVE",
        timeLabel: "LIVE GAME 3",
      },
      {
        id: "live-m4",
        team1: { name: "De La Salle University", code: "DLSU", score: 0, isWinner: false },
        team2: { name: "Adamson University", code: "AdU", score: 0, isWinner: false },
        status: "UPCOMING",
        timeLabel: "UPCOMING",
      },
    ],
  },
  {
    name: "SEMIFINALS",
    matches: [
      {
        id: "live-m5",
        team1: { name: "University of Makati", code: "UMak", score: 0, isWinner: false },
        team2: { name: "Ateneo de Manila University", code: "ADMU", score: 0, isWinner: false },
        status: "UPCOMING",
        timeLabel: "AWAITING QF",
      },
      {
        id: "live-m6",
        team1: { name: "Winner QF 3", code: "TBD", score: 0, isWinner: false },
        team2: { name: "Winner QF 4", code: "TBD", score: 0, isWinner: false },
        status: "UPCOMING",
        timeLabel: "AWAITING QF",
      },
    ],
  },
  {
    name: "GRAND FINALS",
    matches: [
      {
        id: "live-m7",
        team1: { name: "Finalist 1", code: "TBD", score: 0, isWinner: false },
        team2: { name: "Finalist 2", code: "TBD", score: 0, isWinner: false },
        status: "UPCOMING",
        timeLabel: "GRAND FINALS",
      },
    ],
  },
];

// 3. Upcoming Tournament Bracket (Awaiting Start, Pairs Seeded)
export const mockUpcomingBracket: BracketRound[] = [
  {
    name: "QUARTERFINALS",
    matches: [
      {
        id: "up-m1",
        team1: { name: "University of Makati", code: "UMak", score: 0, isWinner: false },
        team2: { name: "Far Eastern University", code: "FEU", score: 0, isWinner: false },
        status: "UPCOMING",
      },
      {
        id: "up-m2",
        team1: { name: "Ateneo de Manila University", code: "ADMU", score: 0, isWinner: false },
        team2: { name: "University of the Philippines", code: "UP", score: 0, isWinner: false },
        status: "UPCOMING",
      },
      {
        id: "up-m3",
        team1: { name: "University of Santo Tomas", code: "UST", score: 0, isWinner: false },
        team2: { name: "Mapúa University", code: "MU", score: 0, isWinner: false },
        status: "UPCOMING",
      },
      {
        id: "up-m4",
        team1: { name: "De La Salle University", code: "DLSU", score: 0, isWinner: false },
        team2: { name: "Adamson University", code: "AdU", score: 0, isWinner: false },
        status: "UPCOMING",
      },
    ],
  },
  {
    name: "SEMIFINALS",
    matches: [
      {
        id: "up-m5",
        team1: { name: "Winner QF 1", code: "TBD", score: 0, isWinner: false },
        team2: { name: "Winner QF 2", code: "TBD", score: 0, isWinner: false },
        status: "UPCOMING",
      },
      {
        id: "up-m6",
        team1: { name: "Winner QF 3", code: "TBD", score: 0, isWinner: false },
        team2: { name: "Winner QF 4", code: "TBD", score: 0, isWinner: false },
        status: "UPCOMING",
      },
    ],
  },
  {
    name: "GRAND FINALS",
    matches: [
      {
        id: "up-m7",
        team1: { name: "Finalist 1", code: "TBD", score: 0, isWinner: false },
        team2: { name: "Finalist 2", code: "TBD", score: 0, isWinner: false },
        status: "UPCOMING",
      },
    ],
  },
];

// Default backwards compatibility
export const mockBracket: BracketRound[] = mockCompletedBracket;
