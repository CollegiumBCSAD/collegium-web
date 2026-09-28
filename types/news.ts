import { GameId } from "./games";

export type NewsStatus = "DRAFT" | "PUBLISHED";

export type NewsCategory =
  | "TOURNAMENT_CIRCUIT"
  | "TACTICAL_META"
  | "RULESET_PATCH"
  | "ATHLETE_SPOTLIGHT"
  | "CIRCUIT_ANNOUNCEMENT"
  | "COMMUNITY_MILESTONE";

export const NEWS_CATEGORIES: NewsCategory[] = [
  "TOURNAMENT_CIRCUIT",
  "TACTICAL_META",
  "RULESET_PATCH",
  "ATHLETE_SPOTLIGHT",
  "CIRCUIT_ANNOUNCEMENT",
  "COMMUNITY_MILESTONE",
];

export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  TOURNAMENT_CIRCUIT: "TOURNAMENT CIRCUIT",
  TACTICAL_META: "TACTICAL META",
  RULESET_PATCH: "RULESET & PATCH",
  ATHLETE_SPOTLIGHT: "ATHLETE SPOTLIGHT",
  CIRCUIT_ANNOUNCEMENT: "CIRCUIT ANNOUNCEMENT",
  COMMUNITY_MILESTONE: "COMMUNITY MILESTONE",
};

export interface NewsArticle {
  id: string;
  gameId: GameId | "general";
  title: string;
  excerpt: string;
  body: string;
  category: NewsCategory;
  status: NewsStatus;
  date: string;
  readTime: string;
  author?: string;
  image?: string;
  isFeatured?: boolean;
}

export type MarkdownBlock =
  | { kind: "heading"; level: 1 | 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "list"; items: string[] };

export type MarkdownSpan =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | { kind: "link"; text: string; href: string };

export interface ArticleBodyProps {
  body: string;
}

export interface NewsArticleEditorProps {
  article?: NewsArticle | null;
  onSaved?: () => void;
  onCancelEdit?: () => void;
}

export interface NewsArticleListProps {
  articles: NewsArticle[];
  editingId?: string | null;
  onEdit: (article: NewsArticle) => void;
  onChanged: () => void;
}
