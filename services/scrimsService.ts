import { apiClient } from "./apiClient";
import { ScrimOffer, GameId } from "@/types";

export interface CreateScrimPayload {
  teamId: string;
  gameTitle: GameId;
  scheduledAt: string;
  format: string;
  rankRange?: string;
  mapPreference?: string;
  notes?: string;
}

export interface AcceptScrimPayload {
  opponentId: string;
}

export interface ScrimChatMessage {
  id: string;
  scrimId: string;
  senderId: string;
  senderName: string;
  teamName: string;
  text: string;
  createdAt: string;
}

const gameTitleToEnum: Record<string, string> = {
  valo: "VALORANT",
  lol: "LOL",
  ml: "MLBB",
  codm: "CODM",
  VALORANT: "VALORANT",
  LOL: "LOL",
  MLBB: "MLBB",
  CODM: "CODM",
};

const reverseGameTitleMap: Record<string, GameId> = {
  VALORANT: "valo",
  LOL: "lol",
  MLBB: "ml",
  CODM: "codm",
  valo: "valo",
  lol: "lol",
  ml: "ml",
  codm: "codm",
};

function parseServerScrimsResponse(data: unknown): ScrimOffer[] {
  if (!Array.isArray(data)) return [];
  return data.map((raw: unknown) => {
    const item = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
    const team = (item.team && typeof item.team === "object" ? item.team : {}) as Record<string, unknown>;
    const university = (team.university && typeof team.university === "object" ? team.university : {}) as Record<string, unknown>;
    const opponent = (item.opponent && typeof item.opponent === "object" ? item.opponent : {}) as Record<string, unknown>;

    return {
      id: (item.id as string) || `scrim-${Math.random()}`,
      teamId: item.teamId as string,
      hostTeamName: (team.name as string) || (item.hostTeamName as string) || "Varsity Squad",
      universityName: (university.name as string) || (item.universityName as string) || "Collegiate Varsity",
      gameTitle: reverseGameTitleMap[item.gameTitle as string] || (item.gameTitle as GameId) || "valo",
      format: (item.format as string) || "BO3",
      rankRange: (item.rankRange as string) || "Unranked+",
      mapPreference: item.mapPreference as string,
      scheduledAt: (item.scheduledAt as string) || new Date().toISOString(),
      notes: item.notes as string,
      status: (item.status as ScrimOffer["status"]) || "OPEN",
      opponentTeamName: (opponent.name as string) || (item.opponentTeamName as string),
      opponentTeamId: (opponent.id as string) || (item.opponentId as string),
      pendingRequests: Array.isArray(item.pendingRequests)
        ? (item.pendingRequests as ScrimOffer["pendingRequests"])
        : undefined,
    };
  });
}

export const scrimsService = {
  getScrims: async (gameTitle?: GameId): Promise<ScrimOffer[]> => {
    try {
      const enumGame = gameTitle ? gameTitleToEnum[gameTitle] : undefined;
      const query = enumGame ? `?gameTitle=${enumGame}` : "";
      const response = await apiClient.get<unknown>(`/scrims${query}`);
      return parseServerScrimsResponse(response);
    } catch {
      return [];
    }
  },

  createScrim: (payload: CreateScrimPayload): Promise<ScrimOffer> => {
    const mappedPayload = {
      ...payload,
      gameTitle: (gameTitleToEnum[payload.gameTitle] || "VALORANT") as unknown as GameId,
    };
    return apiClient.post<ScrimOffer>("/scrims", mappedPayload);
  },

  acceptScrim: (scrimId: string, payload: AcceptScrimPayload): Promise<ScrimOffer> =>
    apiClient.post<ScrimOffer>(`/scrims/${scrimId}/accept`, payload),

  confirmScrim: (scrimId: string, opponentId?: string): Promise<ScrimOffer> =>
    apiClient.post<ScrimOffer>(`/scrims/${scrimId}/confirm`, { opponentId }),

  cancelScrim: (scrimId: string): Promise<ScrimOffer> =>
    apiClient.patch<ScrimOffer>(`/scrims/${scrimId}/cancel`),

  completeScrim: (scrimId: string): Promise<ScrimOffer> =>
    apiClient.patch<ScrimOffer>(`/scrims/${scrimId}/complete`),

  scanScrim: async (scrimId: string, file: File): Promise<{
    scrimId: string;
    gameTitle: string;
    players: Array<{
      extracted: { ign: string; kills: number; deaths: number; assists: number; extra?: Record<string, unknown> };
      resolution: {
        rawIgn: string;
        matchedCandidate: { userId: string; displayName: string; gameHandle: string; teamId: string; teamName: string; role?: string } | null;
        confidence: number;
        isHighConfidence: boolean;
        suggestedCandidates: Array<{ candidate: { userId: string; displayName: string; gameHandle: string; teamId: string; teamName: string }; confidence: number }>;
      };
    }>;
    hostTeam: { id: string; name: string; universityId: string; universityName?: string };
    opponentTeam: { id: string; name: string; universityId: string; universityName?: string } | null;
  }> => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.postForm(`/scrims/${scrimId}/scan`, formData);
  },

  finalizeScrim: async (
    scrimId: string,
    dto: {
      winnerId: string;
      loserId?: string;
      gameDuration?: number;
      players: Array<{
        userId?: string;
        universityId?: string;
        name: string;
        kills: number;
        deaths: number;
        assists: number;
        combatScore?: number;
        headshotPct?: number;
        agentName?: string;
      }>;
    }
  ): Promise<ScrimOffer> => {
    return apiClient.post<ScrimOffer>(`/scrims/${scrimId}/finalize`, dto);
  },

  deleteScrim: (scrimId: string): Promise<void> =>
    apiClient.delete<void>(`/scrims/${scrimId}`),

  getScrimChat: async (scrimId: string): Promise<ScrimChatMessage[]> => {
    try {
      return await apiClient.get<ScrimChatMessage[]>(`/scrims/${scrimId}/chat`);
    } catch {
      return [];
    }
  },

  sendScrimChat: (scrimId: string, text: string): Promise<ScrimChatMessage> =>
    apiClient.post<ScrimChatMessage>(`/scrims/${scrimId}/chat`, { text }),
};
