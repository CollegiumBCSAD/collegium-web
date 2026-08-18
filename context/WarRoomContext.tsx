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
}

const WarRoomContext = createContext<WarRoomContextType | undefined>(undefined);

export function WarRoomProvider({ children }: { children: ReactNode }) {
  const [activeWarRoom, setActiveWarRoom] = useState<WarRoomState | null>(null);

  const openWarRoom = useCallback((scrim: ScrimOffer, isHost: boolean) => {
    setActiveWarRoom({ scrim, isHost });
  }, []);

  const closeWarRoom = useCallback(() => {
    setActiveWarRoom(null);
  }, []);

  return (
    <WarRoomContext.Provider value={{ activeWarRoom, openWarRoom, closeWarRoom }}>
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
