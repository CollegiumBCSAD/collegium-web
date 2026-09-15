import { apiClient } from "./apiClient";
import {
  TeamRatingSummary,
  University,
  UniversityMatchHistoryEntry,
} from "@/types";

type RawRosterMember = {
  id: string;
  userId: string;
  gameHandle: string;
  preferredRole?: string | null;
  user?: { id: string; displayName: string } | null;
};

type RawUniversityTeam = Omit<TeamRatingSummary, "members"> & {
  captain?: { id: string; displayName: string } | null;
  members?: RawRosterMember[];
};

function mapTeam(team: RawUniversityTeam): TeamRatingSummary {
  return {
    ...team,
    captainId: team.captain?.id ?? team.captainId,
    captainName: team.captain?.displayName,
    members: (team.members || []).map((member) => ({
      id: member.id,
      userId: member.userId,
      displayName: member.user?.displayName || member.gameHandle,
      gameHandle: member.gameHandle,
      preferredRole: member.preferredRole,
      isCaptain: member.userId === (team.captain?.id ?? team.captainId),
    })),
  };
}

export const universitiesService = {
  getUniversities: (gameTitle?: string): Promise<University[]> => {
    const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
    return apiClient.get<University[]>(`/universities${query}`);
  },

  getUniversityById: async (id: string): Promise<University> => {
    const university = await apiClient.get<
      University & { teams?: RawUniversityTeam[] }
    >(`/universities/${id}`);
    return {
      ...university,
      teams: (university.teams || []).map(mapTeam),
    };
  },

  getUniversityMatches: (
    id: string,
    gameTitle?: string
  ): Promise<UniversityMatchHistoryEntry[]> => {
    const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
    return apiClient.get<UniversityMatchHistoryEntry[]>(
      `/universities/${id}/matches${query}`
    );
  },

  createUniversity: (name: string, domain: string): Promise<University> =>
    apiClient.post<University>("/universities", { name, domain }),

  updateUniversity: (id: string, updates: { name?: string; domain?: string }): Promise<University> =>
    apiClient.patch<University>(`/universities/${id}`, updates),

  deleteUniversity: (id: string): Promise<void> =>
    apiClient.delete<void>(`/universities/${id}`),
};
