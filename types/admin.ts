import type { ReactNode } from "react";
import { BracketFormat } from "./tournaments";

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
