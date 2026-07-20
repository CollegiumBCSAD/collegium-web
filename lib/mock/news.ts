export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  bgGradient: string;
}

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "NEW SEASON FORMAT INTRODUCES REGIONAL QUALIFIERS",
    excerpt: "Universities across the country will now face regional qualifiers before the national finals.",
    date: "June 22, 2026",
    category: "Tournament Updates",
    bgGradient: "from-[#8E2632] via-[#48161D] to-[#160B0E]",
  },
  {
    id: "2",
    title: "THREE NEW UNIVERSITIES JOIN THE COLLEGIUM CIRCUIT",
    excerpt: "The latest wave of institutions expands the platform's reach and talent pool.",
    date: "June 14, 2026",
    category: "Announcements",
    bgGradient: "from-[#233568] via-[#141C38] to-[#0A0F20]",
  },
  {
    id: "3",
    title: "WATCH THE FIRST LIVE COMMUNITY SCRIM SHOWCASE",
    excerpt: "Teams from across the archipelago will test strategies in a public broadcast next week.",
    date: "June 8, 2026",
    category: "Community Showcase",
    bgGradient: "from-[#8E6519] via-[#42300E] to-[#1C1405]",
  },
];
