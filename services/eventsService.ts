import { apiClient } from "./apiClient";
import {
  EventBracket,
  EventDocument,
  EventDocumentKind,
  EventInvite,
  EventSummary,
  EventTeam,
  EventTeamStatus,
  SubmitEventTeamPayload,
} from "@/types";

export interface CreateEventPayload {
  name: string;
  gameTitle: string;
  bracketFormat?: string;
  signupsCloseAt?: string;
  rules?: string;
  maxSubs?: number;
}

export interface ReportEventResultPayload {
  winnerId: string;
  scoreA?: number;
  scoreB?: number;
}

export const eventsService = {
  createEvent: (payload: CreateEventPayload) =>
    apiClient.post<EventSummary>("/events", payload),

  getMyEvents: () => apiClient.get<EventSummary[]>("/events"),

  getEvent: (id: string) => apiClient.get<EventSummary>(`/events/${id}`),

  updateEvent: (id: string, payload: Partial<CreateEventPayload> & { status?: string }) =>
    apiClient.patch<EventSummary>(`/events/${id}`, payload),

  getInvite: (code: string) =>
    apiClient.get<EventInvite>(`/events/invite/${code}`),

  submitTeam: (code: string, payload: SubmitEventTeamPayload) =>
    apiClient.post<EventTeam>(`/events/invite/${code}/teams`, payload, true),

  getTeamByToken: (token: string) =>
    apiClient.get<EventTeam>(`/events/teams/${token}`),

  updateTeamByToken: (token: string, payload: Partial<SubmitEventTeamPayload>) =>
    apiClient.patch<EventTeam>(`/events/teams/${token}`, payload),

  getTeamDocuments: (token: string) =>
    apiClient.get<EventDocument[]>(`/events/teams/${token}/documents`),

  uploadTeamDocument: (
    token: string,
    rosterPlayerId: string,
    kind: EventDocumentKind,
    file: File,
  ) => {
    const form = new FormData();
    form.append("rosterPlayerId", rosterPlayerId);
    form.append("kind", kind);
    form.append("file", file);
    return apiClient.postForm<EventDocument>(
      `/events/teams/${token}/documents`,
      form,
    );
  },

  deleteTeamDocument: (token: string, documentId: string) =>
    apiClient.delete<{ deleted: boolean }>(
      `/events/teams/${token}/documents/${documentId}`,
    ),

  getEventTeams: (id: string) =>
    apiClient.get<EventTeam[]>(`/events/${id}/teams`),

  reviewTeam: (
    id: string,
    teamId: string,
    status: EventTeamStatus,
    reviewNote?: string,
  ) =>
    apiClient.patch<EventTeam>(`/events/${id}/teams/${teamId}/review`, {
      status,
      ...(reviewNote ? { reviewNote } : {}),
    }),

  getBracket: (id: string) =>
    apiClient.get<EventBracket>(`/events/${id}/bracket`),

  generateBracket: (id: string) =>
    apiClient.post<EventBracket>(`/events/${id}/bracket`, {}),

  reportResult: (
    id: string,
    matchId: string,
    payload: ReportEventResultPayload,
  ) => apiClient.patch<EventBracket>(`/events/${id}/matches/${matchId}`, payload),

  closeEvent: (id: string) =>
    apiClient.post<{ status: string; documentsPurged: number }>(
      `/events/${id}/close`,
      {},
    ),

  documentUrl: (eventId: string, documentId: string) =>
    `/events/${eventId}/documents/${documentId}`,
};
