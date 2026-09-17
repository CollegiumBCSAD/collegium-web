import { apiClient } from "./apiClient";
import {
  MatchLedgerMode,
  TeamRatingSummary,
  University,
  UniversityMatchHistoryPage,
  UniversityTournamentPlacement,
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
    gameTitle?: string,
    matchMode: MatchLedgerMode = "ALL",
    page = 1,
    limit = 10
  ): Promise<UniversityMatchHistoryPage> => {
    const params = new URLSearchParams();
    if (gameTitle) params.set("gameTitle", gameTitle);
    params.set("matchMode", matchMode);
    params.set("page", String(page));
    params.set("limit", String(limit));
    return apiClient.get<UniversityMatchHistoryPage>(
      `/universities/${id}/matches?${params.toString()}`
    );
  },

  getUniversityTournaments: (
    id: string,
    gameTitle?: string
  ): Promise<UniversityTournamentPlacement[]> => {
    const query = gameTitle ? `?gameTitle=${gameTitle}` : "";
    return apiClient.get<UniversityTournamentPlacement[]>(
      `/universities/${id}/tournaments${query}`
    );
  },

  createUniversity: (name: string, domain: string): Promise<University> =>
    apiClient.post<University>("/universities", { name, domain }),

  updateUniversity: (id: string, updates: { name?: string; domain?: string }): Promise<University> =>
    apiClient.patch<University>(`/universities/${id}`, updates),

  deleteUniversity: (id: string): Promise<void> =>
    apiClient.delete<void>(`/universities/${id}`),
};
