"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { GatewayContextType, GatewayIntent } from "@/types";

const GatewayContext = createContext<GatewayContextType | undefined>(undefined);

export function GatewayProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<GatewayIntent>("signin");
  const [openedOn, setOpenedOn] = useState(pathname);

  // Leaving the page (e.g. a card action navigated) always dismisses the gateway.
  if (openedOn !== pathname) {
    setOpenedOn(pathname);
    setIsOpen(false);
  }

  const openGateway = useCallback((nextIntent: GatewayIntent = "signin") => {
    setIntent(nextIntent);
    setIsOpen(true);
  }, []);

  const closeGateway = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, intent, openGateway, closeGateway }),
    [isOpen, intent, openGateway, closeGateway]
  );

  return <GatewayContext.Provider value={value}>{children}</GatewayContext.Provider>;
}

export function useGateway() {
  const context = useContext(GatewayContext);
  if (!context) {
    throw new Error("useGateway must be used within a GatewayProvider");
  }
  return context;
}
