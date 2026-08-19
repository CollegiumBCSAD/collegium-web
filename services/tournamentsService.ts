import { apiClient } from "./apiClient";
import { Tournament, TournamentStatus, BracketRound, MatchBoxScore } from "@/types";
import { 
  mockTournaments, 
  mockCompletedBracket, 
  mockLiveBracket, 
  mockUpcomingBracket, 
  mockBracket, 
  mockBoxScore 
} from "@/lib/mock/tournaments";

const GAME_DISPLAY: Record<string, { label: string; gradient: string }> = {
  VALORANT: { label: "VALORANT", gradient: "from-[#8E2632] via-[#48161D] to-[#11141C]" },
  LOL: { label: "LEAGUE OF LEGENDS", gradient: "from-[#233568] via-[#141C38] to-[#11141C]" },
  CODM: { label: "CALL OF DUTY: MOBILE", gradient: "from-[#4B5563] via-[#1F2937] to-[#11141C]" },
  MLBB: { label: "MOBILE LEGENDS: BANG BANG", gradient: "from-[#8E6519] via-[#42300E] to-[#11141C]" },
};

const STATUS_DISPLAY: Record<string, TournamentStatus> = {
  UPCOMING: "UPCOMING",
  ONGOING: "LIVE",
  COMPLETED: "COMPLETED",
};

function detectGameFromText(text: string): { label: string; gradient: string } {
  const upper = text.toUpperCase();
  if (upper.includes("MOBILE LEGENDS") || upper.includes("MLBB") || upper.includes("ML")) {
    return GAME_DISPLAY.MLBB;
  }
  if (upper.includes("LEAGUE OF LEGENDS") || upper.includes("LOL") || upper.includes("RIFT")) {
    return GAME_DISPLAY.LOL;
  }
  if (upper.includes("CALL OF DUTY") || upper.includes("CODM")) {
    return GAME_DISPLAY.CODM;
  }
  return GAME_DISPLAY.VALORANT;
}

function parseServerTournamentsResponse(data: unknown): Tournament[] {
  if (!Array.isArray(data) || data.length === 0) {
    return mockTournaments;
  }

  const parsed = data.map((raw, idx) => {
    const t = raw as {
      id?: string;
      name?: string;
      gameTitle?: string;
      status?: string;
      matches?: Array<{ title?: string; gameTitle?: string }>;
      universities?: Array<{ id?: string }>;
    };

    const matches = t.matches ?? [];
    const universities = t.universities ?? [];
    const nameString = (t.name || "") + " " + (t.gameTitle || "") + " " + (matches[0]?.title || "") + " " + (matches[0]?.gameTitle || "");
    const gameDisplay = detectGameFromText(nameString);
    const status = STATUS_DISPLAY[t.status ?? "UPCOMING"] ?? "UPCOMING";

    const statusText =
      status === "COMPLETED"
        ? "Final standings published"
        : status === "LIVE"
          ? "Bracket in progress"
          : `${universities.length || 8} universities registered`;

    const bulletPoints = [`${universities.length || 8} participating universities`];
    if (matches.length > 0) {
      bulletPoints.push(`${matches.length} matches played`);
    } else {
      bulletPoints.push("Elimination bracket");
    }

    return {
      id: t.id ?? `tournament-${idx}`,
      title: t.name ?? "Untitled Tournament",
      game: gameDisplay.label,
      status,
      statusText,
      bulletPoints,
      bgGradient: gameDisplay.gradient,
    };
  });

  return parsed.length > 0 ? parsed : mockTournaments;
}

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
              code: "UMak",
              score: m.isVerified ? 2 : 0,
              isWinner: m.isVerified,
            },
            team2: {
              name: (m.loserId && universitiesMap.get(m.loserId)) || "Adamson University",
              code: "AdU",
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
              code: "UMak",
              score: m.isVerified ? 2 : 0,
              isWinner: m.isVerified,
            },
            team2: {
              name: (m.loserId && universitiesMap.get(m.loserId)) || "Ateneo de Manila University",
              code: "ADMU",
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
              code: "UMak",
              score: m.isVerified ? 2 : 0,
              isWinner: m.isVerified,
            },
            team2: {
              name: (m.loserId && universitiesMap.get(m.loserId)) || "De La Salle University",
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

  return mockBracket;
}

export const tournamentsService = {
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments");
      return parseServerTournamentsResponse(response);
    } catch {
      return mockTournaments;
    }
  },

  getBracket: async (tournamentId: string): Promise<BracketRound[]> => {
    try {
      const response = await apiClient.get<unknown>(`/tournaments/${tournamentId}/bracket`);
      return parseServerBracketResponse(response);
    } catch {
      const tourney = mockTournaments.find((t) => t.id === tournamentId);
      if (tourney?.status === "LIVE") return mockLiveBracket;
      if (tourney?.status === "UPCOMING") return mockUpcomingBracket;
      return mockCompletedBracket;
    }
  },

  getBoxScore: (matchId: string): Promise<MatchBoxScore> => {
    return apiClient.get<MatchBoxScore>(`/matches/${matchId}/box-score`).catch(() => mockBoxScore);
  },
};
