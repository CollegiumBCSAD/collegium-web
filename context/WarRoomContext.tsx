"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { ScrimOffer, TournamentBracketModalProps } from "@/types";

type TournamentTab = NonNullable<TournamentBracketModalProps["initialTab"]>;

interface WarRoomState {
  scrim: ScrimOffer;
  isHost: boolean;
}

interface WarRoomContextType {
  activeWarRoom: WarRoomState | null;
  openWarRoom: (scrim: ScrimOffer, isHost: boolean) => void;
  closeWarRoom: () => void;
  activeTournamentBracketId: string | null;
  activeTournamentTab: TournamentTab;
  /** Opens the global bracket modal; pass "channel" to land in its chat. */
  openTournamentBracket: (tournamentId: string, tab?: TournamentTab) => void;
  closeTournamentBracket: () => void;
}

const WarRoomContext = createContext<WarRoomContextType | undefined>(undefined);

export function WarRoomProvider({ children }: { children: ReactNode }) {
  const [activeWarRoom, setActiveWarRoom] = useState<WarRoomState | null>(null);
  const [activeTournamentBracketId, setActiveTournamentBracketId] = useState<string | null>(null);
  const [activeTournamentTab, setActiveTournamentTab] = useState<TournamentTab>("bracket");

  const openWarRoom = useCallback((scrim: ScrimOffer, isHost: boolean) => {
    setActiveWarRoom({ scrim, isHost });
  }, []);

  const closeWarRoom = useCallback(() => {
    setActiveWarRoom(null);
  }, []);

  const openTournamentBracket = useCallback((tournamentId: string, tab: TournamentTab = "bracket") => {
    setActiveTournamentTab(tab);
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
        activeTournamentTab,
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
