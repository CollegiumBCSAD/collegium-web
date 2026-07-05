"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-raised-panel bg-background/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-10">
          <div className="flex items-center gap-8">
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
          <div className="hidden md:flex items-center gap-4">
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
            <hr className="border-raised-panel" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-base font-medium text-secondary-text transition-colors hover:text-foreground"
            >
              Log In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded bg-primary-brand text-base font-bold text-foreground transition-colors hover:bg-opacity-95"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      )}

      <main className="flex-1 flex flex-col">{children}</main>

    </div>
  );
}
