"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AdminNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

const NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: "📊" },
  { label: "Universities", href: "/admin/universities", icon: "🎓", badge: 3 },
  { label: "Scrim Board", href: "/admin/scrim-board", icon: "📅", badge: 1 },
  { label: "Tournaments", href: "/admin/tournaments", icon: "🏆", badge: 5 },
  { label: "Users", href: "/admin/users", icon: "👥" },
  { label: "Newsfeed", href: "/admin/newsfeed", icon: "📰" },
  { label: "Disputes", href: "/admin/disputes", icon: "🚩", badge: 2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logoutUser } = useAuth();

  return (
    <aside className="w-[272px] shrink-0 bg-modal-bg border-r border-panel-border flex flex-col min-h-screen">
      <div className="px-6 py-8">
        <Link href="/admin" className="flex items-center gap-2 font-display text-xl font-bold tracking-wider text-foreground">
          <span className="h-5 w-5 rounded-xs bg-primary-brand inline-block" />
          <span>COLLEGIUM</span>
        </Link>
        <p className="mt-1 text-[11px] font-sans font-light tracking-[0.09em] text-secondary-text">
          ADMIN CONSOLE
        </p>
      </div>

      <nav className="flex-1 px-4">
        <p className="px-2 mb-2 text-[11px] font-sans font-light tracking-[0.09em] text-secondary-text">
          QUEUES
        </p>
        <div className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-display font-semibold transition-colors ${
                  isActive
                    ? "bg-primary-brand/20 text-foreground"
                    : "text-secondary-text hover:text-foreground hover:bg-white/5"
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {typeof item.badge === "number" && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-primary-brand/20 text-error text-[10px] font-sans font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {user && (
        <div className="p-4">
          <div className="flex items-center gap-3 rounded-[10px] bg-primary-brand/10 px-3 py-3">
            <div className="w-7 h-7 rounded-full bg-primary-brand text-foreground flex items-center justify-center font-display font-bold text-xs shrink-0">
              {user.displayName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-display font-semibold text-foreground truncate">
                {user.displayName}
              </p>
              <p className="text-[9px] font-sans font-light tracking-[0.07em] text-secondary-text">
                Platform Administrator
              </p>
            </div>
          </div>
          <button
            onClick={() => logoutUser()}
            className="w-full mt-2 text-left px-3 py-1.5 text-[13px] font-display font-semibold text-error hover:text-foreground transition-colors cursor-pointer"
          >
            Log out
          </button>
        </div>
      )}
    </aside>
  );
}
