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

export const scrimsService = {
  getScrims: (gameTitle?: GameId): Promise<ScrimOffer[]> => {
    const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
    return apiClient.get<ScrimOffer[]>(`/scrims${query}`);
  },

  createScrim: (payload: CreateScrimPayload): Promise<ScrimOffer> =>
    apiClient.post<ScrimOffer>("/scrims", payload),

  acceptScrim: (scrimId: string, payload: AcceptScrimPayload): Promise<ScrimOffer> =>
    apiClient.post<ScrimOffer>(`/scrims/${scrimId}/accept`, payload),

  cancelScrim: (scrimId: string): Promise<ScrimOffer> =>
    apiClient.patch<ScrimOffer>(`/scrims/${scrimId}/cancel`),
};
