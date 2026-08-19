"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GameProvider, useGame } from "@/context/GameContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WarRoomProvider, useWarRoom } from "@/context/WarRoomContext";
import NotificationBell from "@/components/NotificationBell";
import FloatingNotificationToast from "@/components/FloatingNotificationToast";
import ChatQuickAccess from "@/components/ChatQuickAccess";
import ScrimWarRoomModal from "@/components/scrims/ScrimWarRoomModal";
import GameSelectorModal from "@/components/GameSelectorModal";
import HeaderGameSwitcher from "@/components/HeaderGameSwitcher";
import ActiveArenaBanner from "@/components/ActiveArenaBanner";
import { HomeIcon, PlusIcon, UsersIcon, SwordsIcon } from "@/components/ui/Icons";

function HeaderAuthControls() {
  const { user, isLoggedIn, logoutUser, isLoaded } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoaded) {
    return <div className="h-10 w-32 rounded-full bg-raised-panel/60 border border-raised-panel animate-pulse" />;
  }

  if (isLoggedIn && user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 px-4 py-2 rounded-full border border-[#232D44] bg-[#0D121F]/90 hover:bg-[#141A29] hover:border-white/20 transition-all duration-200 focus:outline-none shadow-md cursor-pointer group active:scale-95"
        >
          <div className="w-7 h-7 rounded-full bg-primary-brand text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200">
            {user.displayName.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-sans font-bold text-white">
              {user.displayName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {user.university?.name?.split(" ")[0] || "Athlete"} · {user.role || "Player"}
            </span>
          </div>
          <svg
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
              dropdownOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#1E293B] bg-[#0D121F] shadow-2xl z-50 py-2 animate-dropdown-pop">
            <div className="px-4 py-2 border-b border-[#1C2538]">
              <span className="text-xs font-display font-black text-white uppercase block">
                {user.displayName}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                {user.email}
              </span>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
              >
                <HomeIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>My Dashboard</span>
              </Link>
              <Link
                href="/team/create"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
              >
                <PlusIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>Create Squad</span>
              </Link>
              <Link
                href="/team/join"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
              >
                <UsersIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>Join Squad</span>
              </Link>
              <Link
                href="/scrims"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-sans font-semibold text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
              >
                <SwordsIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>Scrims Board</span>
              </Link>
            </div>
            <div className="pt-1 border-t border-[#1C2538] px-2 mt-1">
              <button
                onClick={() => {
                  logoutUser();
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-sans font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-full border border-raised-panel px-5 text-sm font-bold text-foreground transition-colors hover:bg-raised-panel">
        Log In
      </Link>
      <Link
        href="/register"
        className="inline-flex h-10 items-center justify-center rounded-full game-theme-btn px-5 text-sm font-bold transition-all active:scale-[0.98] shadow-md"
      >
        Sign Up
      </Link>
    </div>
  );
}

function NavigationLinks({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { isLoggedIn } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Rankings", href: "/leaderboard" },
    ...(isLoggedIn ? [{ name: "Scrims", href: "/scrims" }] : []),
    { name: "News", href: "/community" },
  ];

  if (mobile) {
    return (
      <nav className="flex flex-col gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`font-sans text-base font-bold transition-all duration-200 px-3 py-2 rounded-xl ${
                isActive ? "text-primary-brand bg-primary-brand/10 border border-primary-brand/30" : "text-secondary-text hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-1.5 h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-sans text-xs sm:text-sm font-bold tracking-wide uppercase transition-all duration-200 relative flex items-center h-10 px-4 rounded-xl border group ${
              isActive
                ? "text-foreground bg-[#141926]/90 border-[#26314A] shadow-lg shadow-black/40"
                : "text-secondary-text border-transparent hover:text-foreground hover:bg-[#121622]/60 hover:border-[#1E273A]"
            }`}
          >
            <span className="relative z-10 transition-transform duration-200 group-hover:scale-[1.03]">
              {item.name}
            </span>

            {/* Glowing Active Underline Indicator */}
            {isActive && (
              <>
                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-gradient-to-r from-primary-brand/20 via-primary-brand to-primary-brand/20 shadow-[0_0_10px_rgba(229,58,76,0.9)] animate-nav-glow" />
                <span className="absolute inset-0 rounded-xl bg-primary-brand/5 pointer-events-none" />
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function GlobalWarRoomModal() {
  const { activeWarRoom, closeWarRoom } = useWarRoom();

  return (
    <ScrimWarRoomModal
      scrim={activeWarRoom?.scrim ?? null}
      isOpen={!!activeWarRoom}
      onClose={closeWarRoom}
      isHost={activeWarRoom?.isHost ?? false}
    />
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <AuthProvider>
      <GameProvider>
        <NotificationProvider>
        <WarRoomProvider>
          <div className="flex min-h-screen flex-col bg-background text-foreground relative">
            <GameSelectorModal />

            <header className="sticky top-0 z-40 border-b border-raised-panel bg-background/95 backdrop-blur-md">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-10">
                <div className="flex items-center gap-6 sm:gap-8">
                  <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-wider text-foreground group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="Collegium Logo" className="w-7 h-7 object-contain rounded-md shadow-md shadow-primary-brand/30 transition-transform duration-200 group-hover:scale-110" />
                    <span className="group-hover:text-primary-brand transition-colors">COLLEGIUM</span>
                  </Link>
                  <NavigationLinks />
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <HeaderGameSwitcher />
                  <ChatQuickAccess />
                  <NotificationBell />
                  <HeaderAuthControls />

                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl md:hidden border border-raised-panel bg-card-bg hover:bg-raised-panel transition-all"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {mobileMenuOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            {mobileMenuOpen && (
              <div className="md:hidden border-b border-raised-panel bg-[#0C0F17] px-6 py-4 animate-in slide-in-from-top-2 duration-200">
                <NavigationLinks mobile onClose={() => setMobileMenuOpen(false)} />
              </div>
            )}

            <main key={pathname} className="flex-1 flex flex-col animate-page-slide-in">{children}</main>
            <FloatingNotificationToast />
            <GlobalWarRoomModal />
          </div>
        </WarRoomProvider>
        </NotificationProvider>
      </GameProvider>
    </AuthProvider>
  );
}

