import { apiClient } from "./apiClient";
import { University } from "@/types";

export const universitiesService = {
  getUniversities: (gameTitle?: string): Promise<University[]> => {
    const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
    return apiClient.get<University[]>(`/universities${query}`);
  },

  getUniversityById: (id: string): Promise<University> =>
    apiClient.get<University>(`/universities/${id}`),
};
