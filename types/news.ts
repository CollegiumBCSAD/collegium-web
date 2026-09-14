import { GameId } from "./games";

export interface NewsArticle {
  id: string;
  gameId: GameId | "general";
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime?: string;
  author?: string;
  image: string;
  isFeatured?: boolean;
}

export type NewsCategory =
  | "ALL"
  | "TOURNAMENT CIRCUIT"
  | "TACTICAL META"
  | "RULESET & PATCH"
  | "ATHLETE SPOTLIGHT";
