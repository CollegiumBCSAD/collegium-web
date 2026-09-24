import { University } from "./auth";

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
  matches?: unknown[];
  applications?: unknown[];
  bracketFormat?: string;
  teamQuota?: number;
  rules?: string;
  startDate?: string;
  rejectionReason?: string;
  organizerId?: string;
  organizer?: { id?: string; displayName?: string };
  /** Official tournament broadcast URL (one per tournament / esport). */
  streamUrl?: string | null;
  streamIsLive?: boolean;
  /** Match currently featured on the official stream. */
  featuredMatchId?: string | null;
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
  // Set when the reported stat line was matched to a registered athlete rather
  // than typed in as a bare in-game name.
  userId?: string | null;
  displayName?: string | null;
}

export type MatchLedgerMode = "ALL" | "TOURNAMENT" | "SCRIM";

// One verified match as it appears on a university's profile ledger, covering
// both tournament matches and scrims. The roundLabel is resolved server-side
// so a history row reads the same as the bracket it came from.
export interface UniversityMatchHistoryEntry {
  id: string;
  // Only present on a scrim-mode entry - lets the scrim page route an "edit
  // this log" action back to the Scrim that produced it.
  scrimId: string | null;
  playedAt: string;
  tournamentId: string | null;
  tournamentName: string | null;
  gameTitle: string | null;
  round: number;
  bracketSide: BracketSide | null;
  roundLabel: string;
  matchMode: "TOURNAMENT" | "SCRIM";
  isForfeit: boolean;
  // A forfeited match still counts in the ledger, but carries no combat stats.
  result: "WIN" | "LOSS" | "FORFEIT_WIN" | "FORFEIT_LOSS";
  opponent: { id: string; name: string } | null;
  playerStats: MatchPlayerStat[];
}

// The match ledger is paged server-side so a long history is never fetched at
// once.
export interface UniversityMatchHistoryPage {
  matches: UniversityMatchHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// One tournament finish on a university's Tournament Tracker. The placement is
// derived from the bracket server-side, never stored.
export interface UniversityTournamentPlacement {
  tournamentId: string;
  tournamentName: string;
  gameTitle: string | null;
  image: string | null;
  status: string;
  startDate: string;
  placement: number | null;
  placementLabel: string;
  wins: number;
  losses: number;
  matchesPlayed: number;
}

export interface MatchRosterPreviewMember {
  displayName?: string;
  gameHandle?: string;
  preferredRole?: string;
}

export interface MatchBoxScore {
  team1Name: string;
  team2Name: string;
  team1UniversityId?: string;
  team2UniversityId?: string;
  isTeam1Winner?: boolean;
  isTeam2Winner?: boolean;
  status?: string;
  playerStats?: MatchPlayerStat[];
  team1Roster?: MatchRosterPreviewMember[];
  team2Roster?: MatchRosterPreviewMember[];
}

export interface MatchBoxScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  matchInfo?: MatchBoxScore;
  canEditStats?: boolean;
  onEditStats?: () => void;
}

export interface UniversityRosterSectionProps {
  university: University;
  matches: UniversityMatchHistoryEntry[];
  isLoadingMatches?: boolean;
  matchMode: MatchLedgerMode;
  onMatchModeChange: (mode: MatchLedgerMode) => void;
  matchPage: number;
  matchTotalPages: number;
  matchTotal: number;
  onMatchPageChange: (page: number) => void;
  placements: UniversityTournamentPlacement[];
  isLoadingPlacements?: boolean;
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
  extra?: Record<string, unknown>;
}

export interface ScannedPlayerRow {
  ign: string;
  team: string | null;
  kills: number;
  deaths: number;
  assists: number;
  extra: Record<string, unknown>;
}

export interface ScanResult {
  game: string;
  players: ScannedPlayerRow[];
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
  initialTab?: "bracket" | "teams" | "channel" | "overview" | "watch";
}

export interface MatchCardProps {
  match: BracketMatch;
  onViewBoxScore: () => void;
  isFeatured?: boolean;
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


