import { GAMES } from "@/lib/games";

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime?: string;
  author?: string;
  image: string;
  isFeatured?: boolean;
}

export const mockNewsArticles: NewsArticle[] = [
  {
    id: "1",
    title: "NEW SEASON FORMAT INTRODUCES REGIONAL QUALIFIERS & NATIONAL FINALS",
    excerpt: "Universities across Luzon, Visayas, and Mindanao will now battle through regional Swiss-system qualifiers before advancing to the Manila Grand Finals.",
    date: "August 16, 2026",
    category: "TOURNAMENT CIRCUIT",
    readTime: "4 MIN READ",
    author: "COLLEGIUM MEDIA TEAM",
    image: GAMES.valo.image,
    isFeatured: true,
  },
  {
    id: "2",
    title: "THREE NEW UNIVERSITIES JOIN THE COLLEGIUM VARSITY LEAGUE",
    excerpt: "Mapúa University, De La Salle-College of Saint Benilde, and Silliman University officially register varsity rosters for Season 4.",
    date: "August 12, 2026",
    category: "CIRCUIT ANNOUNCEMENT",
    readTime: "3 MIN READ",
    author: "LEAGUE ADMIN",
    image: GAMES.lol.image,
  },
  {
    id: "3",
    title: "INTER-UNIVERSITY SCRIM BOARD PASSES 500 VERIFIED MATCHES",
    excerpt: "Collegiate squads have logged over 500 peer-verified scrimmage matches using the automated Glicko-2 matchmaking engine.",
    date: "August 08, 2026",
    category: "COMMUNITY MILESTONE",
    readTime: "2 MIN READ",
    author: "GLICKO-2 ANALYTICS",
    image: GAMES.ml.image,
  },
  {
    id: "4",
    title: "VALORANT EPISODE 9 MAP POOL UPDATES & COLLEGIATE RULESET",
    excerpt: "Official ruleset updates for Haven, Ascent, and Sunset map bans in collegiate varsity tournaments starting next week.",
    date: "August 03, 2026",
    category: "RULESET & PATCH",
    readTime: "5 MIN READ",
    author: "RULES COMMITTEE",
    image: GAMES.valo.image,
  },
  {
    id: "5",
    title: "ATHLETE SPOTLIGHT: HOW UMAK VALORANT DOMINATED THE PRE-SEASON",
    excerpt: "An in-depth breakdown of University of Makati's 9-game winning streak and their tactical agent compositions.",
    date: "July 28, 2026",
    category: "ATHLETE SPOTLIGHT",
    readTime: "6 MIN READ",
    author: "ESPORTS ANALYST",
    image: GAMES.codm.image,
  },
];
