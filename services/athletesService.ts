import { apiClient } from "./apiClient";
import { AthleteProfile } from "@/types";

export const athletesService = {
  getPublicProfile: (userId: string): Promise<AthleteProfile> =>
    apiClient.get<AthleteProfile>(`/athletes/${userId}`),
};
