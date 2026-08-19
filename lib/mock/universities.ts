import { University } from "@/types";

export const mockUniversities: University[] = [
  {
    id: "1",
    name: "University of Makati",
    domain: "umak.edu.ph",
    glicko2_rating: 1748.2,
    glicko2_rd: 42.5,
    glicko2_sigma: 0.058,
    wins: 28,
    losses: 5,
    createdAt: "2026-01-15T00:00:00.000Z",
    gameRatings: [
      { id: "gr-1-1", gameTitle: "VALORANT", glicko2_rating: 1748, glicko2_rd: 42, glicko2_sigma: 0.06, wins: 12, losses: 1 },
      { id: "gr-1-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1620, glicko2_rd: 50, glicko2_sigma: 0.06, wins: 8, losses: 2 },
      { id: "gr-1-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1580, glicko2_rd: 55, glicko2_sigma: 0.06, wins: 5, losses: 1 },
      { id: "gr-1-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1530, glicko2_rd: 60, glicko2_sigma: 0.06, wins: 3, losses: 1 },
    ],
  },
  {
    id: "2",
    name: "Far Eastern University",
    domain: "feu.edu.ph",
    glicko2_rating: 1690.9,
    glicko2_rd: 45.0,
    glicko2_sigma: 0.059,
    wins: 22,
    losses: 8,
    createdAt: "2026-01-16T00:00:00.000Z",
    gameRatings: [
      { id: "gr-2-1", gameTitle: "VALORANT", glicko2_rating: 1690, glicko2_rd: 45, glicko2_sigma: 0.06, wins: 10, losses: 3 },
      { id: "gr-2-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1590, glicko2_rd: 52, glicko2_sigma: 0.06, wins: 6, losses: 3 },
      { id: "gr-2-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1540, glicko2_rd: 58, glicko2_sigma: 0.06, wins: 4, losses: 1 },
      { id: "gr-2-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1500, glicko2_rd: 65, glicko2_sigma: 0.06, wins: 2, losses: 1 },
    ],
  },
  {
    id: "3",
    name: "Polytechnic University of the Philippines",
    domain: "pup.edu.ph",
    glicko2_rating: 1658.4,
    glicko2_rd: 48.0,
    glicko2_sigma: 0.060,
    wins: 19,
    losses: 9,
    createdAt: "2026-01-17T00:00:00.000Z",
    gameRatings: [
      { id: "gr-3-1", gameTitle: "VALORANT", glicko2_rating: 1658, glicko2_rd: 48, glicko2_sigma: 0.06, wins: 9, losses: 4 },
      { id: "gr-3-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1560, glicko2_rd: 55, glicko2_sigma: 0.06, wins: 5, losses: 3 },
      { id: "gr-3-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1510, glicko2_rd: 60, glicko2_sigma: 0.06, wins: 3, losses: 1 },
      { id: "gr-3-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1480, glicko2_rd: 68, glicko2_sigma: 0.06, wins: 2, losses: 1 },
    ],
  },
  {
    id: "4",
    name: "Ateneo de Manila University",
    domain: "admu.edu.ph",
    glicko2_rating: 1642.4,
    glicko2_rd: 49.0,
    glicko2_sigma: 0.060,
    wins: 18,
    losses: 10,
    createdAt: "2026-01-18T00:00:00.000Z",
    gameRatings: [
      { id: "gr-4-1", gameTitle: "VALORANT", glicko2_rating: 1642, glicko2_rd: 49, glicko2_sigma: 0.06, wins: 8, losses: 5 },
      { id: "gr-4-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1610, glicko2_rd: 51, glicko2_sigma: 0.06, wins: 6, losses: 3 },
      { id: "gr-4-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1490, glicko2_rd: 62, glicko2_sigma: 0.06, wins: 2, losses: 1 },
      { id: "gr-4-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1470, glicko2_rd: 70, glicko2_sigma: 0.06, wins: 2, losses: 1 },
    ],
  },
  {
    id: "5",
    name: "De La Salle University",
    domain: "dlsu.edu.ph",
    glicko2_rating: 1631.2,
    glicko2_rd: 50.0,
    glicko2_sigma: 0.060,
    wins: 17,
    losses: 11,
    createdAt: "2026-01-19T00:00:00.000Z",
    gameRatings: [
      { id: "gr-5-1", gameTitle: "VALORANT", glicko2_rating: 1631, glicko2_rd: 50, glicko2_sigma: 0.06, wins: 7, losses: 6 },
      { id: "gr-5-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1580, glicko2_rd: 54, glicko2_sigma: 0.06, wins: 5, losses: 3 },
      { id: "gr-5-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1520, glicko2_rd: 59, glicko2_sigma: 0.06, wins: 3, losses: 1 },
      { id: "gr-5-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1460, glicko2_rd: 72, glicko2_sigma: 0.06, wins: 2, losses: 1 },
    ],
  },
  {
    id: "6",
    name: "University of Santo Tomas",
    domain: "ust.edu.ph",
    glicko2_rating: 1617.9,
    glicko2_rd: 52.0,
    glicko2_sigma: 0.060,
    wins: 15,
    losses: 12,
    createdAt: "2026-01-20T00:00:00.000Z",
    gameRatings: [
      { id: "gr-6-1", gameTitle: "VALORANT", glicko2_rating: 1617, glicko2_rd: 52, glicko2_sigma: 0.06, wins: 6, losses: 6 },
      { id: "gr-6-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1550, glicko2_rd: 56, glicko2_sigma: 0.06, wins: 4, losses: 4 },
      { id: "gr-6-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1500, glicko2_rd: 61, glicko2_sigma: 0.06, wins: 3, losses: 1 },
      { id: "gr-6-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1450, glicko2_rd: 75, glicko2_sigma: 0.06, wins: 2, losses: 1 },
    ],
  },
  {
    id: "7",
    name: "University of the Philippines",
    domain: "up.edu.ph",
    glicko2_rating: 1605.1,
    glicko2_rd: 53.0,
    glicko2_sigma: 0.060,
    wins: 14,
    losses: 13,
    createdAt: "2026-01-21T00:00:00.000Z",
    gameRatings: [
      { id: "gr-7-1", gameTitle: "VALORANT", glicko2_rating: 1605, glicko2_rd: 53, glicko2_sigma: 0.06, wins: 5, losses: 7 },
      { id: "gr-7-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1540, glicko2_rd: 57, glicko2_sigma: 0.06, wins: 4, losses: 4 },
      { id: "gr-7-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1590, glicko2_rd: 52, glicko2_sigma: 0.06, wins: 4, losses: 1 },
      { id: "gr-7-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1440, glicko2_rd: 76, glicko2_sigma: 0.06, wins: 1, losses: 1 },
    ],
  },
  {
    id: "8",
    name: "National University",
    domain: "nu.edu.ph",
    glicko2_rating: 1580.0,
    glicko2_rd: 55.0,
    glicko2_sigma: 0.060,
    wins: 12,
    losses: 14,
    createdAt: "2026-01-22T00:00:00.000Z",
    gameRatings: [
      { id: "gr-8-1", gameTitle: "VALORANT", glicko2_rating: 1580, glicko2_rd: 55, glicko2_sigma: 0.06, wins: 4, losses: 8 },
      { id: "gr-8-2", gameTitle: "LEAGUE OF LEGENDS", glicko2_rating: 1520, glicko2_rd: 59, glicko2_sigma: 0.06, wins: 3, losses: 4 },
      { id: "gr-8-3", gameTitle: "MOBILE LEGENDS: BANG BANG", glicko2_rating: 1480, glicko2_rd: 63, glicko2_sigma: 0.06, wins: 3, losses: 1 },
      { id: "gr-8-4", gameTitle: "CALL OF DUTY: MOBILE", glicko2_rating: 1430, glicko2_rd: 78, glicko2_sigma: 0.06, wins: 2, losses: 1 },
    ],
  },
];

export function getMockUniversity(idOrSlug: string): University | null {
  const clean = idOrSlug.trim().toLowerCase();
  
  // Exact ID match
  const byId = mockUniversities.find((u) => u.id === clean);
  if (byId) return byId;

  // Domain or Name match
  const byName = mockUniversities.find((u) => 
    u.domain.toLowerCase().includes(clean) ||
    u.name.toLowerCase().includes(clean) ||
    clean.includes(u.domain.split(".")[0])
  );
  if (byName) return byName;

  // Fallback to first university (UMak) if valid ID is requested
  return mockUniversities[0];
}
