export type EventGameTitle = "VALORANT" | "LOL" | "MLBB" | "CODM";

export type EventStatus = "DRAFT" | "OPEN" | "LOCKED" | "ONGOING" | "COMPLETED";

export type EventTeamStatus = "PENDING" | "APPROVED" | "REJECTED";

export type EventDocumentKind = "COR" | "SCHOOL_ID";

export type EventBracketFormat =
  | "SINGLE_ELIM"
  | "DOUBLE_ELIM"
  | "ROUND_ROBIN"
  | "TWO_STAGE";

export interface EventInvite {
  id: string;
  name: string;
  gameTitle: EventGameTitle;
  bracketFormat: EventBracketFormat;
  status: EventStatus;
  rules: string | null;
  maxSubs: number;
  signupsCloseAt: string | null;
  signupsOpen: boolean;
}

export interface EventSummary {
  id: string;
  name: string;
  gameTitle: EventGameTitle;
  bracketFormat: EventBracketFormat;
  status: EventStatus;
  inviteCode: string;
  rules: string | null;
  maxSubs: number;
  signupsCloseAt: string | null;
  createdAt: string;
  _count?: { teams: number; matches?: number };
}

export interface RosterPlayer {
  id?: string;
  fullName: string;
  studentNumber: string;
  ign: string;
  isSubstitute: boolean;
}

export interface EventTeam {
  id: string;
  eventId: string;
  name: string;
  logo: string | null;
  captainName: string;
  captainEmail: string;
  editToken: string;
  roster: RosterPlayer[];
  status: EventTeamStatus;
  reviewNote: string | null;
  seed: number | null;
  createdAt: string;
  event?: { name: string; gameTitle: EventGameTitle; status: EventStatus };
}

/** A squad the signed-in user captains, from GET /events/my-squads. */
export interface MyEventSquad {
  id: string;
  name: string;
  status: EventTeamStatus;
  reviewNote: string | null;
  editToken: string;
  eventId: string;
  createdAt: string;
  playerCount: number;
  event: { name: string; gameTitle: EventGameTitle; status: EventStatus };
}

export interface EventDocument {
  id: string;
  rosterPlayerId: string;
  kind: EventDocumentKind;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface EventBracketTeam {
  id: string;
  name: string;
  logo: string | null;
  seed: number | null;
}

export interface EventBracketMatch {
  id: string;
  round: number;
  slot: number;
  bestOf: number;
  teamAId: string | null;
  teamBId: string | null;
  winnerId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  isBye: boolean;
  playedAt: string | null;
}

export interface EventBracket {
  id: string;
  name: string;
  gameTitle: EventGameTitle;
  bracketFormat: EventBracketFormat;
  status: EventStatus;
  teams: EventBracketTeam[];
  matches: EventBracketMatch[];
}

export interface SubmitEventTeamPayload {
  name: string;
  captainName: string;
  captainEmail: string;
  roster: RosterPlayer[];
}
