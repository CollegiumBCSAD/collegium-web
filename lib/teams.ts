import { GameId } from "./games";

export interface TeamMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  gameHandle: string;
  preferredRole?: string;
  status: "ACCEPTED" | "PENDING" | "DECLINED";
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

const TEAMS_STORAGE_KEY = "collegium_teams_data";

export function getStoredTeams(): Team[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) {
      const defaultTeams: Team[] = [
        {
          id: "team-umak-1",
          name: "UMAK Herons Alpha",
          gameTitle: "valo",
          universityId: "umak",
          universityName: "University of Makati",
          captainId: "user-1",
          captainName: "Christian Baldesco",
          inviteCode: "umak-alpha-77",
          createdAt: new Date().toISOString(),
          members: [
            {
              id: "mem-1",
              userId: "user-1",
              displayName: "Christian Baldesco",
              email: "baldesco@umak.edu.ph",
              gameHandle: "Heron#UMAK",
              preferredRole: "Duelist",
              status: "ACCEPTED",
              joinedAt: new Date().toISOString(),
            },
          ],
        },
      ];
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(defaultTeams));
      return defaultTeams;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveStoredTeams(teams: Team[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  } catch {}
}

export function getUserActiveTeamForGame(userEmail: string, gameTitle: GameId): Team | null {
  const teams = getStoredTeams();
  return (
    teams.find(
      (t) =>
        t.gameTitle === gameTitle &&
        t.members.some(
          (m) => m.email.toLowerCase() === userEmail.toLowerCase() && m.status === "ACCEPTED"
        )
    ) || null
  );
}

export function createLocalTeam(
  name: string,
  gameTitle: GameId,
  universityName: string,
  userEmail: string,
  userDisplayName: string,
  gameHandle: string,
  preferredRole?: string
): { team?: Team; error?: string } {
  const existingGameTeam = getUserActiveTeamForGame(userEmail, gameTitle);
  if (existingGameTeam) {
    return {
      error: `You are already on an active roster for this game (${existingGameTeam.name}). Leave your current squad before creating a new team for this game.`,
    };
  }

  const teams = getStoredTeams();
  const inviteCode = Math.random().toString(36).substring(2, 8).toLowerCase();
  const newTeam: Team = {
    id: `team-${Date.now()}`,
    name,
    gameTitle,
    universityId: "umak",
    universityName,
    captainId: `user-${Date.now()}`,
    captainName: userDisplayName,
    inviteCode,
    createdAt: new Date().toISOString(),
    members: [
      {
        id: `mem-${Date.now()}`,
        userId: `user-${Date.now()}`,
        displayName: userDisplayName,
        email: userEmail,
        gameHandle,
        preferredRole,
        status: "ACCEPTED",
        joinedAt: new Date().toISOString(),
      },
    ],
  };

  teams.push(newTeam);
  saveStoredTeams(teams);
  return { team: newTeam };
}

export function joinLocalTeam(
  teamId: string,
  inviteCode: string | undefined,
  userEmail: string,
  userDisplayName: string,
  gameHandle: string,
  preferredRole?: string
): { success: boolean; isInstant: boolean; message: string } {
  const teams = getStoredTeams();
  const team = teams.find((t) => t.id === teamId || t.inviteCode === inviteCode);
  if (!team) {
    return { success: false, isInstant: false, message: "Team not found or link expired." };
  }

  const existingMember = team.members.find(
    (m) => m.email.toLowerCase() === userEmail.toLowerCase()
  );

  if (existingMember) {
    if (existingMember.status === "ACCEPTED") {
      return {
        success: false,
        isInstant: false,
        message: `You are already an active athlete on ${team.name}.`,
      };
    }
    if (existingMember.status === "PENDING") {
      return {
        success: false,
        isInstant: false,
        message: `You already have a pending join request awaiting Team Captain approval for ${team.name}.`,
      };
    }
  }

  const existingGameTeam = getUserActiveTeamForGame(userEmail, team.gameTitle);
  if (existingGameTeam) {
    return {
      success: false,
      isInstant: false,
      message: `You are already on an active roster for this game (${existingGameTeam.name}). You cannot join another squad for the same game.`,
    };
  }

  const isInstant = inviteCode === team.inviteCode;
  const status = isInstant ? "ACCEPTED" : "PENDING";

  const newMember: TeamMember = {
    id: `mem-${Date.now()}`,
    userId: `user-${Date.now()}`,
    displayName: userDisplayName,
    email: userEmail,
    gameHandle,
    preferredRole,
    status,
    joinedAt: new Date().toISOString(),
  };

  team.members.push(newMember);
  saveStoredTeams(teams);

  return {
    success: true,
    isInstant,
    message: isInstant
      ? `Successfully joined ${team.name}!`
      : `Join request sent to ${team.name} Captain.`,
  };
}
