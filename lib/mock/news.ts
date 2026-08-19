export interface NewsArticle {
  id: string;
  gameId: "valo" | "lol" | "ml" | "codm" | "general";
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
  // VALORANT News
  {
    id: "v1",
    gameId: "valo",
    title: "VALORANT EPISODE 9 MAP POOL UPDATES & COLLEGIATE RULESET",
    excerpt: "Official ruleset updates for Haven, Ascent, and Sunset map veto bans in collegiate varsity tournaments starting next week.",
    date: "August 18, 2026",
    category: "RULESET & PATCH",
    readTime: "5 MIN READ",
    author: "RULES COMMITTEE",
    image: "/valorant-art-1.png",
    isFeatured: true,
  },
  {
    id: "v2",
    gameId: "valo",
    title: "ATHLETE SPOTLIGHT: HOW UMAK VALORANT DOMINATED THE PRE-SEASON",
    excerpt: "An in-depth breakdown of University of Makati's 9-game winning streak and their tactical agent compositions.",
    date: "August 14, 2026",
    category: "ATHLETE SPOTLIGHT",
    readTime: "4 MIN READ",
    author: "VALORANT ANALYST",
    image: "/valorant-art-2.png",
  },
  {
    id: "v3",
    gameId: "valo",
    title: "METRO MANILA VALORANT REGIONAL QUALIFIERS ANNOUNCED",
    excerpt: "Over 32 university squads across NCR prepare for the double-elimination circuit qualifier leading to the National Finals.",
    date: "August 10, 2026",
    category: "TOURNAMENT CIRCUIT",
    readTime: "3 MIN READ",
    author: "COLLEGIUM OPS",
    image: "/valorant-art-3.jpg",
  },

  // MOBILE LEGENDS News
  {
    id: "m1",
    gameId: "ml",
    title: "MLBB METRO LEAGUE FINALS: TOP 8 UNIVERSITIES ADVANCE TO PLAYOFFS",
    excerpt: "De La Salle and UST lock top seeds after thrilling tiebreakers in the Mobile Legends collegiate group stage.",
    date: "August 18, 2026",
    category: "TOURNAMENT CIRCUIT",
    readTime: "4 MIN READ",
    author: "MLBB DESK",
    image: "/ml-art-3.jpg",
    isFeatured: true,
  },
  {
    id: "m2",
    gameId: "ml",
    title: "PROJECT NEXT META SHIFT: HERO DRAFT PRIORITIES IN COLLEGIATE MLBB",
    excerpt: "Analyzing the rise of assassin junglers and support roamer rotations across collegiate competitive scrims.",
    date: "August 15, 2026",
    category: "TACTICAL META",
    readTime: "5 MIN READ",
    author: "COACH SPOTLIGHT",
    image: "/ml-art-2.png",
  },
  {
    id: "m3",
    gameId: "ml",
    title: "INTER-CAMPUS MLBB INVITATIONAL OPEN FOR REGISTRATION",
    excerpt: "Collegiate squads from Visayas and Mindanao can now register their 5-player rosters for the Season 2 Invitational.",
    date: "August 11, 2026",
    category: "CIRCUIT ANNOUNCEMENT",
    readTime: "3 MIN READ",
    author: "COMMUNITY DESK",
    image: "/ml-art-1.jpg",
  },

  // LEAGUE OF LEGENDS News
  {
    id: "l1",
    gameId: "lol",
    title: "LEAGUE OF LEGENDS CAMPUS CLASH: TOURNAMENT BRACKET REVEALED",
    excerpt: "Ateneo Eagles and FEU Tamaraws headline the opening round of the 8-university League of Legends Invitational.",
    date: "August 18, 2026",
    category: "TOURNAMENT CIRCUIT",
    readTime: "4 MIN READ",
    author: "LOL BROADCAST",
    image: "/lol-art-3.png",
    isFeatured: true,
  },
  {
    id: "l2",
    gameId: "lol",
    title: "PATCH 14.16 IMPACT ON COLLEGIATE MID-LANE CHAMPION POOLS",
    excerpt: "Orianna, Syndra, and control mages return to high priority in varsity competitive drafts.",
    date: "August 13, 2026",
    category: "RULESET & PATCH",
    readTime: "5 MIN READ",
    author: "LOL ANALYST",
    image: "/lol-art-2.jpg",
  },
  {
    id: "l3",
    gameId: "lol",
    title: "SUMMONER'S RIFT SCRIM ACTIVITY GROWS 40% IN COLLEGIUM WAR ROOM",
    excerpt: "University varsity teams log record hours testing dragon control setups and early lane swaps.",
    date: "August 09, 2026",
    category: "COMMUNITY MILESTONE",
    readTime: "3 MIN READ",
    author: "WAR ROOM OPS",
    image: "/lol-art-1.png",
  },

  // CALL OF DUTY: MOBILE News
  {
    id: "c1",
    gameId: "codm",
    title: "CODM VARSITY WARFARE CHAMPIONSHIPS ANNOUNCE REGISTRATION DATES",
    excerpt: "Hardpoint, Search & Destroy, and Control competitive modes confirmed for the nationwide collegiate circuit.",
    date: "August 18, 2026",
    category: "CIRCUIT ANNOUNCEMENT",
    readTime: "4 MIN READ",
    author: "CODM CIRCUIT",
    image: "/codm-art-2.jpg",
    isFeatured: true,
  },
  {
    id: "c2",
    gameId: "codm",
    title: "METRIC ANALYSIS: TOP SMG & SNIPER BUILDS DOMINATING WAR ROOM SCRIMS",
    excerpt: "Breakdown of attachments, perk selections, and operator skills favored by top collegiate fraggers.",
    date: "August 14, 2026",
    category: "TACTICAL META",
    readTime: "4 MIN READ",
    author: "CODM OPS",
    image: "/codm-art-3.jpg",
  },
  {
    id: "c3",
    gameId: "codm",
    title: "NATIONAL FINALS PRIZE POOL EXPANDS FOR PHILIPPINE COLLEGIATE TEAMS",
    excerpt: "Sponsored collegiate gear, varsity equipment grants, and verified seasonal circuit points up for grabs.",
    date: "August 08, 2026",
    category: "TOURNAMENT CIRCUIT",
    readTime: "3 MIN READ",
    author: "TOURNAMENT DESK",
    image: "/codm-art-1.png",
  },
];
