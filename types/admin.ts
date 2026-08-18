export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
  university: {
    id: string;
    name: string;
  } | null;
}

export interface UniversityVerification {
  id: string;
  name: string;
  domain: string;
  status: "PENDING" | "VERIFIED";
  detail: string;
}

export interface PendingTournamentPost {
  id: string;
  name: string;
  game: string;
  detail: string;
  bracketFormat: string;
  seeding: string;
  scheduleStart: string;
}

export interface PendingTeamRegistration {
  id: string;
  teamName: string;
  tournamentName: string;
  game: string;
  detail: string;
}

export interface FlaggedMatch {
  id: string;
  teamA: string;
  teamB: string;
  game: string;
  detail: string;
  scoreA: number;
  scoreB: number;
  claimA: string;
  claimB: string;
}
