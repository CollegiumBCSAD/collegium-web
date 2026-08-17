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
      gameTitle: (item.gameTitle as GameId) || "valo",
      format: (item.format as string) || "BO3",
      rankRange: (item.rankRange as string) || "Unranked+",
      mapPreference: item.mapPreference as string,
      scheduledAt: (item.scheduledAt as string) || new Date().toISOString(),
      notes: item.notes as string,
      status: (item.status as ScrimOffer["status"]) || "OPEN",
      opponentTeamName: (opponent.name as string) || (item.opponentTeamName as string),
    };
  });
}

export const scrimsService = {
  getScrims: async (gameTitle?: GameId): Promise<ScrimOffer[]> => {
    try {
      const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
      const response = await apiClient.get<unknown>(`/scrims${query}`);
      return parseServerScrimsResponse(response);
    } catch {
      return [];
    }
  },

  createScrim: (payload: CreateScrimPayload): Promise<ScrimOffer> =>
    apiClient.post<ScrimOffer>("/scrims", payload),

  acceptScrim: (scrimId: string, payload: AcceptScrimPayload): Promise<ScrimOffer> =>
    apiClient.post<ScrimOffer>(`/scrims/${scrimId}/accept`, payload),

  cancelScrim: (scrimId: string): Promise<ScrimOffer> =>
    apiClient.patch<ScrimOffer>(`/scrims/${scrimId}/cancel`),
};
