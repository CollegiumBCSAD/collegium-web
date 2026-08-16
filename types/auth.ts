export interface UniversityInfo {
  id: string;
  name: string;
  domain: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  universityId: string;
  university: UniversityInfo;
  createdAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isLoggedIn: boolean;
  isLoaded: boolean;
  loginWithToken: (token?: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

export interface University {
  id: string;
  name: string;
  domain: string;
  glicko2_rating: number;
  glicko2_rd: number;
  glicko2_vol: number;
  wins: number;
  losses: number;
  createdAt: string;
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
