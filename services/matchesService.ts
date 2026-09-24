import { apiClient } from "./apiClient";
import { HomeMatchItem } from "@/components/home/HomeMatchesHub";

export interface GetMatchesResponse {
  matches: HomeMatchItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const matchesService = {
  getMatches: async (params?: {
    page?: number;
    limit?: number;
    gameTitle?: string;
    status?: "ALL" | "LIVE" | "UPCOMING" | "COMPLETED";
    matchMode?: "ALL" | "TOURNAMENT" | "SCRIM";
  }): Promise<GetMatchesResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", String(params.page));
      if (params?.limit) searchParams.set("limit", String(params.limit));
      if (params?.gameTitle) searchParams.set("gameTitle", params.gameTitle);
      if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
      if (params?.matchMode && params.matchMode !== "ALL") searchParams.set("matchMode", params.matchMode);

      const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
      const res = await apiClient.get<GetMatchesResponse>(`/matches${query}`);
      return (
        res || {
          matches: [],
          total: 0,
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalPages: 1,
        }
      );
    } catch {
      return {
        matches: [],
        total: 0,
        page: params?.page || 1,
        limit: params?.limit || 10,
        totalPages: 1,
      };
    }
  },
};
