import type { GameId } from "./games";

export type RosterChangeReason =
  | "INJURY"
  | "ILLNESS"
  | "ACADEMIC"
  | "PERSONAL_EMERGENCY"
  | "ELIGIBILITY"
  | "TECHNICAL"
  | "OTHER";

export type RosterChangeStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface RosterUser {
  id: string;
  displayName: string;
  email: string;
}

export interface RosterMember {
  id: string;
  userId: string;
  gameHandle: string;
  preferredRole: string | null;
  user: RosterUser;
}

/** A tournament entry whose submitted lineup can only change via a request. */
export interface RosterLock {
  applicationId: string;
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: string;
  applicationStatus: string;
  lockedUserIds: string[];
}

export interface RosterChange {
  id: string;
  applicationId: string;
  teamId: string;
  tournamentId: string;
  reason: RosterChangeReason;
  details: string;
  status: RosterChangeStatus;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
  outUser: RosterUser;
  inUser: RosterUser;
  requestedBy: RosterUser;
  reviewedBy: RosterUser | null;
  tournament: { id: string; name: string };
  team: { id: string; name: string };
}

export interface TeamRoster {
  team: {
    id: string;
    name: string;
    captainId: string | null;
    coachId: string | null;
    minRosterSize: number;
    maxRosterSize: number;
  };
  members: RosterMember[];
  locks: RosterLock[];
  changes: RosterChange[];
}

export interface CreateRosterChangeInput {
  applicationId: string;
  outUserId: string;
  inUserId: string;
  reason: RosterChangeReason;
  details: string;
}

// ── Component props ──────────────────────────────────────────────────────

export interface RosterEditorProps {
  teamId: string;
  gameTitle: GameId;
  onChanged?: () => void;
}

export interface RosterMemberRowProps {
  teamId: string;
  member: RosterMember;
  /** 1-based position on the sheet; 1–5 are the starting five. */
  slot: number;
  /** Shown when the player hasn't set a role of their own. */
  defaultRole: string;
  isCaptain: boolean;
  lockedIn: string[];
  onChanged: () => void;
}

export interface RosterChangeModalProps {
  roster: TeamRoster;
  onClose: () => void;
  onFiled: () => void;
}

export interface RosterChangeHistoryProps {
  teamId: string;
  changes: RosterChange[];
  onChanged: () => void;
}

export interface RosterChangeReviewPanelProps {
  tournamentId: string;
  onReviewed?: () => void;
}
