export interface LeaderboardEntry {
  id: string;
  rank: number;
  university: string;
  rating: number;
  winRate: string;
  streak: string;
}

export const mockLeaderboards: Record<string, LeaderboardEntry[]> = {
  VALORANT: [
    {
      id: "1",
      rank: 1,
      university: "UNIVERSITY OF MAKATI",
      rating: 94.8,
      winRate: "81%",
      streak: "9W",
    },
    {
      id: "2",
      rank: 2,
      university: "POLYTECHNIC UNIVERSITY",
      rating: 90.9,
      winRate: "72%",
      streak: "4W",
    },
    {
      id: "3",
      rank: 3,
      university: "FAR EASTERN UNIVERSITY",
      rating: 88.4,
      winRate: "68%",
      streak: "3W",
    },
  ],
  "LEAGUE OF LEGENDS": [
    {
      id: "1",
      rank: 1,
      university: "ATENEO DE MANILA UNIVERSITY",
      rating: 92.4,
      winRate: "78%",
      streak: "6W",
    },
    {
      id: "2",
      rank: 2,
      university: "DE LA SALLE UNIVERSITY",
      rating: 91.2,
      winRate: "75%",
      streak: "5W",
    },
    {
      id: "3",
      rank: 3,
      university: "UNIVERSITY OF SANTO TOMAS",
      rating: 87.9,
      winRate: "64%",
      streak: "1L",
    },
  ],
  "MOBILE LEGENDS: BANG BANG": [
    {
      id: "1",
      rank: 1,
      university: "UNIVERSITY OF THE PHILIPPINES",
      rating: 95.1,
      winRate: "83%",
      streak: "12W",
    },
    {
      id: "2",
      rank: 2,
      university: "UNIVERSITY OF MAKATI",
      rating: 93.2,
      winRate: "79%",
      streak: "6W",
    },
    {
      id: "3",
      rank: 3,
      university: "DE LA SALLE UNIVERSITY",
      rating: 89.5,
      winRate: "70%",
      streak: "2W",
    },
  ],
  "CALL OF DUTY: MOBILE": [
    {
      id: "1",
      rank: 1,
      university: "FAR EASTERN UNIVERSITY",
      rating: 93.6,
      winRate: "80%",
      streak: "8W",
    },
    {
      id: "2",
      rank: 2,
      university: "MAPUA UNIVERSITY",
      rating: 89.8,
      winRate: "71%",
      streak: "1L",
    },
    {
      id: "3",
      rank: 3,
      university: "ADAMSON UNIVERSITY",
      rating: 88.0,
      winRate: "67%",
      streak: "4W",
    },
  ],
};
