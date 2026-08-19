"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GameId, GameInfo, GAMES, STORAGE_KEY } from "@/lib/games";

interface GameContextType {
  selectedGame: GameId | null;
  selectedGameInfo: GameInfo | null;
  isSelectorOpen: boolean;
  isLoaded: boolean;
  selectGame: (gameId: GameId) => void;
  openGameSelector: () => void;
  closeGameSelector: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [selectedGame, setSelectedGame] = useState<GameId | null>("valo");
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
        setSelectedGame("valo");
      }
      setIsSelectorOpen(false);
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (selectedGame && GAMES[selectedGame]) {
      const accent = GAMES[selectedGame].accentColor;
      document.documentElement.style.setProperty("--primary-brand", accent);
      document.documentElement.style.setProperty("--color-primary-brand", accent);

      let rgb = "229, 58, 76";
      let btnText = "#FFFFFF";

      if (selectedGame === "valo") {
        rgb = "229, 58, 76";
        btnText = "#FFFFFF";
      } else if (selectedGame === "lol") {
        rgb = "0, 163, 255";
        btnText = "#FFFFFF";
      } else if (selectedGame === "codm") {
        rgb = "255, 255, 255";
        btnText = "#0A0C10";
      } else if (selectedGame === "ml") {
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

  const openGameSelector = () => {
    setIsSelectorOpen(true);
  };

  const closeGameSelector = () => {
    if (selectedGame) {
      setIsSelectorOpen(false);
    }
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
