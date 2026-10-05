import { apiClient } from "./apiClient";
import { CreateRosterChangeInput, RosterChange, RosterMember, TeamRoster } from "@/types";

export const rostersService = {
  // ── Captain / coach ──
  getRoster: (teamId: string): Promise<TeamRoster> => {
    return apiClient.get<TeamRoster>(`/teams/${teamId}/roster`);
  },

  updateMember: (
    teamId: string,
    memberId: string,
    dto: { preferredRole?: string; gameHandle?: string },
  ): Promise<RosterMember> => {
    return apiClient.patch<RosterMember>(`/teams/${teamId}/members/${memberId}`, dto);
  },

  removeMember: (teamId: string, memberId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/teams/${teamId}/members/${memberId}`);
  },

  transferCaptaincy: (teamId: string, memberId: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/teams/${teamId}/members/${memberId}/captain`, {});
  },

  requestChange: (teamId: string, dto: CreateRosterChangeInput): Promise<RosterChange> => {
    return apiClient.post<RosterChange>(`/teams/${teamId}/roster-changes`, dto);
  },

  cancelChange: (teamId: string, changeId: string): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(`/teams/${teamId}/roster-changes/${changeId}/cancel`, {});
  },

  // ── Organizer / admin ──
  getTournamentChanges: (tournamentId: string): Promise<RosterChange[]> => {
    return apiClient.get<RosterChange[]>(`/roster-changes?tournamentId=${tournamentId}`);
  },

  reviewChange: (changeId: string, approve: boolean, note?: string): Promise<{ success: boolean }> => {
    return apiClient.patch<{ success: boolean }>(`/roster-changes/${changeId}`, { approve, note });
  },
};

export const ROSTER_CHANGE_REASONS: Array<{ value: CreateRosterChangeInput["reason"]; label: string }> = [
  { value: "INJURY", label: "Injury" },
  { value: "ILLNESS", label: "Illness" },
  { value: "ACADEMIC", label: "Academic conflict" },
  { value: "PERSONAL_EMERGENCY", label: "Personal emergency" },
  { value: "ELIGIBILITY", label: "Eligibility issue" },
  { value: "TECHNICAL", label: "Technical / connectivity issue" },
  { value: "OTHER", label: "Other" },
];
