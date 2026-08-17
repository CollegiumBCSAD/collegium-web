import { GameId } from "./games";

export type ScrimStatus = "OPEN" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface ScrimOffer {
  id: string;
  teamId?: string;
  hostTeamName: string;
  universityName: string;
  gameTitle: GameId;
  format: string;
  rankRange: string;
  mapPreference?: string;
  scheduledAt: string;
  notes?: string;
  status: ScrimStatus;
  opponentTeamName?: string;
  opponentTeamId?: string;
  pendingRequests?: Array<{
    teamId: string;
    teamName: string;
    universityName?: string;
    requestedAt?: string;
  }>;
}
