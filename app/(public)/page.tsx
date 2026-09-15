"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import { useAuth } from "@/context/AuthContext";
import { universitiesService, scrimsService, tournamentsService } from "@/services";
import { fetchTeamsApi, Team } from "@/lib/teams";
import { University, ScrimOffer, Tournament, GameId } from "@/types";
import { mockNewsArticles } from "@/lib/mock/news";
import GameSelectorLanding from "@/components/GameSelectorLanding";
import MatchBoxScoreModal from "@/components/MatchBoxScoreModal";
import AthleteHomePage from "@/components/home/AthleteHomePage";
import PublicEsportsHub from "@/components/home/PublicEsportsHub";
import { HomeMatchItem } from "@/components/home/HomeMatchesHub";

export default function LandingPage() {
  const { selectedGame, selectedGameInfo, selectGame, openGameSelector, isLoaded } = useGame();
  const { user, isLoggedIn } = useAuth();
  const activeGame: GameId = selectedGame || "valo";

  const [universities, setUniversities] = useState<University[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [scrims, setScrims] = useState<ScrimOffer[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [realMatches, setRealMatches] = useState<HomeMatchItem[]>([]);

  // Modal inspection state for Box Score
  const [selectedMatch, setSelectedMatch] = useState<HomeMatchItem | null>(null);
  const [boxScoreOpen, setBoxScoreOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      universitiesService.getUniversities(),
      fetchTeamsApi(),
      scrimsService.getScrims(),
      tournamentsService.getTournaments(),
    ]).then(([uniRes, teamsRes, scrimsRes, tourneyRes]) => {
      if (!isMounted) return;
      if (uniRes.status === "fulfilled") setUniversities(uniRes.value || []);
      if (teamsRes.status === "fulfilled") setTeams(teamsRes.value || []);
      if (scrimsRes.status === "fulfilled") setScrims(scrimsRes.value || []);
      if (tourneyRes.status === "fulfilled") setTournaments(tourneyRes.value || []);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real matches for active tournaments
  useEffect(() => {
    if (tournaments.length === 0) return;

    let isMounted = true;
    Promise.allSettled(
      tournaments.map(async (t): Promise<HomeMatchItem[]> => {
        try {
          const rounds = await tournamentsService.getBracket(t.id);
          const gameId: GameId =
            t.gameTitle?.toLowerCase().includes("lol") || t.game?.toLowerCase().includes("league")
              ? "lol"
              : t.gameTitle?.toLowerCase().includes("cod") || t.game?.toLowerCase().includes("call")
              ? "codm"
              : t.gameTitle?.toLowerCase().includes("ml") || t.game?.toLowerCase().includes("mobile")
              ? "ml"
              : "valo";

          return rounds.flatMap((round) =>
            round.matches.map(
              (m): HomeMatchItem => ({
                ...m,
                tournamentTitle: t.title,
                gameId,
                stageName: round.name,
              })
            )
          );
        } catch {
          return [];
        }
      })
    ).then((results) => {
      if (!isMounted) return;
      const allMatches: HomeMatchItem[] = results.flatMap((r) =>
        r.status === "fulfilled" ? r.value : []
      );
      setRealMatches(allMatches);
    });

    return () => {
      isMounted = false;
    };
  }, [tournaments]);

  const stats = useMemo(() => {
    const uniCount = universities.length;
    const teamCount = teams.length;
    const matchCount = realMatches.length + scrims.length;

    return [
      { value: uniCount.toLocaleString(), label: "UNIVERSITIES" },
      { value: teamCount.toLocaleString(), label: "VARSITY SQUADS" },
      { value: matchCount.toLocaleString(), label: "MATCHES LOGGED" },
    ];
  }, [universities, teams, realMatches, scrims]);

  const handleOpenBoxScore = (match: HomeMatchItem) => {
    setSelectedMatch(match);
    setBoxScoreOpen(true);
  };

  if (isLoaded && !selectedGame) {
    return <GameSelectorLanding />;
  }

  // Athletes see the original athlete homepage
  const isAthlete = isLoggedIn && user?.role === "ATHLETE";

  if (isAthlete) {
    return (
      <AthleteHomePage
        user={user}
        activeGame={activeGame}
        selectedGameInfo={selectedGameInfo}
        openGameSelector={openGameSelector}
        selectGame={selectGame}
        stats={stats}
        teams={teams}
        tournaments={tournaments}
        scrims={scrims}
        universities={universities}
        articles={mockNewsArticles}
      />
    );
  }

  // Non-athletes (and visitors) see the redesigned VLR.gg / Gankster.gg esports hub
  return (
    <>
      <PublicEsportsHub
        user={user}
        activeGame={activeGame}
        selectedGameInfo={selectedGameInfo}
        openGameSelector={openGameSelector}
        selectGame={selectGame}
        stats={stats}
        matches={realMatches}
        articles={mockNewsArticles}
        universities={universities}
        scrims={scrims}
        tournaments={tournaments}
        teams={teams}
        onOpenBoxScore={handleOpenBoxScore}
      />

      {/* Match Box Score Modal */}
      {selectedMatch && (
        <MatchBoxScoreModal
          isOpen={boxScoreOpen}
          onClose={() => setBoxScoreOpen(false)}
          title={selectedMatch.tournamentTitle || "MATCH BOX SCORE"}
          subtitle={`${selectedMatch.stageName || "QUARTERFINALS"} • ${selectedMatch.timeLabel || "SERIES"}`}
          matchInfo={{
            team1Name: selectedMatch.team1.name,
            team2Name: selectedMatch.team2.name,
            team1Score: selectedMatch.team1.score ?? 0,
            team2Score: selectedMatch.team2.score ?? 0,
            isTeam1Winner: selectedMatch.team1.isWinner,
            isTeam2Winner: selectedMatch.team2.isWinner,
            status: selectedMatch.status,
            playerStats: selectedMatch.playerStats,
          }}
        />
      )}
    </>
  );
}
