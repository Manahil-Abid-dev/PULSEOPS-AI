"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, Search, Bell, ChevronDown, LogOut, Settings, UserCircle } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { mockDashboardData } from "@/data/mockDashboard";
import { timeAgo, cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { logout } from "@/services/authService";
import type { NotificationLevel } from "@/types/dashboard";

const levelVariant: Record<NotificationLevel, "primary" | "success" | "warning" | "error"> = {
  info: "primary",
  success: "success",
  warning: "warning",
  error: "error",
};

interface TopbarProps {
  title: string;
  onMenuClick: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const [search, setSearch] = useState("");
  const notifications = mockDashboardData.notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Jordan Blake";
  const displayEmail = user?.email || "jordan@pulseops.ai";

  async function handleLogout() {
    try {
      await logout();
      showToast("info", "Signed out", "You've been logged out.");
      router.push("/login");
    } catch {
      showToast("error", "Couldn't sign out", "Please try again.");
    }
  }

  return (
    <header className="sticky top-0 z-40 h-16 shrink-0 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 border-b border-white/5 bg-background/70 backdrop-blur-xl print:hidden">
      <button
        onClick={onMenuClick}
        className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg hover:bg-white/5 text-muted shrink-0"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-base sm:text-lg font-semibold text-foreground tracking-tight shrink-0 hidden sm:block">
        {title}
      </h1>

      <div className="flex-1 max-w-md ml-auto sm:ml-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search orders, customers, products..."
            className="w-full h-10 rounded-xl bg-white/5 border border-white/10 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      <Dropdown
        align="right"
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className="relative h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error ring-2 ring-background" />
            )}
          </button>
        )}
      >
        <div className="px-4 py-2 flex items-center justify-between border-b border-white/5 mb-1">
          <span className="text-sm font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && <Badge variant="primary">{unreadCount} new</Badge>}
        </div>
        {notifications.length === 0 ? (
          <EmptyState title="You're all caught up" description="No new notifications right now." />
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer",
                  !n.read && "bg-white/[0.02]"
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn(
                      "mt-1 h-1.5 w-1.5 rounded-full shrink-0",
                      !n.read ? "bg-primary" : "bg-transparent"
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground/90 truncate">{n.title}</p>
                      <Badge variant={levelVariant[n.level]} className="shrink-0">
                        {n.level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.description}</p>
                    <p className="text-[11px] text-muted/70 mt-1">{timeAgo(n.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Dropdown>

      <Dropdown
        align="right"
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className="flex items-center gap-2 h-10 pl-1 pr-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Avatar name={displayName} size="sm" />
            <span className="hidden sm:block text-sm font-medium text-foreground/90">{displayName}</span>
            <ChevronDown className="hidden sm:block h-4 w-4 text-muted" />
          </button>
        )}
        panelClassName="w-56"
      >
        <div className="px-4 py-3 border-b border-white/5 mb-1">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted">{displayEmail}</p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-white/5 transition-colors"
        >
          <UserCircle className="h-4 w-4" /> Profile
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-2 px-4 py-2 text-sm text-foreground/80 hover:bg-white/5 transition-colors"
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </Dropdown>
    </header>
  );
}
