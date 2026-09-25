import { LeaderboardEntry, University } from "@/types";

export const GAME_ID_TO_DISPLAY: Record<string, string> = {
  valo: "VALORANT",
  lol: "LEAGUE OF LEGENDS",
  ml: "MOBILE LEGENDS: BANG BANG",
  codm: "CALL OF DUTY: MOBILE",
};

export function mapUniversitiesToLeaderboard(universities: University[], game: string): LeaderboardEntry[] {
  return universities.map((u, i) => {
    const wins = u.wins ?? 0;
    const losses = u.losses ?? 0;
    const total = wins + losses;
    const winRate = u.winRate ?? (total > 0 ? Math.round((wins / total) * 100) : 0);
    const streak = u.streak ?? (wins > 0 ? `${Math.min(wins, 9)}W` : total > 0 ? `${Math.min(losses, 9)}L` : "-");
    const rd = u.glicko2_rd ?? 350;
    const isProvisional = u.isProvisional ?? (rd >= 100 || total === 0);

    return {
      id: u.id,
      rank: i + 1,
      university: u.name,
      domain: u.domain,
      teamId: u.teamId,
      teamName: u.teamName || `${u.name} Varsity`,
      rating: u.glicko2_rating ?? 1500,
      rd,
      sigma: u.glicko2_sigma ?? 0.06,
      isProvisional,
      winRate,
      wins,
      losses,
      streak,
      game,
    };
  });
}

export function normalizeMockEntries(entries: LeaderboardEntry[], game: string): LeaderboardEntry[] {
  return entries.map((entry, idx) => {
    const winRate = entry.winRate ?? 50;
    const wins = entry.wins ?? Math.round((winRate / 100) * 10);
    const losses = entry.losses ?? Math.max(0, 10 - wins);
    return {
      ...entry,
      rank: idx + 1,
      teamName: entry.teamName || `${entry.university.split(" ")[0]} Varsity`,
      rd: entry.rd ?? 65,
      isProvisional: entry.isProvisional ?? false,
      wins,
      losses,
      game,
    };
  });
}

/** Progressive color from 0% (red) → 50% (amber) → 100% (green). */
export function getWinRateColor(rate: number): string {
  const clamped = Math.max(0, Math.min(100, rate));
  const hue = (clamped / 100) * 142;
  return `hsl(${hue.toFixed(1)}, 85%, 50%)`;
}

/** Podium medal palette by rank. */
export const MEDALS: Record<number, { label: string; color: string; rgb: string }> = {
  1: { label: "Gold", color: "#F5C451", rgb: "245, 196, 81" },
  2: { label: "Silver", color: "#C9D1E0", rgb: "201, 209, 224" },
  3: { label: "Bronze", color: "#D08A55", rgb: "208, 138, 85" },
};

export const PROVISIONAL_HINT = "Rating Deviation > 100. Calibrates with verified tournament matches.";

/** Column layout shared by the rankings table header and its rows. */
export const RANKINGS_GRID =
  "md:grid md:grid-cols-[3.5rem_minmax(0,1fr)_9rem_13rem_4.5rem_4.5rem_1.5rem] md:items-center md:gap-5";
