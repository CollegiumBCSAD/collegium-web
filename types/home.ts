import { ReactNode } from "react";
import { GameId, GameInfo } from "./games";
import { NewsArticle } from "./news";
import { Tournament, TournamentMatch } from "./tournaments";

export interface HomeMatchItem extends TournamentMatch {
  tournamentTitle?: string;
  gameId?: GameId;
  stageName?: string;
  matchMode?: "TOURNAMENT" | "SCRIM";
  isForfeit?: boolean;
}

export interface HomePanelProps {
  title: string;
  /** Extra controls rendered on the right of the header, e.g. filter tabs. */
  actions?: ReactNode;
  href?: string;
  hrefLabel?: string;
  badge?: string;
  live?: boolean;
  children: ReactNode;
  className?: string;
}

export interface HomeStat {
  value: string;
  label: string;
}

export interface HomeHeroStripProps {
  activeGame: GameId;
  selectedGameInfo: GameInfo | null;
  openGameSelector: () => void;
  stats: HomeStat[];
  tournaments: Tournament[];
}

export interface HomeFeaturedEventProps {
  tournament: Tournament | null;
  activeGame: GameId;
}

/** University id -> email domain, used to resolve a school's crest colors. */
export type HomeDomainLookup = Record<string, string>;

export interface HomeCrestProps {
  name: string;
  domain?: string;
  size?: "sm" | "md" | "lg";
}

export interface HomeMatchRowProps {
  match: HomeMatchItem;
  domains: HomeDomainLookup;
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

export interface HomeMatchesHubProps {
  matches?: HomeMatchItem[];
  domains: HomeDomainLookup;
  activeGame: GameId;
  onOpenBoxScore: (match: HomeMatchItem) => void;
}

export interface HomePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export interface HomeNewsHubProps {
  articles: NewsArticle[];
  activeGame: GameId;
}

export interface HomeRankingsWidgetProps {
  activeGame: GameId;
}

export interface HomeTournamentsWidgetProps {
  tournaments: Tournament[];
  activeGame: GameId;
}
