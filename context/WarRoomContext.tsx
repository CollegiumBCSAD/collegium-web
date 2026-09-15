"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ScrimOffer } from "@/types";

interface WarRoomState {
  scrim: ScrimOffer;
  isHost: boolean;
}

interface WarRoomContextType {
  activeWarRoom: WarRoomState | null;
  openWarRoom: (scrim: ScrimOffer, isHost: boolean) => void;
  closeWarRoom: () => void;
  activeTournamentBracketId: string | null;
  openTournamentBracket: (tournamentId: string) => void;
  closeTournamentBracket: () => void;
}

const WarRoomContext = createContext<WarRoomContextType | undefined>(undefined);

export function WarRoomProvider({ children }: { children: ReactNode }) {
  const [activeWarRoom, setActiveWarRoom] = useState<WarRoomState | null>(null);
  const [activeTournamentBracketId, setActiveTournamentBracketId] = useState<string | null>(null);

  const openWarRoom = useCallback((scrim: ScrimOffer, isHost: boolean) => {
    setActiveWarRoom({ scrim, isHost });
  }, []);

  const closeWarRoom = useCallback(() => {
    setActiveWarRoom(null);
  }, []);

  const openTournamentBracket = useCallback((tournamentId: string) => {
    setActiveTournamentBracketId(tournamentId);
  }, []);

  const closeTournamentBracket = useCallback(() => {
    setActiveTournamentBracketId(null);
  }, []);

  return (
    <WarRoomContext.Provider
      value={{
        activeWarRoom,
        openWarRoom,
        closeWarRoom,
        activeTournamentBracketId,
        openTournamentBracket,
        closeTournamentBracket,
      }}
    >
      {children}
    </WarRoomContext.Provider>
  );
}

export function useWarRoom() {
  const context = useContext(WarRoomContext);
  if (!context) {
    throw new Error("useWarRoom must be used within a WarRoomProvider");
  }
  return context;
}
