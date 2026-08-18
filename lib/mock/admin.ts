import {
  UniversityVerification,
  PendingTournamentPost,
  PendingTeamRegistration,
  ScrimBoardPost,
  FlaggedMatch,
} from "@/types";

export const mockUniversityVerifications: UniversityVerification[] = [
  {
    id: "1",
    name: "La Consolacion College Bacolod",
    domain: "@lccb.edu.ph",
    status: "PENDING",
    detail: "Submitted Jul 4, 2026 · Proof: CHED_Recognition.pdf",
  },
  {
    id: "2",
    name: "University of Science and Technology of Southern Philippines",
    domain: "@ustp.edu.ph",
    status: "PENDING",
    detail: "Submitted Jul 6, 2026 · Proof: Institution_Charter.pdf",
  },
  {
    id: "3",
    name: "Silliman University",
    domain: "@su.edu.ph",
    status: "PENDING",
    detail: "Submitted Jul 7, 2026 · Proof: SEC_Registration.pdf",
  },
  {
    id: "4",
    name: "University of the Immaculate Conception",
    domain: "@uic.edu.ph",
    status: "VERIFIED",
    detail: "Approved Jun 24, 2026",
  },
  {
    id: "5",
    name: "De La Salle - College of Saint Benilde",
    domain: "@dlsu.edu.ph",
    status: "VERIFIED",
    detail: "Approved Jun 20, 2026",
  },
  {
    id: "6",
    name: "University of Makati",
    domain: "@umak.edu.ph",
    status: "VERIFIED",
    detail: "Approved Jun 15, 2026",
  },
];

export const mockPendingTournamentPosts: PendingTournamentPost[] = [
  {
    id: "1",
    name: "Collegium Preseason Cup",
    game: "Mobile Legends: Bang Bang",
    detail: "Submitted by Admin queue · 12 teams interested",
    bracketFormat: "Single Elimination",
    seeding: "Random Seeding",
    scheduleStart: "20/07/2026",
  },
];

export const mockPendingTeamRegistrations: PendingTeamRegistration[] = [
  {
    id: "1",
    teamName: "UMak Vanguards",
    tournamentName: "University Circuit Open",
    game: "VALORANT",
    detail: "7 players submitted · Jul 3, 2026",
  },
  {
    id: "2",
    teamName: "FEU Tamaraws",
    tournamentName: "Campus Clash Invitational",
    game: "VALORANT",
    detail: "7 players submitted · Jul 5, 2026",
  },
];

export const mockScrimBoardPosts: ScrimBoardPost[] = [
  {
    id: "1",
    teamName: "Ateneo Blue Eagles",
    game: "MLBB",
    detail: 'Open Jul 10, 8:00–10:00 PM · Posted by Coach Villar · Note: "Looking for high-tier practice"',
  },
  {
    id: "2",
    teamName: "Adamson Falcons",
    game: "VALORANT",
    detail: 'Open Jul 11, 6:00–8:00 PM · Posted by athlete "Kade" (no coach on roster)',
  },
  {
    id: "3",
    teamName: "NU Bulldogs",
    game: "VALORANT",
    detail: "Open Jul 13, 5:30–7:00 PM · Posted by Coach Ramos",
    flagReason: "Flagged: similar post already live",
  },
];

export const mockFlaggedMatches: FlaggedMatch[] = [
  {
    id: "1",
    teamA: "UMak Vanguards",
    teamB: "FEU Tamaraws",
    game: "VALORANT",
    detail: "Quarterfinals · University Circuit Open · Jul 1, 2026",
    scoreA: 2,
    scoreB: 0,
    claimA:
      "Round 7 was replayed after a server desync but the original score was kept — final should be 2–1, not 2–0.",
    claimB: "Server desync happened during warmup, not a scored round. Original 2–0 result stands.",
  },
  {
    id: "2",
    teamA: "UMak Vanguards",
    teamB: "UE Red Warriors",
    game: "Mobile Legends: Bang Bang",
    detail: "Round 1 · Metro League · Jun 24, 2026",
    scoreA: 0,
    scoreB: 2,
    claimA: "Opponent used an unregistered substitute for Game 2. Requesting forfeit review.",
    claimB: "Substitute was registered before the match — roster update was submitted in advance.",
  },
];
