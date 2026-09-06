export type TournamentStatus = "COMPLETED" | "UPCOMING" | "LIVE";

// A tournament's own approval lifecycle is broader than a match's status —
// only the tournament itself can be PENDING_APPROVAL/REJECTED.
export type TournamentApprovalStatus =
  | TournamentStatus
  | "PENDING_APPROVAL"
  | "REJECTED";

export interface TeamInMatch {
  name: string;
  code: string;
  score?: number;
  isWinner?: boolean;
  // The real University id backing this side of the match. Needed to submit
  // a match result (closeMatch) — display name alone isn't enough.
  universityId?: string;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  gameTitle?: string;
  status: TournamentApprovalStatus;
  statusText: string;
  bulletPoints: string[];
  image?: string;
  bgGradient: string;
  universities?: { id: string; name: string }[];
  applications?: unknown[];
  bracketFormat?: string;
  teamQuota?: number;
  rules?: string;
  startDate?: string;
  rejectionReason?: string;
  organizerId?: string;
  organizer?: { id?: string; displayName?: string };
}

export interface TournamentMatch {
  id: string;
  team1: TeamInMatch;
  team2: TeamInMatch;
  status: TournamentStatus;
  timeLabel?: string;
  playerStats?: MatchPlayerStat[];
}

export type BracketSide = "WINNERS" | "LOSERS" | "GRAND_FINAL";

export interface BracketRound {
  name: string;
  // Only set for Double Elimination — distinguishes the winners bracket,
  // losers bracket, and the final decider match. Undefined for Single
  // Elimination and Round Robin + Playoffs, which have one implicit bracket.
  bracketSide?: BracketSide;
  matches: TournamentMatch[];
}

// A real, organizer-reported per-player stat row (PlayerStat.dataSource
// PEER_VERIFIED) — no agent/ACS fields, there's no data source for those
// on a manually-entered stat line.
export interface MatchPlayerStat {
  universityId: string | null;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
}

export interface MatchTeam {
  name: string;
  score: number;
  isWinner?: boolean;
  // The real University id backing this side of the match. Needed to submit
  // a match result (closeMatch) — display name alone isn't enough.
  universityId?: string;
}

export interface ClosePlayerStatInput {
  universityId: string;
  userId?: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
}

export interface BracketMatch {
  id: string;
  team1: MatchTeam;
  team2: MatchTeam;
  status?: "LIVE" | "COMPLETED" | "UPCOMING" | string;
  timeLabel?: string;
  playerStats?: MatchPlayerStat[];
}

export interface TournamentBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournamentId?: string;
  title?: string;
  subtitle?: string;
}

export interface MatchCardProps {
  match: BracketMatch;
  onViewBoxScore: () => void;
}

export interface PendingSquadApplication {
  id: string;
  tournamentId: string;
  tournamentName: string;
  gameTitle: string | null;
  universityId: string;
  universityName: string;
  userId: string;
  applicantName: string;
  status: string;
  appliedAt: string;
}

export interface TournamentRosterMember {
  id: string;
  userId: string;
  displayName: string;
  gameHandle: string;
  preferredRole?: string;
  isCaptain?: boolean;
}

export interface ParticipatingTeamDetail {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  gameTitle: string;
  captainName?: string;
  captainId?: string;
  status: "APPROVED" | "PENDING" | "CONFIRMED";
  seed?: number;
  members: TournamentRosterMember[];
}

export interface TournamentDetail extends Tournament {
  participatingTeams?: ParticipatingTeamDetail[];
  createdAt?: string;
}


