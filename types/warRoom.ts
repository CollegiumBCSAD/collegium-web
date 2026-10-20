import { ScrimOffer } from "./scrims";

export type WarRoomKind = "SCRIM" | "TOURNAMENT";
export type WarRoomFilter = "ALL" | WarRoomKind;

/** One chat the signed-in user can jump into: a scrim war room or a tournament channel. */
export interface WarRoomChannel {
  id: string;
  kind: WarRoomKind;
  /** Set for scrim rooms. */
  scrim?: ScrimOffer;
  isHost: boolean;
  /** Set for tournament channels. */
  tournamentId?: string;
  /** "vs Opponent" for a scrim, the event name for a tournament. */
  title: string;
  myTeamName: string;
  gameTitle: string;
  lastMessage?: string;
  lastSender?: string;
  lastMessageTime?: string;
  messageCount: number;
  isLive: boolean;
}

export interface WarRoomChannelRowProps {
  channel: WarRoomChannel;
  onOpen: () => void;
}
