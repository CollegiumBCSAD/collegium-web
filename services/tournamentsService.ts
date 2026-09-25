import { apiClient } from "./apiClient";
import {
  Tournament,
  TournamentDetail,
  ParticipatingTeamDetail,
  TournamentApprovalStatus,
  BracketRound,
  BracketSide,
  ClosePlayerStatInput,
  MatchPlayerStat,
  TournamentMatch,
  PendingSquadApplication,
  ScanResult
} from "@/types";

const GAME_DISPLAY: Record<string, { label: string; gradient: string }> = {
  VALORANT: { label: "VALORANT", gradient: "from-[#8E2632] via-[#48161D] to-[#11141C]" },
  LOL: { label: "LEAGUE OF LEGENDS", gradient: "from-[#233568] via-[#141C38] to-[#11141C]" },
  CODM: { label: "CALL OF DUTY: MOBILE", gradient: "from-[#4B5563] via-[#1F2937] to-[#11141C]" },
  MLBB: { label: "MOBILE LEGENDS: BANG BANG", gradient: "from-[#8E6519] via-[#42300E] to-[#11141C]" },
};

const STATUS_DISPLAY: Record<string, TournamentApprovalStatus> = {
  UPCOMING: "UPCOMING",
  ONGOING: "LIVE",
  COMPLETED: "COMPLETED",
  PENDING_APPROVAL: "PENDING_APPROVAL",
  REJECTED: "REJECTED",
};

function detectGameFromText(text: string): { label: string; gradient: string } {
  const upper = text.toUpperCase();
  if (upper.includes("MOBILE LEGENDS") || upper.includes("MLBB") || upper.includes("ML")) {
    return GAME_DISPLAY.MLBB;
  }
  if (upper.includes("LEAGUE OF LEGENDS") || upper.includes("LOL") || upper.includes("RIFT")) {
    return GAME_DISPLAY.LOL;
  }
  if (upper.includes("CALL OF DUTY") || upper.includes("CODM")) {
    return GAME_DISPLAY.CODM;
  }
  return GAME_DISPLAY.VALORANT;
}

interface RawTournament {
  id?: string;
  name?: string;
  gameTitle?: string;
  status?: string;
  image?: string;
  bracketFormat?: string;
  teamQuota?: number;
  rules?: string;
  startDate?: string;
  rejectionReason?: string;
  organizerId?: string;
  organizer?: { id?: string; displayName?: string };
  streamUrl?: string | null;
  streamIsLive?: boolean;
  featuredMatchId?: string | null;
  matches?: Array<{ title?: string; gameTitle?: string }>;
  universities?: Array<{ id?: string; name?: string }>;
  applications?: PendingSquadApplication[];
}

function mapTournaments(data: RawTournament[]): Tournament[] {
  return data.map((t, idx) => {
    const matches = t.matches ?? [];
    const universities = t.universities ?? [];
    // Prefer the real gameTitle field; only guess from text for tournaments
    // that predate it (or were created without a game selection).
    const nameString = (t.name || "") + " " + (matches[0]?.title || "") + " " + (matches[0]?.gameTitle || "");
    const gameDisplay = (t.gameTitle && GAME_DISPLAY[t.gameTitle]) || detectGameFromText(nameString);
    const status: TournamentApprovalStatus = STATUS_DISPLAY[t.status ?? "UPCOMING"] ?? "UPCOMING";

    const statusText =
      status === "PENDING_APPROVAL"
        ? "Awaiting admin approval"
        : status === "REJECTED"
          ? t.rejectionReason
            ? `Rejected: ${t.rejectionReason}`
            : "Rejected by admin"
          : status === "COMPLETED"
            ? "Final standings published"
            : status === "LIVE"
              ? "Bracket in progress"
              : universities.length > 0
                ? `${universities.length} universities registered`
                : "Open for registrations (0 registered)";

    const bulletPoints = [
      universities.length > 0
        ? `${universities.length} participating universities`
        : "Open registration — 0 squads",
    ];
    if (matches.length > 0) {
      bulletPoints.push(`${matches.length} matches played`);
    } else {
      bulletPoints.push("Elimination bracket");
    }

    return {
      id: t.id ?? `tournament-${idx}`,
      title: t.name ?? "Untitled Tournament",
      game: gameDisplay.label,
      gameTitle: t.gameTitle,
      status,
      statusText,
      bulletPoints,
      image: t.image,
      bracketFormat: t.bracketFormat,
      teamQuota: t.teamQuota,
      rules: t.rules,
      startDate: t.startDate,
      applications: t.applications,
      rejectionReason: t.rejectionReason,
      organizerId: t.organizerId,
      organizer: t.organizer,
      streamUrl: t.streamUrl ?? null,
      streamIsLive: Boolean(t.streamIsLive),
      featuredMatchId: t.featuredMatchId ?? null,
      bgGradient: gameDisplay.gradient,
      universities: t.universities as { id: string; name: string }[],
      matches: t.matches as unknown[],
    };
  });
}

interface RawUniversityData {
  id?: string;
  name?: string;
  domain?: string;
  teams?: Array<{
    id?: string;
    name?: string;
    gameTitle?: string;
    captainId?: string;
    captain?: { id?: string; displayName?: string };
    members?: Array<{
      id?: string;
      userId?: string;
      gameHandle?: string;
      preferredRole?: string;
      user?: { id?: string; displayName?: string; role?: string };
    }>;
  }>;
}

export type RawTournamentDetail = Omit<RawTournament, "universities"> & {
  universities?: RawUniversityData[];
  createdAt?: string;
};

function isTeamForTournamentGame(
  teamGame?: string,
  teamName?: string,
  tourneyGame?: string,
  tourneyTitle?: string
): boolean {
  const tGame = (tourneyGame || tourneyTitle || "").toUpperCase();
  const isTourneyValo = tGame.includes("VAL");
  const isTourneyLol = tGame.includes("LOL") || tGame.includes("LEAGUE") || tGame.includes("RIFT");
  const isTourneyMl = tGame.includes("ML") || tGame.includes("MOBILE");
  const isTourneyCod = tGame.includes("COD") || tGame.includes("CALL") || tGame.includes("DUTY");

  const tmGame = (teamGame || "").toUpperCase();
  const tmName = (teamName || "").toUpperCase();

  if (isTourneyValo) {
    if (tmGame) return tmGame.includes("VAL");
    return (
      tmName.includes("VAL") ||
      (!tmName.includes("LEAGUE") &&
        !tmName.includes("MOBILE") &&
        !tmName.includes("CALL") &&
        !tmName.includes("DUTY") &&
        !tmName.includes("ML") &&
        !tmName.includes("LOL") &&
        !tmName.includes("COD"))
    );
  }
  if (isTourneyLol) {
    if (tmGame) return tmGame.includes("LOL") || tmGame.includes("LEAGUE");
    return tmName.includes("LEAGUE") || tmName.includes("LOL");
  }
  if (isTourneyMl) {
    if (tmGame) return tmGame.includes("ML") || tmGame.includes("MOBILE");
    return tmName.includes("MOBILE") || tmName.includes("ML");
  }
  if (isTourneyCod) {
    if (tmGame) return tmGame.includes("COD") || tmGame.includes("CALL");
    return tmName.includes("CALL") || tmName.includes("COD") || tmName.includes("DUTY");
  }

  return true;
}

function mapTournamentDetail(raw: RawTournamentDetail): TournamentDetail {
  const base = mapTournaments([raw as RawTournament])[0];
  const rawUnis: RawUniversityData[] = raw.universities || [];
  const rawApps = ((raw as unknown as { applications?: Array<{
    id: string;
    universityId: string;
    userId: string;
    applicantName: string;
    status: string;
    teamId?: string;
    teamName?: string;
    universityName?: string;
  }> }).applications) || [];
  const approvedApps = rawApps.filter((a) => a.status === "APPROVED");
  const participatingTeams: ParticipatingTeamDetail[] = [];
  const handledAppIds = new Set<string>();
  const handledTeamIds = new Set<string>();

  const tourneyGameTitle = raw.gameTitle || base.gameTitle || base.game || "VALORANT";
  const tourneyName = raw.name || base.title || "";

  const isOrganizerTourney = Boolean(raw.organizerId || raw.organizer?.id);

  if (isOrganizerTourney || approvedApps.length > 0) {
    // 1. First match against university teams where possible
    rawUnis.forEach((uni, uIdx) => {
      const uniName = uni.name || "University Squad";
      const uniId = uni.id || `uni-${uIdx}`;
      const matchingApps = approvedApps.filter(
        (app) => app.universityId === uniId || app.universityId === uni.id
      );

      if (matchingApps.length > 0) {
        // Filter university teams strictly for the tournament's game title
        const gameTeams = (uni.teams || []).filter((tm) =>
          isTeamForTournamentGame(tm.gameTitle, tm.name, tourneyGameTitle, tourneyName)
        );

        gameTeams.forEach((tm, tIdx) => {
          const matchedApp = matchingApps.find(
            (app) =>
              (app.teamId && tm.id === app.teamId) ||
              (app.userId && tm.captainId === app.userId) ||
              (app.userId && tm.members?.some((m) => m.userId === app.userId)) ||
              (app.teamName && tm.name && app.teamName.toLowerCase() === tm.name.toLowerCase())
          );

          if (matchedApp && (!tm.id || !handledTeamIds.has(tm.id))) {
            handledAppIds.add(matchedApp.id);
            if (tm.id) handledTeamIds.add(tm.id);
            participatingTeams.push({
              id: tm.id || `team-${uniId}-${tIdx}`,
              name: tm.name || matchedApp.teamName || `${uniName} Varsity`,
              universityId: uniId,
              universityName: uniName,
              gameTitle: tm.gameTitle || tourneyGameTitle,
              captainName: tm.captain?.displayName || matchedApp.applicantName || "Team Captain",
              captainId: tm.captainId || matchedApp.userId,
              status: "CONFIRMED",
              seed: participatingTeams.length + 1,
              members: (tm.members || []).map((m) => ({
                id: m.id || `m-${m.userId}`,
                userId: m.userId || `u-${Math.random()}`,
                displayName: m.user?.displayName || m.gameHandle || "Varsity Athlete",
                gameHandle: m.gameHandle || m.user?.displayName || "Player",
                preferredRole: m.preferredRole || "Flex",
                isCaptain: tm.captainId === m.userId,
              })),
            });
          }
        });
      }
    });

    // 2. Add any remaining approved applications directly (e.g. custom squads or newly approved)
    approvedApps.forEach((app) => {
      if (!handledAppIds.has(app.id)) {
        handledAppIds.add(app.id);
        const uniName = app.universityName || "Collegiate Varsity";
        participatingTeams.push({
          id: app.teamId || `team-${app.id}`,
          name: app.teamName || `${uniName} Squad`,
          universityId: app.universityId,
          universityName: uniName,
          gameTitle: tourneyGameTitle,
          captainName: app.applicantName || "Team Captain",
          captainId: app.userId,
          status: "CONFIRMED",
          seed: participatingTeams.length + 1,
          members: [
            {
              id: `m-${app.id}-1`,
              userId: app.userId,
              displayName: app.applicantName,
              gameHandle: app.applicantName,
              preferredRole: "Captain",
              isCaptain: true,
            },
            {
              id: `m-${app.id}-2`,
              userId: `u-${app.id}-2`,
              displayName: "Varsity Starter 2",
              gameHandle: "Duelist",
              preferredRole: "Duelist",
            },
            {
              id: `m-${app.id}-3`,
              userId: `u-${app.id}-3`,
              displayName: "Varsity Starter 3",
              gameHandle: "Initiator",
              preferredRole: "Initiator",
            },
            {
              id: `m-${app.id}-4`,
              userId: `u-${app.id}-4`,
              displayName: "Varsity Starter 4",
              gameHandle: "Controller",
              preferredRole: "Controller",
            },
            {
              id: `m-${app.id}-5`,
              userId: `u-${app.id}-5`,
              displayName: "Varsity Starter 5",
              gameHandle: "Sentinel",
              preferredRole: "Sentinel",
            },
          ],
        });
      }
    });
  } else {
    // System Tournaments (pre-seeded with participating university rosters for this game)
    rawUnis.forEach((uni, uIdx) => {
      const uniName = uni.name || "University Squad";
      const uniId = uni.id || `uni-${uIdx}`;
      // Filter university teams strictly for the tournament's game title!
      const gameTeams = (uni.teams || []).filter((tm) =>
        isTeamForTournamentGame(tm.gameTitle, tm.name, tourneyGameTitle, tourneyName)
      );

      if (gameTeams.length > 0) {
        gameTeams.forEach((tm, tIdx) => {
          participatingTeams.push({
            id: tm.id || `team-${uniId}-${tIdx}`,
            name: tm.name || `${uniName} Varsity`,
            universityId: uniId,
            universityName: uniName,
            gameTitle: tm.gameTitle || tourneyGameTitle,
            captainName: tm.captain?.displayName || "Team Captain",
            captainId: tm.captainId,
            status: "CONFIRMED",
            seed: participatingTeams.length + 1,
            members: (tm.members || []).map((m) => ({
              id: m.id || `m-${m.userId}`,
              userId: m.userId || `u-${Math.random()}`,
              displayName: m.user?.displayName || m.gameHandle || "Varsity Athlete",
              gameHandle: m.gameHandle || m.user?.displayName || "Player",
              preferredRole: m.preferredRole || "Flex",
              isCaptain: tm.captainId === m.userId,
            })),
          });
        });
      } else {
        participatingTeams.push({
          id: `team-${uniId}`,
          name: `${uniName} ${tourneyGameTitle}`,
          universityId: uniId,
          universityName: uniName,
          gameTitle: tourneyGameTitle,
          captainName: "Athletic Captain",
          status: "CONFIRMED",
          seed: participatingTeams.length + 1,
          members: [
            { id: `m-${uniId}-1`, userId: `u-${uniId}-1`, displayName: `${uniName} Entry`, gameHandle: "Duelist / Carry", preferredRole: "Duelist", isCaptain: true },
            { id: `m-${uniId}-2`, userId: `u-${uniId}-2`, displayName: `${uniName} Recon`, gameHandle: "Initiator", preferredRole: "Initiator" },
            { id: `m-${uniId}-3`, userId: `u-${uniId}-3`, displayName: `${uniName} Smokes`, gameHandle: "Controller", preferredRole: "Controller" },
            { id: `m-${uniId}-4`, userId: `u-${uniId}-4`, displayName: `${uniName} Anchor`, gameHandle: "Sentinel", preferredRole: "Sentinel" },
            { id: `m-${uniId}-5`, userId: `u-${uniId}-5`, displayName: `${uniName} Flex`, gameHandle: "Sixth Man / Flex", preferredRole: "Flex" },
          ],
        });
      }
    });
  }

  return {
    ...base,
    participatingTeams,
    createdAt: raw.createdAt,
  };
}

function parseServerTournamentsResponse(data: unknown): Tournament[] {
  if (!Array.isArray(data)) {
    return [];
  }
  return mapTournaments(data as RawTournament[]);
}

type RawPlayerStat = {
  universityId?: string | null;
  summonerName: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
};

type RawBracketMatch = {
  id?: string;
  winnerId?: string | null;
  loserId?: string | null;
  isVerified?: boolean;
  round?: number;
  playedAt?: string;
  bracketSide?: BracketSide | null;
  playerStats?: RawPlayerStat[];
};

function groupByRound(matches: RawBracketMatch[]): Map<number, RawBracketMatch[]> {
  const byRound = new Map<number, RawBracketMatch[]>();
  for (const m of matches) {
    const round = m.round ?? 1;
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push(m);
  }
  return byRound;
}

function roundName(
  roundNumber: number,
  positionFromEnd: number,
  matchCount: number,
  side: "WINNERS" | "LOSERS" | undefined,
): string {
  const prefix = side === "LOSERS" ? "LOSERS " : "";
  if (roundNumber === 0) return "GROUP STAGE";
  if (positionFromEnd === 0 && matchCount === 1) {
    // The winners bracket's own last round isn't the tournament decider in
    // Double Elimination — the separate GRAND_FINAL group is (built and
    // labeled by the caller). Only Single Elimination / Round Robin +
    // Playoffs (side === undefined) end on the true grand final here.
    if (side === "LOSERS") return "LOSERS FINAL";
    if (side === "WINNERS") return "WINNERS FINAL";
    return "GRAND FINALS";
  }
  if (positionFromEnd === 1) return `${prefix}SEMIFINALS`;
  if (positionFromEnd === 2 && side !== "LOSERS") return `${prefix}QUARTERFINALS`;
  return `${prefix}ROUND ${roundNumber}`;
}

// Builds one bracket's worth of rounds (winners, losers, or the single
// implicit bracket for Single Elimination / Round Robin + Playoffs) from a
// flat match list, using each match's real round/bracketSide instead of
// slicing a flat list into a fixed 4/2/1 shape.
function buildBracketRounds(
  matches: RawBracketMatch[],
  side: "WINNERS" | "LOSERS" | undefined,
  teamName: (id?: string | null) => string,
): BracketRound[] {
  const byRound = groupByRound(matches);
  const roundNumbers = [...byRound.keys()].sort((a, b) => a - b);

  return roundNumbers.map((roundNumber, idx) => {
    const roundMatches = byRound.get(roundNumber)!;
    const positionFromEnd = roundNumbers.length - 1 - idx;

    const bracketMatches: TournamentMatch[] = roundMatches.map((m, i) => {
      // Later rounds are created up front with neither side filled in. Those
      // are future matches, not live ones - showing them as LIVE would put a
      // pulsing "in progress" badge on a slot nobody has reached yet.
      const isPlaceholder = !m.winnerId && !m.loserId;
      // A bye is verified at generation time and has no opponent at all.
      const isBye = Boolean(m.isVerified && m.winnerId && !m.loserId);

      return {
        id: m.id || `${side || "r"}${roundNumber}-${i}`,
        team1: {
          name: teamName(m.winnerId),
          code: "",
          score: m.isVerified ? 2 : 0,
          isWinner: m.isVerified,
          universityId: m.winnerId ?? undefined,
        },
        team2: {
          name: isBye ? "BYE" : teamName(m.loserId),
          code: "",
          score: 0,
          isWinner: false,
          universityId: m.loserId ?? undefined,
        },
        status: isPlaceholder ? "UPCOMING" : m.isVerified ? "COMPLETED" : "LIVE",
        playedAt: m.playedAt,
        playerStats: (m.playerStats || []).map(
          (p): MatchPlayerStat => ({
            universityId: p.universityId ?? null,
            name: p.summonerName,
            kills: p.kills,
            deaths: p.deaths,
            assists: p.assists,
            win: p.win,
          }),
        ),
      };
    });

    return {
      name: roundName(roundNumber, positionFromEnd, roundMatches.length, side),
      bracketSide: side,
      matches: bracketMatches,
    };
  });
}

function parseServerBracketResponse(data: unknown): BracketRound[] {
  if (Array.isArray(data) && data.length > 0) {
    return data as BracketRound[];
  }

  if (!data || typeof data !== "object") return [];

  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.matches) || obj.matches.length === 0) return [];

  const universitiesMap = new Map<string, string>();
  if (Array.isArray(obj.universities)) {
    obj.universities.forEach((u: unknown) => {
      if (u && typeof u === "object") {
        const uni = u as { id?: string; name?: string };
        if (uni.id && uni.name) universitiesMap.set(uni.id, uni.name);
      }
    });
  }
  const teamName = (id?: string | null) => (id && universitiesMap.get(id)) || "TBD";

  const rawMatches = obj.matches as RawBracketMatch[];
  const losers = rawMatches.filter((m) => m.bracketSide === "LOSERS");
  const grandFinal = rawMatches.filter((m) => m.bracketSide === "GRAND_FINAL");
  // Single Elimination and Round Robin + Playoffs matches carry no
  // bracketSide at all — treat those the same as the winners bracket.
  const winnersOrSingle = rawMatches.filter(
    (m) => m.bracketSide !== "LOSERS" && m.bracketSide !== "GRAND_FINAL",
  );

  return [
    ...buildBracketRounds(winnersOrSingle, losers.length > 0 ? "WINNERS" : undefined, teamName),
    ...buildBracketRounds(losers, "LOSERS", teamName),
    ...(grandFinal.length > 0
      ? buildBracketRounds(grandFinal, undefined, teamName).map((r) => ({
          ...r,
          name: "GRAND FINALS",
          bracketSide: "GRAND_FINAL" as const,
        }))
      : []),
  ];
}

export const tournamentsService = {
  getTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments");
      return parseServerTournamentsResponse(response);
    } catch {
      return [];
    }
  },

  // An empty result from these two is a real "nothing here" state, not a
  // reason to fall back to demo data the way parseServerTournamentsResponse
  // does for the public tournaments page — use mapTournaments() directly.
  getPendingTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments?status=PENDING_APPROVAL");
      return Array.isArray(response) ? mapTournaments(response as RawTournament[]) : [];
    } catch {
      return [];
    }
  },

  getMyTournaments: async (): Promise<Tournament[]> => {
    try {
      const response = await apiClient.get<unknown>("/tournaments/mine");
      return Array.isArray(response) ? mapTournaments(response as RawTournament[]) : [];
    } catch {
      return [];
    }
  },

  getTournamentById: async (tournamentId: string): Promise<TournamentDetail | null> => {
    try {
      const response = await apiClient.get<unknown>(`/tournaments/${tournamentId}`);
      if (!response || typeof response !== "object") return null;
      return mapTournamentDetail(response as RawTournamentDetail);
    } catch {
      return null;
    }
  },

  getAllPendingApplications: async (): Promise<PendingSquadApplication[]> => {
    return apiClient
      .get<PendingSquadApplication[]>("/tournaments/applications/pending")
      .catch(() => []);
  },

  getBracket: async (tournamentId: string): Promise<BracketRound[]> => {
    try {
      const response = await apiClient.get<unknown>(`/tournaments/${tournamentId}/bracket`);
      return parseServerBracketResponse(response);
    } catch {
      return [];
    }
  },

  createTournament: (params: {
    name: string;
    gameTitle?: string;
    imageFile?: File;
    bracketFormat?: string;
    teamQuota?: number;
    rules?: string;
    startDate?: string;
  }): Promise<unknown> => {
    const formData = new FormData();
    formData.append("name", params.name);
    if (params.gameTitle) formData.append("gameTitle", params.gameTitle);
    if (params.imageFile) formData.append("image", params.imageFile);
    if (params.bracketFormat) formData.append("bracketFormat", params.bracketFormat);
    if (params.teamQuota) formData.append("teamQuota", String(params.teamQuota));
    if (params.rules) formData.append("rules", params.rules);
    if (params.startDate) formData.append("startDate", params.startDate);
    return apiClient.postForm("/tournaments", formData);
  },

  updateTournament: (
    tournamentId: string,
    params: {
      name?: string;
      gameTitle?: string;
      imageFile?: File;
      bracketFormat?: string;
      teamQuota?: number;
      rules?: string;
      startDate?: string;
      reapply?: boolean;
    }
  ): Promise<unknown> => {
    const formData = new FormData();
    if (params.name) formData.append("name", params.name);
    if (params.gameTitle) formData.append("gameTitle", params.gameTitle);
    if (params.imageFile) formData.append("image", params.imageFile);
    if (params.bracketFormat) formData.append("bracketFormat", params.bracketFormat);
    if (params.teamQuota) formData.append("teamQuota", String(params.teamQuota));
    if (params.rules !== undefined) formData.append("rules", params.rules);
    if (params.startDate !== undefined) formData.append("startDate", params.startDate);
    if (params.reapply) formData.append("reapply", "true");
    return apiClient.patchForm(`/tournaments/${tournamentId}`, formData);
  },

  updateStream: (
    tournamentId: string,
    payload: {
      streamUrl?: string | null;
      streamIsLive?: boolean;
      featuredMatchId?: string | null;
    }
  ): Promise<unknown> => {
    return apiClient.patch(`/tournaments/${tournamentId}/stream`, payload);
  },

  startTournament: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/start`, {});
  },

  registerTournament: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/register`, {});
  },

  closeMatch: (
    tournamentId: string,
    matchId: string,
    payload: { winnerId: string; players: ClosePlayerStatInput[] }
  ): Promise<unknown> => {
    return apiClient.post(
      `/tournaments/${tournamentId}/matches/${matchId}/close`,
      payload
    );
  },

  // Redraws round 1 at random. The server rejects this once a round 1 result
  // has been reported, so the caller should surface the error message.
  randomizeBracket: (tournamentId: string): Promise<BracketRound[]> => {
    return apiClient
      .post<unknown>(`/tournaments/${tournamentId}/bracket/randomize`, {})
      .then(parseServerBracketResponse);
  },

  closeTournament: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/close`, {});
  },

  ensureWarRoom: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/war-room`, {});
  },

  generateBracket: (
    tournamentId: string,
    payload: {
      seeds?: string[];
      seedingMode?: string;
      eventWeightOverride?: number;
    }
  ): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/generate-bracket`, payload);
  },

  scanScreenshot: async (
    tournamentId: string,
    matchId: string,
    file: File
  ): Promise<ScanResult> => {
    const formData = new FormData();
    formData.append("image", file);
    return apiClient.postForm<ScanResult>(
      `/tournaments/${tournamentId}/matches/${matchId}/scan`,
      formData
    );
  },

  applyForTournament: (
    tournamentId: string,
    teamId?: string,
    teamName?: string
  ): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/apply`, {
      teamId,
      teamName,
    });
  },

  withdrawApplication: (tournamentId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/withdraw`, {});
  },

  getApplications: (tournamentId: string): Promise<unknown[]> => {
    return apiClient.get<unknown[]>(`/tournaments/${tournamentId}/applications`).catch(() => []);
  },

  approveApplication: (tournamentId: string, appId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/applications/${appId}/approve`, {});
  },

  rejectApplication: (tournamentId: string, appId: string): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/applications/${appId}/reject`, {});
  },

  getApplicationRoster: (
    tournamentId: string,
    appId: string
  ): Promise<{
    applicationId: string;
    tournamentId: string;
    teamId: string;
    teamName: string;
    universityId: string;
    universityName: string;
    status: string;
    appliedAt: string;
    applicantName: string;
    roster: Array<{
      userId: string;
      displayName: string;
      gameHandle: string;
      studentId?: string;
      role: string;
      isCaptain: boolean;
      eligibilityStatus: string;
    }>;
  }> => {
    return apiClient.get(`/tournaments/${tournamentId}/applications/${appId}/roster`);
  },

  forfeitMatch: (
    tournamentId: string,
    matchId: string,
    forfeitingUniversityId: string
  ): Promise<unknown> => {
    return apiClient.post(
      `/tournaments/${tournamentId}/matches/${matchId}/forfeit`,
      { forfeitingUniversityId }
    );
  },

  updateMatchStats: (
    tournamentId: string,
    matchId: string,
    dto: {
      winnerId?: string;
      gameDuration?: number;
      players: Array<{
        userId?: string;
        universityId: string;
        name: string;
        kills: number;
        deaths: number;
        assists: number;
        combatScore?: number;
        headshotPct?: number;
        agentName?: string;
      }>;
    }
  ): Promise<unknown> => {
    return apiClient.patch(
      `/tournaments/${tournamentId}/matches/${matchId}/stats`,
      dto
    );
  },

  getTournamentMessages: (tournamentId: string): Promise<Array<{
    id: string;
    tournamentId: string;
    senderId: string;
    senderName: string;
    teamName?: string;
    text: string;
    isPinned: boolean;
    isAnnouncement: boolean;
    createdAt: string;
  }>> => {
    return apiClient
      .get<
        Array<{
          id: string;
          tournamentId: string;
          senderId: string;
          senderName: string;
          teamName?: string;
          text: string;
          isPinned: boolean;
          isAnnouncement: boolean;
          createdAt: string;
        }>
      >(`/tournaments/${tournamentId}/messages`)
      .catch(() => []);
  },

  createTournamentMessage: (
    tournamentId: string,
    dto: { text: string; isPinned?: boolean; isAnnouncement?: boolean }
  ): Promise<unknown> => {
    return apiClient.post(`/tournaments/${tournamentId}/messages`, dto);
  },

  updateTournamentMessage: (
    tournamentId: string,
    messageId: string,
    dto: { text?: string; isPinned?: boolean; isAnnouncement?: boolean }
  ): Promise<unknown> => {
    return apiClient.patch(`/tournaments/${tournamentId}/messages/${messageId}`, dto);
  },

  deleteTournamentMessage: (
    tournamentId: string,
    messageId: string
  ): Promise<void> => {
    return apiClient.delete(`/tournaments/${tournamentId}/messages/${messageId}`);
  },

  deleteTournament: (tournamentId: string): Promise<void> => {
    return apiClient.delete<void>(`/tournaments/${tournamentId}`);
  },
};
