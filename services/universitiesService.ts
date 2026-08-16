import { apiClient } from "./apiClient";
import { University } from "@/types";

export const universitiesService = {
  getUniversities: (): Promise<University[]> =>
    apiClient.get<University[]>("/universities"),

  getUniversityById: (id: string): Promise<University> =>
    apiClient.get<University>(`/universities/${id}`),
};
