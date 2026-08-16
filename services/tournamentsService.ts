import { apiClient } from "./apiClient";
import { Tournament, BracketRound, MatchBoxScore } from "@/types";

export const tournamentsService = {
  getTournaments: (): Promise<Tournament[]> => {
    return apiClient.get<Tournament[]>("/tournaments");
  },

  getBracket: (tournamentId: string): Promise<BracketRound[]> => {
    return apiClient.get<BracketRound[]>(`/tournaments/${tournamentId}/bracket`);
  },

  getBoxScore: (matchId: string): Promise<MatchBoxScore> => {
    return apiClient.get<MatchBoxScore>(`/matches/${matchId}/box-score`);
  },
};
