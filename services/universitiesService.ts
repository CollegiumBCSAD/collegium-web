import { apiClient } from "./apiClient";
import { University } from "@/types";

export const universitiesService = {
  getUniversities: (gameTitle?: string): Promise<University[]> => {
    const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
    return apiClient.get<University[]>(`/universities${query}`);
  },

  getUniversityById: (id: string): Promise<University> =>
    apiClient.get<University>(`/universities/${id}`),

  createUniversity: (name: string, domain: string): Promise<University> =>
    apiClient.post<University>("/universities", { name, domain }),

  updateUniversity: (id: string, updates: { name?: string; domain?: string }): Promise<University> =>
    apiClient.patch<University>(`/universities/${id}`, updates),

  deleteUniversity: (id: string): Promise<void> =>
    apiClient.delete<void>(`/universities/${id}`),
};
