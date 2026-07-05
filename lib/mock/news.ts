export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "New season format introduces regional qualifiers",
    excerpt: "Universities across the country will now face regional qualifiers before the national finals.",
    date: "June 22, 2026",
    category: "Tournament Updates",
  },
  {
    id: "2",
    title: "Three new universities join the Collegium circuit",
    excerpt: "The latest wave of institutions expands the platform’s reach and talent pool.",
    date: "June 14, 2026",
    category: "Announcements",
  },
  {
    id: "3",
    title: "Watch the first live community scrim showcase",
    excerpt: "Teams from across the archipelago will test strategies in a public broadcast next week.",
    date: "June 8, 2026",
    category: "Community Showcase",
  },
];
