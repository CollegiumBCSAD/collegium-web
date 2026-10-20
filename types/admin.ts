import type { ReactNode } from "react";
import { BracketFormat, Tournament } from "./tournaments";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: number;
  badgeType?: "warning" | "alert" | "neutral";
}

export interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string | null;
  role: string;
  status: string;
  createdAt: string;
  university: {
    id: string;
    name: string;
  } | null;
}

export interface PendingTournamentPost {
  id: string;
  name: string;
  game: string;
  detail: string;
  bracketFormat: BracketFormat;
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

export interface ScrimBoardPost {
  id: string;
  teamName: string;
  game: string;
  detail: string;
  flagReason?: string;
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

/** Live size of every admin review queue, shared by the sidebar and Command Hub. */
export interface AdminQueueCounts {
  tournaments: number;
  events: number;
  coaches: number;
  disputes: number;
  scrims: number;
}

export interface AdminStat {
  label: string;
  value: number | string;
  /** "warn" highlights a number that needs action. */
  tone?: "default" | "warn" | "alert" | "good";
}

export interface AdminPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  stats?: AdminStat[];
  actions?: ReactNode;
}

/** Queue components report their size so the page tabs stay in sync after a review. */
export interface AdminQueueCountProps {
  onCountChange?: (count: number) => void;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export interface TournamentModerationPanelProps extends AdminQueueCountProps {
  initialTournaments?: Tournament[];
}

export interface TournamentReviewDeskProps {
  initialTournaments: Tournament[];
}
