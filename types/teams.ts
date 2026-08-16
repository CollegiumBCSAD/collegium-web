import { GameId } from "./games";

export type TeamMemberStatus = "ACCEPTED" | "PENDING" | "DECLINED";

export interface TeamMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  gameHandle: string;
  preferredRole?: string;
  status: TeamMemberStatus;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  gameTitle: GameId;
  universityId: string;
  universityName: string;
  captainId: string;
  captainName: string;
  inviteCode: string;
  createdAt: string;
  members: TeamMember[];
}

export interface JoinRequest {
  id: string;
  teamId: string;
  teamName: string;
  userId: string;
  displayName: string;
  email: string;
  gameHandle: string;
  preferredRole?: string;
  createdAt: string;
}

export interface CaptainRequest {
  id: string;
  teamId: string;
  teamName: string;
  applicantName: string;
  gameHandle: string;
  preferredRole?: string;
  createdAt: string;
}
