"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GameId, GameInfo, GAMES, STORAGE_KEY, getGameInfo } from "@/lib/games";
import { useAuth } from "@/context/AuthContext";

interface GameContextType {
  selectedGame: GameId | null;
  selectedGameInfo: GameInfo | null;
  isSelectorOpen: boolean;
  isLoaded: boolean;
  selectGame: (gameId: GameId) => void;
  clearSelectedGame: () => void;
  openGameSelector: () => void;
  closeGameSelector: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let storedGame: GameId | null = null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored in GAMES) {
        storedGame = stored as GameId;
      }
    } catch {}

    queueMicrotask(() => {
      if (storedGame) {
        setSelectedGame(storedGame);
      } else {
        setSelectedGame(null);
      }
      setIsSelectorOpen(false);
      setIsLoaded(true);
    });
  }, []);

  // If user is logged in, sync their athlete game or fallback to valo to prevent null game state
  useEffect(() => {
    if (isLoggedIn && user) {
      const athleteGameTitle =
        user.teamMemberships?.[0]?.team?.gameTitle ||
        user.gameHandles?.[0]?.gameTitle;
      const athleteGameId = athleteGameTitle ? getGameInfo(athleteGameTitle).id : null;

      if (!selectedGame) {
        const gameToSet = athleteGameId || "valo";
        queueMicrotask(() => {
          setSelectedGame(gameToSet);
        });
        try {
          localStorage.setItem(STORAGE_KEY, gameToSet);
        } catch {}
      }
    }
  }, [isLoggedIn, user, selectedGame]);

  useEffect(() => {
    const activeId = selectedGame || "valo";
    if (GAMES[activeId]) {
      const accent = GAMES[activeId].accentColor;
      document.documentElement.style.setProperty("--primary-brand", accent);
      document.documentElement.style.setProperty("--color-primary-brand", accent);

      let rgb = "229, 58, 76";
      let btnText = "#FFFFFF";

      if (activeId === "valo") {
        rgb = "229, 58, 76";
        btnText = "#FFFFFF";
      } else if (activeId === "lol") {
        rgb = "0, 163, 255";
        btnText = "#FFFFFF";
      } else if (activeId === "codm") {
        rgb = "255, 255, 255";
        btnText = "#0A0C10";
      } else if (activeId === "ml") {
        rgb = "245, 158, 11";
        btnText = "#0A0C10";
      }

      document.documentElement.style.setProperty("--game-glow-rgb", rgb);
      document.documentElement.style.setProperty("--game-btn-text", btnText);
    }
  }, [selectedGame]);

  const selectGame = (gameId: GameId) => {
    setSelectedGame(gameId);
    setIsSelectorOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, gameId);
    } catch {}
  };

  const clearSelectedGame = () => {
    setSelectedGame(null);
    setIsSelectorOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const openGameSelector = () => {
    setIsSelectorOpen(true);
  };

  const closeGameSelector = () => {
    if (!selectedGame) {
      setSelectedGame("valo");
    }
    setIsSelectorOpen(false);
  };

  const selectedGameInfo = selectedGame ? GAMES[selectedGame] : null;

  return (
    <GameContext.Provider
      value={{
        selectedGame,
        selectedGameInfo,
        isSelectorOpen,
        isLoaded,
        selectGame,
        clearSelectedGame,
        openGameSelector,
        closeGameSelector,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
