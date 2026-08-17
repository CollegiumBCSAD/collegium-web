import { teamsService } from "@/services";
import { GameId, Team, TeamMember, JoinRequest } from "@/types";

export type { Team, TeamMember, JoinRequest };

const TEAMS_STORAGE_KEY = "collegium_teams_data";

const reverseGameTitleMap: Record<string, GameId> = {
  VALORANT: "valo",
  LOL: "lol",
  MLBB: "ml",
  CODM: "codm",
  valo: "valo",
  lol: "lol",
  ml: "ml",
  codm: "codm",
};

interface RawServerTeam {
  id: string;
  name: string;
  gameTitle: string;
  universityId: string;
  captainId: string;
  captainName?: string;
  inviteCode: string;
  createdAt: string;
  university?: { name: string };
  members?: Array<{
    id: string;
    userId?: string;
    displayName?: string;
    email?: string;
    user?: { id?: string; displayName?: string; email?: string };
    gameHandle: string;
    preferredRole?: string;
    status: string;
    createdAt?: string;
    joinedAt?: string;
  }>;
}

export async function fetchTeamsApi(): Promise<Team[]> {
  try {
    const rawData = (await teamsService.getTeams()) as unknown as RawServerTeam[];
    if (Array.isArray(rawData) && rawData.length > 0) {
      const mapped: Team[] = rawData.map((t) => {
        const captainMember = t.members?.find(
          (m) => m.user?.id === t.captainId || m.userId === t.captainId
        );
        const captainName =
          captainMember?.user?.displayName || captainMember?.displayName || t.captainName || "Team Captain";

        return {
          id: t.id,
          name: t.name,
          gameTitle: reverseGameTitleMap[t.gameTitle] || (t.gameTitle as GameId) || "valo",
          universityId: t.universityId,
          universityName: t.university?.name || "Unknown University",
          captainId: t.captainId,
          captainName,
          inviteCode: t.inviteCode,
          createdAt: t.createdAt,
          members: (t.members || []).map((m) => ({
            id: m.id,
            userId: m.user?.id || m.userId || "",
            displayName: m.user?.displayName || m.displayName || "",
            email: m.user?.email || m.email || "",
            gameHandle: m.gameHandle,
            preferredRole: m.preferredRole,
            status: (m.status as "ACCEPTED" | "PENDING" | "DECLINED") || "ACCEPTED",
            joinedAt: m.createdAt || m.joinedAt || new Date().toISOString(),
          })),
        };
      });
      saveStoredTeams(mapped);
      return mapped;
    }
  } catch {}
  return getStoredTeams();
}

export function getStoredTeams(): Team[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!raw) return [];
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
  const targetEmail = userEmail.toLowerCase().trim();
  return (
    teams.find(
      (t) =>
        t.gameTitle === gameTitle &&
        t.members.some(
          (m) => m.email.toLowerCase().trim() === targetEmail && m.status === "ACCEPTED"
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
        email: userEmail.toLowerCase().trim(),
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

  const targetEmail = userEmail.toLowerCase().trim();
  const existingMember = team.members.find(
    (m) => m.email.toLowerCase().trim() === targetEmail
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
    email: targetEmail,
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
