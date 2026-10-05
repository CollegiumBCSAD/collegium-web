// Display helpers for the Coach Hub.

export const AUDIT_LABELS: Record<string, string> = {
  TEAM_CREATED: "Created the team",
  COACH_INVITE_SENT: "Sent a coaching invitation",
  COACH_INVITE_ACCEPTED: "Joined as coach",
  COACH_REMOVED: "Removed the coach",
  TOURNAMENT_REGISTERED: "Registered for a tournament",
  TOURNAMENT_WITHDRAWN: "Withdrew from a tournament",
  PRACTICE_SCHEDULED: "Scheduled a practice",
  PRACTICE_UPDATED: "Updated a practice",
  PRACTICE_CANCELLED: "Cancelled a practice",
  PRACTICE_RECORD_LOGGED: "Logged a scrim result",
  ROSTER_MEMBER_UPDATED: "Edited a player",
  ROSTER_MEMBER_REMOVED: "Removed a player",
  CAPTAIN_TRANSFERRED: "Handed over the captaincy",
  ROSTER_CHANGE_REQUESTED: "Filed a last-minute change",
  ROSTER_CHANGE_APPROVED: "Last-minute change approved",
  ROSTER_CHANGE_REJECTED: "Last-minute change rejected",
  ROSTER_CHANGE_CANCELLED: "Cancelled a last-minute change",
};

/** Audit actions grouped by tone for the activity timeline dots. */
export const AUDIT_TONE: Record<string, "brand" | "good" | "bad" | "muted"> = {
  TOURNAMENT_REGISTERED: "good",
  ROSTER_CHANGE_APPROVED: "good",
  COACH_INVITE_ACCEPTED: "good",
  TOURNAMENT_WITHDRAWN: "bad",
  ROSTER_MEMBER_REMOVED: "bad",
  ROSTER_CHANGE_REJECTED: "bad",
  COACH_REMOVED: "bad",
  PRACTICE_CANCELLED: "muted",
  ROSTER_CHANGE_CANCELLED: "muted",
};

export function timeAgo(iso: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Whole days / hours / minutes until `iso`, never negative. */
export function countdownParts(iso: string, now: number) {
  const total = Math.max(0, new Date(iso).getTime() - now);
  const minutes = Math.floor(total / 60000);
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60, total };
}

export const winRate = (wins: number, total: number) => (total ? Math.round((wins / total) * 100) : 0);
