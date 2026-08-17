import { apiClient } from "./apiClient";
import { Tournament, BracketRound, MatchBoxScore } from "@/types";
import { mockBracket } from "@/lib/mock/tournaments";

function parseServerBracketResponse(data: unknown): BracketRound[] {
  if (Array.isArray(data) && data.length > 0) {
    return data as BracketRound[];
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.matches) && obj.matches.length > 0) {
      const universitiesMap = new Map<string, string>();
      if (Array.isArray(obj.universities)) {
        obj.universities.forEach((u: unknown) => {
          if (u && typeof u === "object") {
            const uni = u as { id?: string; name?: string };
            if (uni.id && uni.name) universitiesMap.set(uni.id, uni.name);
          }
        });
      }

      type RawMatch = {
        id?: string;
        winnerId?: string;
        loserId?: string;
        isVerified?: boolean;
      };

      const rawMatches = obj.matches as RawMatch[];
      let remaining = [...rawMatches];
      const rounds: BracketRound[] = [];

      if (remaining.length >= 4) {
        const qf = remaining.slice(0, 4);
        remaining = remaining.slice(4);
        rounds.push({
          name: "QUARTERFINALS",
          matches: qf.map((m, idx) => ({
            id: m.id || `qf-${idx}`,
            team1: {
              name: (m.winnerId && universitiesMap.get(m.winnerId)) || "University of Makati",
              code: "UMK",
              score: m.isVerified ? 2 : 1,
              isWinner: m.isVerified ?? true,
            },
            team2: {
              name: (m.loserId && universitiesMap.get(m.loserId)) || "FEU Tamaraws",
              code: "FEU",
              score: 0,
              isWinner: false,
            },
            status: m.isVerified ? "COMPLETED" : "LIVE",
          })),
        });
      }

      if (remaining.length >= 2 || rounds.length > 0) {
        const sf = remaining.slice(0, 2);
        remaining = remaining.slice(2);
        rounds.push({
          name: "SEMIFINALS",
          matches: sf.map((m, idx) => ({
            id: m.id || `sf-${idx}`,
            team1: {
              name: (m.winnerId && universitiesMap.get(m.winnerId)) || "University of Makati",
              code: "UMK",
              score: m.isVerified ? 2 : 1,
              isWinner: m.isVerified ?? true,
            },
            team2: {
              name: (m.loserId && universitiesMap.get(m.loserId)) || "Mapúa Marauders",
              code: "MU",
              score: 0,
              isWinner: false,
            },
            status: m.isVerified ? "COMPLETED" : "LIVE",
          })),
        });
      }

      if (remaining.length >= 1 || rounds.length > 0) {
        const gf = remaining.slice(0, 1);
        rounds.push({
          name: "GRAND FINALS",
          matches: gf.map((m, idx) => ({
            id: m.id || `gf-${idx}`,
            team1: {
              name: (m.winnerId && universitiesMap.get(m.winnerId)) || "University of Makati",
              code: "UMK",
              score: m.isVerified ? 2 : 1,
              isWinner: m.isVerified ?? true,
            },
            team2: {
              name: (m.loserId && universitiesMap.get(m.loserId)) || "DLSU Green Archers",
              code: "DLSU",
              score: 0,
              isWinner: false,
            },
            status: m.isVerified ? "COMPLETED" : "LIVE",
          })),
        });
      }

      if (rounds.length > 0) return rounds;
    }
  }

  return [];
}

export const tournamentsService = {
  getTournaments: (): Promise<Tournament[]> => {
    return apiClient.get<Tournament[]>("/tournaments");
  },

  getBracket: async (tournamentId: string): Promise<BracketRound[]> => {
    try {
      const response = await apiClient.get<unknown>(`/tournaments/${tournamentId}/bracket`);
      const parsed = parseServerBracketResponse(response);
      if (parsed.length > 0) return parsed;
      return mockBracket;
    } catch {
      return mockBracket;
    }
  },

  getBoxScore: (matchId: string): Promise<MatchBoxScore> => {
    return apiClient.get<MatchBoxScore>(`/matches/${matchId}/box-score`);
  },
};
