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

export interface University {
  id: string;
  name: string;
  domain: string;
  glicko2_rating: number;
  glicko2_rd: number;
  glicko2_sigma: number;
  wins: number;
  losses: number;
  createdAt: string;
  gameRatings?: UniversityGameRating[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  university: string;
  rating: number;
  winRate: number;
  streak: string;
  game: string;
  icon?: string;
}
