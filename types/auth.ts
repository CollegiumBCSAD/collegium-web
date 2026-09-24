import type { GameId } from "./games";

export interface UniversityInfo {
  id: string;
  name: string;
  domain: string;
}

export interface UserGameHandle {
  id?: string;
  gameTitle: string;
  handle: string;
  updatedAt?: string;
}

export interface UserTeamMembership {
  id: string;
  gameHandle: string;
  preferredRole?: string;
  status: string;
  team?: {
    id: string;
    name: string;
    gameTitle: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatar?: string | null;
  avatarOriginal?: string | null;
  avatarZoom?: number | null;
  avatarOffsetX?: number | null;
  avatarOffsetY?: number | null;
  avatarRotation?: number | null;
  role: string;
  status: string;
  universityId: string;
  university: UniversityInfo;
  gameHandles?: UserGameHandle[];
  teamMemberships?: UserTeamMembership[];
  createdAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  loginWithToken: (token?: string) => Promise<UserProfile | null>;
  logoutUser: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  setUserAvatar: (avatarUrl: string | null) => void;
}

export interface UniversityGameRating {
  id: string;
  gameTitle: string;
  glicko2_rating: number;
  glicko2_rd: number;
  glicko2_sigma: number;
  wins: number;
  losses: number;
}

export interface UniversityRosterMember {
  id: string;
  userId: string;
  displayName: string;
  gameHandle: string;
  preferredRole?: string | null;
  isCaptain?: boolean;
}

export interface TeamRatingSummary {
  id: string;
  name: string;
  gameTitle: string;
  glicko2_rating: number;
  glicko2_rd: number;
  glicko2_sigma: number;
  wins?: number;
  losses?: number;
  captainId?: string;
  captainName?: string;
  members?: UniversityRosterMember[];
}

export interface University {
  id: string;
  name: string;
  domain: string;
  teamId?: string;
  teamName?: string;
  gameTitle?: string;
  glicko2_rating?: number;
  glicko2_rd?: number;
  glicko2_sigma?: number;
  wins?: number;
  losses?: number;
  winRate?: number;
  streak?: string;
  isProvisional?: boolean;
  createdAt: string;
  gameRatings?: UniversityGameRating[];
  teams?: TeamRatingSummary[];
}

export interface UniversityDirectoryCardProps {
  university: University;
  gameShortName: string;
  // Only passed when the directory is ordered by rating.
  rank?: number;
}

export interface UniversityBranding {
  abbr: string;
  primary: string;
  secondary: string;
}

export type UniversitySortKey = "name" | "rating";

export interface UniversityDirectoryToolbarProps {
  sortKey: UniversitySortKey;
  onSortChange: (key: UniversitySortKey) => void;
  resultCount: number;
  // Starting letters that have at least one school, for the A–Z index.
  availableLetters: string[];
  activeLetter: string | null;
  onLetterChange: (letter: string | null) => void;
}

export interface UniversityDirectoryHeroProps {
  gameId: GameId;
  universities: University[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  university: string;
  teamId?: string;
  teamName?: string;
  rating: number;
  rd?: number;
  sigma?: number;
  isProvisional?: boolean;
  winRate: number;
  wins?: number;
  losses?: number;
  streak: string;
  game: string;
  icon?: string;
}

export interface AthleteTeamMembership {
  id: string;
  name: string;
  gameTitle: string;
  preferredRole?: string | null;
  gameHandle: string;
  isCaptain: boolean;
  glicko2_rating: number;
  glicko2_rd: number;
  joinedAt: string;
}

export interface AthleteRecentMatch {
  matchId: string;
  playedAt: string;
  matchMode: "TOURNAMENT" | "SCRIM";
  tournamentName: string | null;
  opponentName?: string | null;
  result: "WIN" | "LOSS";
  kills: number;
  deaths: number;
  assists: number;
}

// Public-facing profile card for an athlete's account — the read-only
// counterpart to their own /dashboard, viewable by anyone (including
// non-athletes) from a match box score or a university roster.
export interface AthleteProfile {
  id: string;
  displayName: string;
  role: string;
  memberSince: string;
  university: UniversityInfo;
  gameHandles: UserGameHandle[];
  teams: AthleteTeamMembership[];
  recentMatches: AthleteRecentMatch[];
}

export interface UniversityCrestWallProps {
  universities: University[];
}
