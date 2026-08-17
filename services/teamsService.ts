import { apiClient } from "./apiClient";
import { Team, GameId, JoinRequest } from "@/types";

export interface CreateTeamDto {
  name: string;
  gameTitle: GameId;
  universityId: string;
  captainId: string;
  gameHandle: string;
  preferredRole?: string;
}

export interface JoinTeamDto {
  userId: string;
  inviteCode?: string;
  gameHandle: string;
  preferredRole?: string;
}

export const teamsService = {
  getTeams: (): Promise<Team[]> => {
    return apiClient.get<Team[]>("/teams");
  },

  getTeamById: (id: string): Promise<Team> => {
    return apiClient.get<Team>(`/teams/${id}`);
  },

  getTeamByInviteCode: (code: string): Promise<Team> => {
    return apiClient.get<Team>(`/teams/invite/${code}`);
  },

  createTeam: (dto: CreateTeamDto): Promise<Team> => {
    return apiClient.post<Team>("/teams", dto);
  },

  joinTeam: (teamId: string, dto: JoinTeamDto): Promise<{ success: boolean; message: string; status?: string }> => {
    return apiClient.post<{ success: boolean; message: string; status?: string }>(`/teams/${teamId}/join`, dto);
  },

  getJoinRequests: (teamId: string, captainId: string): Promise<JoinRequest[]> => {
    return apiClient.get<JoinRequest[]>(`/teams/${teamId}/requests?captainId=${captainId}`);
  },

  handleJoinRequest: (
    teamId: string,
    requestId: string,
    captainId: string,
    status: "ACCEPTED" | "DECLINED"
  ): Promise<{ success: boolean; message: string }> => {
    return apiClient.patch<{ success: boolean; message: string }>(`/teams/${teamId}/requests/${requestId}`, {
      captainId,
      accept: status === "ACCEPTED",
    });
  },

  leaveTeam: (teamId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post<{ success: boolean; message: string }>(`/teams/${teamId}/leave`, { userId });
  },
};
