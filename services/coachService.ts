import { apiClient } from "./apiClient";
import {
  CoachApplication,
  CoachInvitation,
  CoachJoinRequest,
  CoachTeam,
  CoachTeamDashboard,
  CoachTeamStats,
  CreatePracticeRecordInput,
  CreatePracticeScheduleInput,
  PracticeRecord,
  PracticeRecordList,
  PracticeScanResult,
  PracticeSchedule,
  ServerGameTitle,
  TeamAuditEntry,
} from "@/types";

export const coachService = {
  // ── Coach hub ──
  getMyTeams: (): Promise<CoachTeam[]> => {
    return apiClient.get<CoachTeam[]>("/coach/teams");
  },

  createTeam: (name: string, gameTitle: ServerGameTitle): Promise<CoachTeam> => {
    return apiClient.post<CoachTeam>("/coach/teams", { name, gameTitle });
  },

  getTeamDashboard: (teamId: string): Promise<CoachTeamDashboard> => {
    return apiClient.get<CoachTeamDashboard>(`/coach/teams/${teamId}`);
  },

  getTeamStats: (teamId: string): Promise<CoachTeamStats> => {
    return apiClient.get<CoachTeamStats>(`/coach/teams/${teamId}/stats`);
  },

  getAuditLog: (teamId: string): Promise<TeamAuditEntry[]> => {
    return apiClient.get<TeamAuditEntry[]>(`/coach/teams/${teamId}/audit-log`);
  },

  getInvitations: (): Promise<CoachInvitation[]> => {
    return apiClient.get<CoachInvitation[]>("/coach/invitations");
  },

  respondToInvitation: (invitationId: string, accept: boolean): Promise<{ success: boolean }> => {
    return apiClient.post<{ success: boolean }>(
      `/coach/invitations/${invitationId}/${accept ? "accept" : "decline"}`,
      {},
    );
  },

  // ── Practice (coach writes) ──
  createSchedule: (teamId: string, dto: CreatePracticeScheduleInput): Promise<PracticeSchedule> => {
    return apiClient.post<PracticeSchedule>(`/coach/teams/${teamId}/practice-schedules`, dto);
  },

  deleteSchedule: (teamId: string, scheduleId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/coach/teams/${teamId}/practice-schedules/${scheduleId}`);
  },

  scanPracticeRecord: (teamId: string, image: File): Promise<PracticeScanResult> => {
    const formData = new FormData();
    formData.append("image", image);
    return apiClient.postForm<PracticeScanResult>(`/coach/teams/${teamId}/practice-records/scan`, formData);
  },

  createPracticeRecord: (teamId: string, dto: CreatePracticeRecordInput): Promise<PracticeRecord> => {
    return apiClient.post<PracticeRecord>(`/coach/teams/${teamId}/practice-records`, dto);
  },

  // Same endpoint the captain uses; the server lets a team's coach manage it too.
  getJoinRequests: (teamId: string, coachId: string): Promise<CoachJoinRequest[]> => {
    return apiClient.get<CoachJoinRequest[]>(`/teams/${teamId}/requests?captainId=${coachId}`);
  },

  // ── Team-side (captain + roster) ──
  getSchedules: (teamId: string): Promise<PracticeSchedule[]> => {
    return apiClient.get<PracticeSchedule[]>(`/teams/${teamId}/practice-schedules`);
  },

  getPracticeRecords: (teamId: string): Promise<PracticeRecordList> => {
    return apiClient.get<PracticeRecordList>(`/teams/${teamId}/practice-records`);
  },

  inviteCoach: (teamId: string, email: string): Promise<{ id: string }> => {
    return apiClient.post<{ id: string }>(`/teams/${teamId}/coach-invitations`, { email });
  },

  removeCoach: (teamId: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/teams/${teamId}/coach`);
  },

  // ── Admin approval queue ──
  getApplications: (status = "PENDING"): Promise<CoachApplication[]> => {
    return apiClient.get<CoachApplication[]>(`/coach-applications?status=${status}`);
  },

  reviewApplication: (userId: string, approve: boolean): Promise<CoachApplication> => {
    return apiClient.patch<CoachApplication>(`/coach-applications/${userId}`, { approve });
  },
};
