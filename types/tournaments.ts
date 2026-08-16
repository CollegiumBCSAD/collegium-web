export type TournamentStatus = "COMPLETED" | "UPCOMING" | "LIVE";

export interface TeamInMatch {
  name: string;
  code: string;
  score?: number;
  isWinner?: boolean;
}

export interface Tournament {
  id: string;
  title: string;
  game: string;
  status: TournamentStatus;
  statusText: string;
  bulletPoints: string[];
  image?: string;
  bgGradient: string;
}

export interface TournamentMatch {
  id: string;
  team1: TeamInMatch;
  team2: TeamInMatch;
  status: TournamentStatus;
  timeLabel?: string;
}

export interface BracketRound {
  name: string;
  matches: TournamentMatch[];
}

export interface PlayerStats {
  name: string;
  role: string;
  agent: string;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  acs: number;
}

export interface MatchBoxScore {
  title: string;
  subtitle: string;
  team1: {
    name: string;
    code: string;
    players: PlayerStats[];
  };
  team2: {
    name: string;
    code: string;
    players: PlayerStats[];
  };
}

export interface MatchTeam {
  name: string;
  score: number;
  isWinner?: boolean;
}

export interface BracketMatch {
  id: string;
  team1: MatchTeam;
  team2: MatchTeam;
}
