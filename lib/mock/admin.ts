import {
  UniversityVerification,
  PendingTournamentPost,
  PendingTeamRegistration,
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
