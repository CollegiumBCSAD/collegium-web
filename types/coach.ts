import type { ReactNode } from "react";
import type { GameId } from "./games";

export type PracticeResult = "WIN" | "LOSS";
export type PracticeRecordSource = "OCR" | "MANUAL";
export type ServerGameTitle = "VALORANT" | "LOL" | "MLBB" | "CODM";

export interface CoachUserSummary {
  id: string;
  displayName: string;
  email: string;
}

export interface CoachRosterMember {
  id: string;
  userId: string;
  gameHandle: string;
  preferredRole?: string | null;
  user: CoachUserSummary;
}

export interface CoachTeam {
  id: string;
  name: string;
  gameTitle: ServerGameTitle;
  universityId: string;
  captainId: string | null;
  coachId: string | null;
  inviteCode: string;
  min_roster_size: number;
  max_roster_size: number;
  glicko2_rating: number;
  glicko2_rd: number;
  createdAt: string;
  university: { id: string; name: string };
  captain: CoachUserSummary | null;
  members: CoachRosterMember[];
  _count: { members: number };
}

export interface CoachTeamApplication {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedAt: string;
  tournament: { id: string; name: string; status: string; startDate: string | null };
}

export interface PracticeSchedule {
  id: string;
  teamId: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  _count?: { records: number };
}

export interface CoachTeamDashboard extends CoachTeam {
  practiceSchedules: PracticeSchedule[];
  tournamentApplications: CoachTeamApplication[];
  practiceSummary: PracticeSummary;
}

export interface PracticeSummary {
  wins: number;
  losses: number;
  total: number;
}

export interface PracticeRecord {
  id: string;
  teamId: string;
  scheduleId: string | null;
  opponentName: string | null;
  result: PracticeResult;
  completed: boolean;
  source: PracticeRecordSource;
  ocrConfidence: number | null;
  notes: string | null;
  playedAt: string;
  schedule: { id: string; title: string; startsAt: string } | null;
  loggedBy: { id: string; displayName: string };
}

export interface PracticeRecordList {
  summary: PracticeSummary;
  records: PracticeRecord[];
}

export interface PracticeScanResult {
  teamId: string;
  detectedResult: PracticeResult | null;
  completed: boolean;
  confidence: number;
  isConfident: boolean;
  playersRead: number;
  rosterMatched: number;
}

export interface CreatePracticeScheduleInput {
  title: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  notes?: string;
}

export interface CreatePracticeRecordInput {
  scheduleId?: string;
  opponentName?: string;
  result: PracticeResult;
  completed: boolean;
  source: PracticeRecordSource;
  ocrConfidence?: number;
  notes?: string;
}

export interface CoachInvitation {
  id: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  team: {
    id: string;
    name: string;
    gameTitle: ServerGameTitle;
    university: { id: string; name: string };
  };
  invitedBy: CoachUserSummary;
}

export interface CoachPlayerStat {
  userId: string;
  displayName: string;
  gameHandle: string;
  role: string | null;
  games: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
}

export interface CoachTeamStats {
  teamId: string;
  teamName: string;
  gameTitle: ServerGameTitle;
  rating: { rating: number; rd: number; lastRatedAt: string | null };
  matchesPlayed: number;
  players: CoachPlayerStat[];
}

export interface TeamAuditEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  createdAt: string;
  actor: CoachUserSummary;
}

export interface CoachJoinRequest {
  id: string;
  userId: string;
  gameHandle: string;
  preferredRole?: string | null;
  user: CoachUserSummary;
}

export interface CoachApplication {
  id: string;
  email: string;
  displayName: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  university: { id: string; name: string };
}

// ── Component props ──────────────────────────────────────────────────────

export interface CoachInvitationsPanelProps {
  invitations: CoachInvitation[];
  onResponded: () => void;
}

export interface CoachCreateTeamFormProps {
  onCreated: (team: CoachTeam) => void;
}

export interface CoachTeamSwitcherProps {
  teams: CoachTeam[];
  activeTeamId: string | null;
  onSelect: (team: CoachTeam) => void;
  isCreating: boolean;
  onToggleCreate: () => void;
}

export interface CoachPanelProps {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  /** Right-aligned header slot, e.g. a primary action. */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export interface CoachHubHeroProps {
  coachName: string;
  universityName?: string;
  gameId: GameId;
  teams: CoachTeam[];
  invitationCount: number;
  onCreateTeam: () => void;
}

export interface NextPracticeCardProps {
  schedules: PracticeSchedule[];
}

export interface CoachTeamPanelProps {
  team: CoachTeamDashboard;
  onChanged: () => void;
}

export interface CoachTeamIdProps {
  teamId: string;
}

export interface CoachAuditLogPanelProps {
  teamId: string;
  /** Bumped by the hub after each coach action so the log re-reads. */
  refreshKey: number;
}

export interface CoachJoinRequestsPanelProps {
  teamId: string;
  coachId: string;
  onChanged: () => void;
}

export interface PracticeRecordModalProps {
  teamId: string;
  schedules: PracticeSchedule[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export interface CoachApprovalQueueProps {
  applications: CoachApplication[];
  onReview: (userId: string, approve: boolean) => Promise<void>;
}

export interface TeamCoachStripProps {
  teamId: string;
  coachName?: string | null;
  isCaptain: boolean;
  onChanged?: () => void;
}
