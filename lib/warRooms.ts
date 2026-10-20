import { scrimsService, tournamentsService } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { ScrimOffer, Tournament, UserProfile, WarRoomChannel } from "@/types";

type ChatLine = { text: string; senderName: string; createdAt: string };

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

/** Last line and count of a chat history, for the channel preview. */
function preview(history: ChatLine[]): Pick<WarRoomChannel, "lastMessage" | "lastSender" | "lastMessageTime" | "messageCount"> {
  const latest = history[history.length - 1];
  return {
    messageCount: history.length,
    lastMessage: latest?.text,
    lastSender: latest?.senderName,
    lastMessageTime: latest ? timeOf(latest.createdAt) : undefined,
  };
}

async function scrimChannels(scrims: ScrimOffer[], myTeams: Team[]): Promise<WarRoomChannel[]> {
  const myTeamIds = new Set(myTeams.map((t) => t.id));
  const mine = scrims.filter(
    (s) => (s.teamId && myTeamIds.has(s.teamId)) || (s.opponentTeamId && myTeamIds.has(s.opponentTeamId)),
  );

  return Promise.all(
    mine.map(async (s): Promise<WarRoomChannel> => {
      const isHost = Boolean(s.teamId && myTeamIds.has(s.teamId));
      const myTeam = myTeams.find((t) => t.id === (isHost ? s.teamId : s.opponentTeamId));
      const opponent = isHost
        ? s.opponentTeamName || (s.status === "CONFIRMED" ? "Challenger Squad" : "Awaiting Opponent")
        : s.hostTeamName;
      const history = await scrimsService.getScrimChat(s.id).catch(() => []);
      return {
        id: `scrim-${s.id}`,
        kind: "SCRIM",
        scrim: s,
        isHost,
        title: `vs ${opponent}`,
        myTeamName: myTeam?.name || "Your Squad",
        gameTitle: (s.gameTitle || "VALO").toUpperCase(),
        isLive: s.status === "CONFIRMED",
        ...preview(history),
      };
    }),
  );
}

/**
 * Tournament channels the user belongs in: events they organize, and events a
 * squad of theirs was approved into. Finished events drop off the list.
 */
async function tournamentChannels(tournaments: Tournament[], myTeams: Team[], user: UserProfile): Promise<WarRoomChannel[]> {
  const myTeamIds = new Set(myTeams.map((t) => t.id));
  type App = { userId?: string; teamId?: string; teamName?: string; status?: string };

  const joined = tournaments.flatMap((t) => {
    if (t.status !== "LIVE" && t.status !== "UPCOMING") return [];
    const isOrganizer = t.organizerId === user.id || t.organizer?.id === user.id;
    const app = (t.applications as App[] | undefined)?.find(
      (a) => a.status === "APPROVED" && (a.userId === user.id || Boolean(a.teamId && myTeamIds.has(a.teamId))),
    );
    if (!isOrganizer && !app) return [];
    return [{ t, isOrganizer, teamName: app?.teamName || myTeams.find((m) => m.id === app?.teamId)?.name }];
  });

  return Promise.all(
    joined.map(async ({ t, isOrganizer, teamName }): Promise<WarRoomChannel> => {
      const history = await tournamentsService.getTournamentMessages(t.id);
      return {
        id: `tournament-${t.id}`,
        kind: "TOURNAMENT",
        tournamentId: t.id,
        isHost: isOrganizer,
        title: t.title,
        myTeamName: isOrganizer ? "Organizer" : teamName || "Your Squad",
        gameTitle: (t.gameTitle || t.game || "VALO").toUpperCase(),
        isLive: t.status === "LIVE",
        ...preview(history),
      };
    }),
  );
}

/** Every war room for the user, live ones first, then the busiest. */
export async function loadWarRoomChannels(user: UserProfile): Promise<WarRoomChannel[]> {
  const [scrims, teams, publicTournaments, hosted] = await Promise.all([
    scrimsService.getScrims().catch(() => [] as ScrimOffer[]),
    fetchTeamsApi().catch(() => [] as Team[]),
    tournamentsService.getTournaments(),
    user.role === "ORGANIZER" ? tournamentsService.getMyTournaments() : Promise.resolve([] as Tournament[]),
  ]);

  const myTeams = teams.filter(
    (t) =>
      t.captainId === user.id ||
      t.coachId === user.id ||
      t.members.some((m) => m.userId === user.id && m.status !== "DECLINED"),
  );
  const tournaments = Array.from(new Map([...publicTournaments, ...hosted].map((t) => [t.id, t])).values());

  const [scrimRooms, tournamentRooms] = await Promise.all([
    scrimChannels(scrims, myTeams),
    tournamentChannels(tournaments, myTeams, user),
  ]);

  return [...tournamentRooms, ...scrimRooms].sort(
    (a, b) => Number(b.isLive) - Number(a.isLive) || b.messageCount - a.messageCount,
  );
}
