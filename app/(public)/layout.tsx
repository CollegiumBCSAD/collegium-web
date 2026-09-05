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
import { HomeIcon, PlusIcon, UsersIcon, SwordsIcon, ShieldIcon } from "@/components/ui/Icons";

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
    return <div className="h-9 w-28 rounded-xl bg-[#141A29] border border-[#232D44] animate-pulse" />;
  }

  if (isLoggedIn && user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#1E293B] bg-[#0A0D18] hover:border-primary-brand/60 hover:bg-[#101524] transition-all duration-200 focus:outline-none shadow-md cursor-pointer group"
        >
          {/* Athlete Avatar Badge */}
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center font-display font-black text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-200"
            style={{
              backgroundColor: "var(--primary-brand)",
              color: "var(--game-btn-text, #FFFFFF)",
            }}
          >
            {user.displayName.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight pr-1">
            <span className="text-xs font-display font-black tracking-wide text-white uppercase group-hover:text-primary-brand transition-colors">
              {user.displayName}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {user.university?.name?.split(" ")[0] || "University"} • <span className="text-slate-300 font-bold uppercase">{user.role || "ATHLETE"}</span>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0A0D18] border border-[#1E293B] shadow-2xl z-50 py-2 animate-dropdown-pop overflow-hidden">
            <div className="px-4 py-2 border-b border-[#182338]">
              <span className="text-xs font-display font-black text-white uppercase block">
                {user.displayName}
              </span>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate">
                {user.email}
              </span>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
              >
                <HomeIcon className="w-3.5 h-3.5 text-primary-brand" />
                <span>My Dashboard</span>
              </Link>
              {user.role !== "ADMIN" && user.role !== "ORGANIZER" && (
                <>
                  <Link
                    href="/team/create"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                  >
                    <PlusIcon className="w-3.5 h-3.5 text-primary-brand" />
                    <span>Create Squad</span>
                  </Link>
                  <Link
                    href="/team/join"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                  >
                    <UsersIcon className="w-3.5 h-3.5 text-primary-brand" />
                    <span>Join Squad</span>
                  </Link>
                </>
              )}
              {user.role !== "ORGANIZER" && (
                <Link
                  href="/scrims"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                >
                  <SwordsIcon className="w-3.5 h-3.5 text-primary-brand" />
                  <span>Scrims Board</span>
                </Link>
              )}
              {user.role === "ORGANIZER" && (
                <Link
                  href="/tournaments"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                >
                  <ShieldIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Manage Tournaments</span>
                </Link>
              )}
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#141A29] hover:translate-x-1 transition-all duration-150"
                >
                  <ShieldIcon className="w-3.5 h-3.5 text-primary-brand" />
                  <span>Admin Console</span>
                </Link>
              )}
            </div>
            <div className="pt-1 border-t border-[#182338] px-2 mt-1">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logoutUser();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-all rounded-lg cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link href="/login" className="inline-flex h-9 items-center justify-center tactical-btn-secondary px-5 text-xs font-bold uppercase tracking-wider text-white">
        Log In
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center justify-center game-theme-btn px-5 text-xs font-bold uppercase tracking-wider shadow-md"
      >
        Sign Up
      </Link>
    </div>
  );
}

function NavigationLinks({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const isOrganizer = user?.role === "ORGANIZER";

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Rankings", href: "/leaderboard" },
    ...(isLoggedIn && isOrganizer ? [{ name: "Organize", href: "/dashboard" }] : []),
    ...(isLoggedIn && !isOrganizer ? [{ name: "Scrims", href: "/scrims" }] : []),
    { name: "News", href: "/community" },
  ];

  if (mobile) {
    return (
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`font-display text-sm font-black uppercase tracking-wider transition-all duration-200 px-4 py-2.5 rounded-lg ${
                isActive 
                  ? "text-primary-brand bg-primary-brand/10 border border-primary-brand/30" 
                  : "text-slate-300 hover:text-white"
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
    <nav className="hidden md:flex items-center gap-1 sm:gap-2 h-16">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`font-display text-xs sm:text-sm font-black tracking-wider uppercase transition-all duration-200 relative flex items-center h-10 px-3.5 sm:px-4 cursor-pointer group ${
              isActive
                ? "text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
              {item.name}
            </span>

            {/* Sleek Underline Cyber Lightbar */}
            {isActive && (
              <span 
                className="absolute bottom-1 left-2.5 right-2.5 h-[2px] rounded-full"
                style={{
                  backgroundColor: "var(--primary-brand)",
                  boxShadow: "0 0 10px var(--primary-brand)",
                }}
              />
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

function PublicLayoutContent({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { selectedGame, isLoaded } = useGame();

  const showNavbar = !(pathname === "/" && !selectedGame && isLoaded);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground relative">
      <GameSelectorModal />

      {showNavbar && (
        <header className="sticky top-0 z-40 border-b border-[#182338] bg-[#070912]/95 backdrop-blur-md">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-10">
            <div className="flex items-center gap-6 sm:gap-8">
              <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-black tracking-wider text-white group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="Collegium Logo" className="w-7 h-7 object-contain rounded-md shadow-md shadow-primary-brand/30 transition-transform duration-200 group-hover:scale-110" />
                <span className="group-hover:text-primary-brand transition-colors">COLLEGIUM</span>
              </Link>
              <NavigationLinks />
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <HeaderGameSwitcher />
              <ChatQuickAccess />
              <NotificationBell />
              <HeaderAuthControls />

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl bg-[#141A29] border border-[#232D44] text-slate-300 hover:text-white"
                aria-label="Toggle mobile navigation menu"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="border-b border-[#182338] bg-[#0A0D18] p-4 md:hidden animate-page-slide-in">
              <NavigationLinks mobile onClose={() => setMobileMenuOpen(false)} />
              <div className="mt-4 pt-4 border-t border-[#182338] flex flex-col gap-2">
                <HeaderAuthControls />
              </div>
            </div>
          )}
        </header>
      )}

      <main className="flex flex-1 flex-col">{children}</main>

      <GlobalWarRoomModal />
      <FloatingNotificationToast />
    </div>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <GameProvider>
        <NotificationProvider>
          <WarRoomProvider>
            <PublicLayoutContent>{children}</PublicLayoutContent>
          </WarRoomProvider>
        </NotificationProvider>
      </GameProvider>
    </AuthProvider>
  );
}
