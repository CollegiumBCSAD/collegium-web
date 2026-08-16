export type GameId = "valo" | "lol" | "codm" | "ml";

export interface GameInfo {
  id: GameId;
  name: string;
  shortName: string;
  subtitle: string;
  tagline: string;
  publisher: string;
  image: string;
  accentColor: string;
  borderColor: string;
  activeTournaments: number;
  activeTeams: number;
  genre: string;
}
