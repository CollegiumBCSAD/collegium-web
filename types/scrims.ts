import { GameId } from "./games";

export type ScrimStatus = "OPEN" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface ScrimOffer {
  id: string;
  hostTeamName: string;
  universityName: string;
  gameTitle: GameId;
  format: string;
  rankRange: string;
  scheduledAt: string;
  notes?: string;
  status: ScrimStatus;
  opponentTeamName?: string;
}
