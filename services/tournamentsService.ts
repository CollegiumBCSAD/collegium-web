import { apiClient } from "./apiClient";
import { Tournament, TournamentApprovalStatus, BracketRound, MatchBoxScore } from "@/types";
import { 
  mockTournaments, 
  mockBoxScore 
} from "@/lib/mock/tournaments";

const GAME_DISPLAY: Record<string, { label: string; gradient: string }> = {
  VALORANT: { label: "VALORANT", gradient: "from-[#8E2632] via-[#48161D] to-[#11141C]" },
  LOL: { label: "LEAGUE OF LEGENDS", gradient: "from-[#233568] via-[#141C38] to-[#11141C]" },
  CODM: { label: "CALL OF DUTY: MOBILE", gradient: "from-[#4B5563] via-[#1F2937] to-[#11141C]" },
  MLBB: { label: "MOBILE LEGENDS: BANG BANG", gradient: "from-[#8E6519] via-[#42300E] to-[#11141C]" },
};

const STATUS_DISPLAY: Record<string, TournamentApprovalStatus> = {
  UPCOMING: "UPCOMING",
  ONGOING: "LIVE",
  COMPLETED: "COMPLETED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  REJECTED: "REJECTED",
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

interface RawTournament {
  id?: string;
  name?: string;
  gameTitle?: string;
  status?: string;
  image?: string;
  bracketFormat?: string;
  teamQuota?: number;
  rules?: string;
  rejectionReason?: string;
  matches?: Array<{ title?: string; gameTitle?: string }>;
  universities?: Array<{ id?: string; name?: string }>;
}

function mapTournaments(data: RawTournament[]): Tournament[] {
  return data.map((t, idx) => {
    const matches = t.matches ?? [];
    const universities = t.universities ?? [];
    const nameString = (t.name || "") + " " + (t.gameTitle || "") + " " + (matches[0]?.title || "") + " " + (matches[0]?.gameTitle || "");
    const gameDisplay = detectGameFromText(nameString);
    const status: TournamentApprovalStatus = STATUS_DISPLAY[t.status ?? "UPCOMING"] ?? "UPCOMING";

    const statusText =
      status === "PENDING_APPROVAL"
        ? "Awaiting admin approval"
        : status === "REJECTED"
          ? t.rejectionReason
            ? `Rejected: ${t.rejectionReason}`
            : "Rejected by admin"
          : status === "COMPLETED"
            ? "Final standings published"
            : status === "LIVE"
              ? "Bracket in progress"
              : universities.length > 0
                ? `${universities.length} universities registered`
                : "Open for registrations (0 registered)";

    const bulletPoints = [
      universities.length > 0
        ? `${universities.length} participating universities`
        : "Open registration — 0 squads",
    ];
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
      image: t.image,
      bracketFormat: t.bracketFormat,
      teamQuota: t.teamQuota,
      rules: t.rules,
      rejectionReason: t.rejectionReason,
      bgGradient: gameDisplay.gradient,
    };
  });
}

function parseServerTournamentsResponse(data: unknown): Tournament[] {
  if (!Array.isArray(data) || data.length === 0) {
    return mockTournaments;
  }
  return mapTournaments(data as RawTournament[]);
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

  return [];
}

export const tournamentsService = {
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments");
      return parseServerTournamentsResponse(response);
    } catch {
      return [];
    }
  },

  // An empty result from these two is a real "nothing here" state, not a
  // reason to fall back to demo data the way parseServerTournamentsResponse
  // does for the public tournaments page — use mapTournaments() directly.
  getPendingTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments?status=PENDING_APPROVAL");
      return Array.isArray(response) ? mapTournaments(response as RawTournament[]) : [];
    } catch {
      return [];
    }
  },

  getMyTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments/mine");
      return Array.isArray(response) ? mapTournaments(response as RawTournament[]) : [];
    } catch {
      return [];
    }
  },

  getBracket: async (tournamentId: string): Promise<BracketRound[]> => {
    try {
      const response = await apiClient.get<unknown>(`/tournaments/${tournamentId}/bracket`);
      return parseServerBracketResponse(response);
    } catch {
      return [];
    }
  },

  createTournament: (params: {
    name: string;
    imageFile?: File;
    bracketFormat?: string;
    teamQuota?: number;
    rules?: string;
  }): Promise<unknown> => {
    const formData = new FormData();
    formData.append("name", params.name);
    if (params.imageFile) formData.append("image", params.imageFile);
    if (params.bracketFormat) formData.append("bracketFormat", params.bracketFormat);
    if (params.teamQuota) formData.append("teamQuota", String(params.teamQuota));
    if (params.rules) formData.append("rules", params.rules);
    return apiClient.postForm("/tournaments", formData);
  },

  registerTournament: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/register`, {});
  },

  applyForTournament: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/apply`, {});
  },

  withdrawApplication: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/withdraw`, {});
  },

  getApplications: (tournamentId: string): Promise<unknown[]> => {
    return apiClient.get<unknown[]>(`/tournaments/${tournamentId}/applications`).catch(() => []);
  },

  approveApplication: (tournamentId: string, appId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/applications/${appId}/approve`, {});
  },

  rejectApplication: (tournamentId: string, appId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/applications/${appId}/reject`, {});
  },

  deleteTournament: (tournamentId: string): Promise<void> => {
    return apiClient.delete<void>(`/tournaments/${tournamentId}`);
  },

  getBoxScore: (matchId: string): Promise<MatchBoxScore> => {
    return apiClient.get<MatchBoxScore>(`/matches/${matchId}/box-score`).catch(() => mockBoxScore);
  },
};
