"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import GameSelectorModal from "@/components/GameSelectorModal";
import HeaderGameSwitcher from "@/components/HeaderGameSwitcher";

function HeaderAuthControls() {
  const { user, isLoggedIn, logoutUser, isLoaded } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!isLoaded) {
    return <div className="h-9 w-24 rounded-lg bg-raised-panel/60 border border-raised-panel animate-pulse" />;
  }

  if (isLoggedIn && user) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-raised-panel bg-card-bg hover:bg-raised-panel transition-all focus:outline-none"
        >
          <div className="w-6 h-6 rounded-full bg-primary-brand/20 text-primary-brand border border-primary-brand/30 flex items-center justify-center font-display text-xs font-bold uppercase">
            {user.displayName.charAt(0)}
          </div>
          <div className="hidden sm:flex flex-col text-left leading-tight">
            <span className="text-xs font-display font-bold text-foreground uppercase tracking-wide">
              {user.displayName}
            </span>
            <span className="text-[9px] font-sans text-secondary-text tracking-widest uppercase font-semibold">
              {user.role} · {user.university.name.split(" ")[0]}
            </span>
          </div>
          <svg className="w-3.5 h-3.5 text-secondary-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#272B3A] bg-[#0C0F17] shadow-2xl z-50 py-2">
            <div className="px-4 py-2 border-b border-raised-panel">
              <span className="text-xs font-display font-bold text-foreground uppercase block">
                {user.displayName}
              </span>
              <span className="text-[10px] font-sans text-secondary-text block mt-0.5">
                {user.email}
              </span>
            </div>
            <div className="py-1">
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-sans text-secondary-text hover:text-foreground hover:bg-white/5"
              >
                <span>🏠 My Dashboard</span>
              </Link>
              <Link
                href="/team/create"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-sans text-secondary-text hover:text-foreground hover:bg-white/5"
              >
                <span>➕ Create Squad</span>
              </Link>
              <Link
                href="/team/join"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-sans text-secondary-text hover:text-foreground hover:bg-white/5"
              >
                <span>🤝 Join Squad</span>
              </Link>
              <Link
                href="/scrims"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-sans text-secondary-text hover:text-foreground hover:bg-white/5"
              >
                <span>⚔️ Scrims</span>
              </Link>
            </div>
            <div className="pt-1 border-t border-raised-panel px-2 mt-1">
              <button
                onClick={() => {
                  logoutUser();
                  setDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded text-xs font-sans font-semibold text-error hover:bg-error/10 transition-colors"
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
      <Link href="/login" className="inline-flex h-9 items-center justify-center rounded border border-raised-panel px-4 text-sm font-bold text-foreground transition-colors hover:bg-raised-panel">
        Log In
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center justify-center rounded bg-primary-brand px-4 text-sm font-bold text-foreground transition-colors hover:bg-opacity-90"
      >
        Sign Up
      </Link>
    </div>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "Rankings", href: "/leaderboard" },
    { name: "News", href: "/community" },
  ];

  return (
    <AuthProvider>
      <GameProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground relative">
          <GameSelectorModal />

          <header className="sticky top-0 z-40 border-b border-raised-panel bg-background/95 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-10">
              <div className="flex items-center gap-6 sm:gap-8">
                <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-wider text-foreground">
                  <span className="h-5 w-5 rounded-xs bg-primary-brand inline-block" />
                  <span>COLLEGIUM</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6 h-16">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`font-sans text-sm font-medium transition-colors hover:text-foreground relative flex items-center h-full ${
                          isActive ? "text-foreground" : "text-secondary-text"
                        }`}
                      >
                        {item.name}
                        {isActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-brand" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-3 sm:gap-4">
                <HeaderGameSwitcher />
                <HeaderAuthControls />

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded md:hidden border border-raised-panel"
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
            <div className="md:hidden border-b border-raised-panel bg-background px-6 py-4">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`font-sans text-base font-medium transition-colors hover:text-primary-brand ${
                        isActive ? "text-primary-brand" : "text-secondary-text"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </GameProvider>
    </AuthProvider>
  );
}
